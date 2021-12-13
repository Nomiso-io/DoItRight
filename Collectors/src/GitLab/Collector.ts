import * as HttpRequest from '../utils/httpRequest';
import { getLogger, config, getTableNameForOrg } from '../utils';
import * as esDBFuncs from '../elasticsearch/esFuncs';
import { getLastState, setLastState } from '../elasticsearch';
import { GLconfig, IGitLabJobInfo } from './GLconfig';
import { CommitDatabaseDataItem, COMMIT_STATUS_FAILED, COMMIT_STATUS_INPROGRESS, COMMIT_STATUS_SUCCESS, RepoDatabaseDataItem, STATE_ACCEPTED, STATE_REJECTED, STATUS_CLOSED, STATUS_OPEN } from '../models';

const getReqMethod = 'GET';
const colLogger = getLogger(GLconfig.name);

//callback is a method which takes err and data as parameter
module.exports = (input: any, callback: (err: any, data: any) => void) => {
	try {
        getDataFromGitLab(input)
		.then(() => callback(null, 'GitLab Collector returning'));
	} catch(err) {
		colLogger.error({err}, 'GitLab Collector returning with error');
		callback(new Error('GitLab Collector returning with error'), null);
	}
}

async function getDataFromGitLab(jobDetails: IGitLabJobInfo) {
	colLogger.info({jobDetails: jobDetails}, 'Gitlab Collector executing.');
	let projects: string[] = jobDetails.projectName.value;
	if((projects.length > 0) && (projects[0] === 'All')) {
		projects = Object.keys(jobDetails.projectName.options);
	}
	projects.forEach((proj: string) => {
		getDataFromGitLabForProj(jobDetails, proj);
		getCommitsFromGitLabForProj(jobDetails, proj);
	})
}

async function getDataFromGitLabForProj(jobDetails: IGitLabJobInfo, projId: string) {
	//get last fetched time from sate
	const lastState = await getLastState({
		toolName: GLconfig.name,
		teamId: jobDetails.teamId,
		project: projId
	});
	colLogger.info({lastState: lastState});

	const baseURL = `${jobDetails.url.value}/api/v4/projects/${projId}/merge_requests?scope=all`;
	const now: Date = new Date(Date.now());
	const toDateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}T${now.getHours()}:${now.getMinutes()}:00Z`;

	//get all issues in system
	// TODO: created_before and created_after are not available. use something alternate
	let createdURL = `${baseURL}&created_before=${toDateStr}`;
	let updatedURL = `${baseURL}&updated_before=${toDateStr}`;

	if(lastState) {
		//get all issues that were updated after last accessed
		const from: Date = new Date(lastState.lastAccessed);
		const fromDateStr = `${from.getFullYear()}-${from.getMonth() + 1}-${from.getDate()}T${from.getHours()}:${from.getMinutes()}:00Z`;
		createdURL = `${baseURL}&created_after=${fromDateStr}&created_before=${toDateStr}`;
		updatedURL = `${baseURL}&updated_after=${fromDateStr}&updated_before=${toDateStr}`;
	}
	getDataFromGitLabWithURL(jobDetails, projId, createdURL, '1');

	getDataFromGitLabWithURL(jobDetails, projId, updatedURL, '1');

	//store last fetched time in state
	const newLastState = {
		toolName: GLconfig.name, 
		teamId: jobDetails.teamId,
		project: projId,
		lastAccessed: now.getTime()
	};
    colLogger.info({newLastState: newLastState});
	setLastState(newLastState);
}

async function getDataFromGitLabWithURL(jobDetails: IGitLabJobInfo, projId: string, url: string, pageNum: string) {
	const header = { 'PRIVATE-TOKEN': jobDetails.appToken.value, Accept: '*/*', 'User-Agent': 'nodejs' };
	const mergeReqUrl = `${url}&page=${pageNum}&per_page=100`;
	HttpRequest.httpRequest(getReqMethod, mergeReqUrl, undefined, undefined, header)
	.then((mergeReqRes: any) => {
		colLogger.info({url: mergeReqUrl, header: header, response: {statusCode: mergeReqRes.statusCode, headers: mergeReqRes.headers}});
		if(mergeReqRes.statusCode < 200 || mergeReqRes.statusCode >= 300) {
			const err: Error = new Error(`Error: Received response ${mergeReqRes.statusCode} from ${mergeReqUrl}`);
			colLogger.error({err});
//			throw err;
		} else {
			try {
				const mergeReqList = JSON.parse(mergeReqRes.body);
				colLogger.info({url: mergeReqUrl, mergeReqList: mergeReqList});
				mergeReqList.forEach((mergeData: any) => {
					storeInDB(jobDetails, jobDetails.projectName.options[projId], mergeData);
				});

				if(mergeReqRes.headers['x-next-page'] !== '') {
					getDataFromGitLabWithURL(jobDetails, projId, url, mergeReqRes.headers['x-next-page'])
				}	  
			} catch (err) {
				colLogger.error({err, url: mergeReqUrl}, 'Error while parsing response');
//				throw err;
			}
		}
	})
	.catch((err) => {
		colLogger.error({err, url: mergeReqUrl}, 'Error while sending request');
//		throw err;
	})
}

function storeInDB(jobDetails: IGitLabJobInfo, projName: string, mergeData: any) {
	const filters: any[] = [
		{ term: { teamId: jobDetails.teamId } },
		{ term: { servicePath: jobDetails.servicePath } },
		{ term: { projectName: projName } },
		{ term: { repoName: projName }},
		{ term: { pullId: mergeData.id } }
	];

	const item: RepoDatabaseDataItem = {
		teamId: jobDetails.teamId,
		servicePath: jobDetails.servicePath,
		projectName: projName,
		pullId: mergeData.id,
		raisedBy: mergeData.author.name,
		raisedOn: Math.round(new Date(mergeData.created_at).getTime() / 1000),
		repoName: projName,
		status: ((mergeData.state === 'merged') || (mergeData.state === 'closed')) ? STATUS_CLOSED : STATUS_OPEN,
//		url: mergeData.author.web_url
		url: mergeData.web_url
	};
	if((mergeData.updatedDate) && (mergeData.updatedDate !== mergeData.createdDate)) {
		item.reviewedOn = Math.round(new Date(mergeData.merged_at).getTime() / 1000);
	}
	if(mergeData.state === 'merged') {
		item.acceptState = STATE_ACCEPTED;
		item.reviewedOn = Math.round(new Date(mergeData.merged_at).getTime() / 1000);
	}
	if((mergeData.state === 'closed') && (! item.acceptState)) {
		item.acceptState = STATE_REJECTED;
		item.reviewedOn = Math.round(new Date(mergeData.closed_at).getTime() / 1000);
	}

	const indexName = getTableNameForOrg(config.repoIndex);
	colLogger.info({item, filters}, `Storing item in ${indexName}`);
	esDBFuncs.updateOrInsert(indexName, filters, [], item);
}

// commits fetching code
async function getCommitsFromGitLabForProj(jobDetails: IGitLabJobInfo, projId: string) {
	//get last fetched time from sate
/*	const lastState = await getLastState({
		toolName: GLconfig.name,
		teamId: jobDetails.teamId,
		project: projId
	});
	colLogger.info({lastState: lastState});
*/
	const baseURL = `${jobDetails.url.value}/api/v4/projects/${projId}/repository/commits?ref_name=${jobDetails.ref.value}`;
	const now: Date = new Date(Date.now());
	const toDateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}T${now.getHours()}:${now.getMinutes()}:00Z`;

	//get all issues in system
	let createdURL = `${baseURL}&until=${toDateStr}`;

/*	if(lastState) {
		//get all issues that were updated after last accessed
		const from: Date = new Date(lastState.lastAccessed);
		const fromDateStr = `${from.getFullYear()}-${from.getMonth() + 1}-${from.getDate()}T${from.getHours()}:${from.getMinutes()}:00Z`;
		createdURL = `${baseURL}&since=${fromDateStr}&until=${toDateStr}`;
		updatedURL = `${baseURL}&since=${fromDateStr}&until=${toDateStr}`;
	}
*/
	getCommitsFromGitLabWithURL(jobDetails, projId, createdURL, '1');

	//store last fetched time in state
/*	const newLastState = {
		toolName: GLconfig.name, 
		teamId: jobDetails.teamId,
		project: projId,
		lastAccessed: now.getTime()
	};
    colLogger.info({newLastState: newLastState});
	setLastState(newLastState);
*/
}

async function getCommitsFromGitLabWithURL(jobDetails: IGitLabJobInfo, projId: string, url: string, pageNum: string) {
	const header = { 'PRIVATE-TOKEN': jobDetails.appToken.value, Accept: '*/*', 'User-Agent': 'nodejs' };
	const commitsUrl = `${url}&page=${pageNum}&per_page=100`;
	HttpRequest.httpRequest(getReqMethod, commitsUrl, undefined, undefined, header)
	.then((commitsRes: any) => {
		colLogger.info({url: commitsUrl, header: header, response: {statusCode: commitsRes.statusCode, headers: commitsRes.headers}});
		if(commitsRes.statusCode < 200 || commitsRes.statusCode >= 300) {
			const err: Error = new Error(`Error: Received response ${commitsRes.statusCode} from ${commitsUrl}`);
			colLogger.error({err});
//			throw err;
		} else {
			try {
				const commitsList = JSON.parse(commitsRes.body);
				colLogger.info({url: commitsUrl, mergeReqList: commitsList});
				commitsList.forEach((commitData: any) => {
					getCommitDetailsFromGitLab(jobDetails, projId, commitData.id);
				});

				if(commitsRes.headers['x-next-page'] !== '') {
					getCommitsFromGitLabWithURL(jobDetails, projId, url, commitsRes.headers['x-next-page'])
				}	  
			} catch (err) {
				colLogger.error({err, url: commitsUrl}, 'Error while parsing response');
//				throw err;
			}
		}
	})
	.catch((err) => {
		colLogger.error({err, url: commitsUrl}, 'Error while sending request');
//		throw err;
	})
}

async function getCommitDetailsFromGitLab(jobDetails: IGitLabJobInfo, projId: string, commitId: string) {
	const header = { 'PRIVATE-TOKEN': jobDetails.appToken.value, Accept: '*/*', 'User-Agent': 'nodejs' };
	const commitUrl = `${jobDetails.url.value}/api/v4/projects/${projId}/repository/commits/${commitId}`;
	HttpRequest.httpRequest(getReqMethod, commitUrl, undefined, undefined, header)
	.then((commitRes: any) => {
		colLogger.info({url: commitUrl, header: header, response: {statusCode: commitRes.statusCode, headers: commitRes.headers}});
		if(commitRes.statusCode < 200 || commitRes.statusCode >= 300) {
			const err: Error = new Error(`Error: Received response ${commitRes.statusCode} from ${commitUrl}`);
			colLogger.error({err});
//			throw err;
		} else {
			try {
				const commitDetails = JSON.parse(commitRes.body);
				colLogger.info({url: commitUrl, mergeReqList: commitDetails});
				storeCommitsInDB(jobDetails, jobDetails.projectName.options[projId], commitDetails);
			} catch (err) {
				colLogger.error({err, url: commitUrl}, 'Error while parsing response');
//				throw err;
			}
		}
	})
	.catch((err) => {
		colLogger.error({err, url: commitUrl}, 'Error while sending request');
//		throw err;
	})
}

function storeCommitsInDB(jobDetails: IGitLabJobInfo, projName: string, commitData: any) {
	const filters: any[] = [
		{ term: { teamId: jobDetails.teamId } },
		{ term: { servicePath: jobDetails.servicePath } },
		{ term: { projectName: projName } },
		{ term: { repoName: projName }},
		{ term: { commitId: commitData.id } }
	];

	const item: CommitDatabaseDataItem = {
		teamId: jobDetails.teamId,
		servicePath: jobDetails.servicePath,
		projectName: projName,
		repoName: projName,
		commitId: commitData.id,
		commitDate: Math.round(new Date(commitData.committed_date).getTime() / 1000),
		committedBy: commitData.committer_name,
		url: commitData.web_url
	};

	if(commitData.last_pipeline) {
		item.pipelineId = commitData.last_pipeline.id;
		item.pipelineStartDate = Math.round(new Date(commitData.last_pipeline.created_at).getTime() / 1000);
		item.ref = commitData.last_pipeline.ref;
		item.pipelineStatus = (commitData.last_pipeline.status === 'success') ?
								COMMIT_STATUS_SUCCESS :
								((commitData.last_pipeline.status === 'failed') || (commitData.last_pipeline.status === 'canceled')) ?
									COMMIT_STATUS_FAILED :
									COMMIT_STATUS_INPROGRESS;

		if((item.pipelineStatus !== COMMIT_STATUS_INPROGRESS) && (commitData.last_pipeline.updated_at)) {
			item.pipelineEndDate = Math.round(new Date(commitData.last_pipeline.updated_at).getTime() / 1000);
		}
	}

	const indexName = getTableNameForOrg(config.gitlabCommitIndex);
	colLogger.info({item, filters}, `Storing item in ${indexName}`);
	esDBFuncs.updateOrInsert(indexName, filters, [], item);
}
