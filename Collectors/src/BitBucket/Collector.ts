import * as HttpRequest from '../utils/httpRequest';
import { getLogger, config, getTableNameForOrg } from '../utils';
import * as esDBFuncs from '../elasticsearch/esFuncs';
//import { getLastState, setLastState } from '../elasticsearch';
import { BBconfig, IBitBucketJobInfo } from './BBconfig';
import { RepoDatabaseDataItem, STATE_ACCEPTED, STATE_REJECTED, STATUS_CLOSED, STATUS_OPEN } from '../models';

/*interface ESRepoDatabaseDataItem {
  _id: string;
  _index: string;
  _score: number;
  _source: RepoDatabaseDataItem;
  _type: string;
}*/

const getReqMethod = 'GET';
const colLogger = getLogger(BBconfig.name);

//callback is a method which takes err and data as parameter
module.exports = (input: any, callback: (err: any, data: any) => void) => {
	try {
        getDataFromBitBucket(input)
		.then(() => callback(null, 'BitBucket Collector returning'));
	} catch(err) {
		colLogger.error({err}, 'BitBucket Collector returning with error');
		callback(new Error('BitBucket Collector returning with error'), null);
	}
}

async function getDataFromBitBucket(jobDetails: IBitBucketJobInfo) {
	colLogger.info({jobDetails: jobDetails}, 'BitBucket Collector executing.');
	let projects: string[] = jobDetails.projectName.value;
	if((projects.length > 0) && (projects[0] === 'All')) {
		projects = Object.keys(jobDetails.projectName.options);
	}
	projects.forEach((proj: string) => {
		getDataFromBitBucketForProj(jobDetails, proj, 0);
	})
}

async function getDataFromBitBucketForProj(jobDetails: IBitBucketJobInfo, projName: string, start: number) {
	//get last fetched time from sate
/*	const lastState = await getLastState({
		toolName: BBconfig.name,
		teamId: jobDetails.teamId,
		project: jobDetails.projectName.value
	});
//	colLogger.info({lastState: lastState});
*/
	const auth = `${jobDetails.email.value}:${jobDetails.appToken.value}`;
	const encodedProjName = encodeURI(projName);
	const repoUrl = `${jobDetails.url.value}/rest/api/latest/projects/${encodedProjName}/repos?start=${start}&limit=100`;
	HttpRequest.httpRequest(getReqMethod, repoUrl, null, auth)
	.then((repoRes: any) => {
		colLogger.info({url: repoUrl, auth: auth, response: {statusCode: repoRes.statusCode, headers: repoRes.headers}});
		if(repoRes.statusCode < 200 || repoRes.statusCode >= 300) {
			const err: Error = new Error(`Error: Received response ${repoRes.statusCode} from ${repoUrl}`);
			colLogger.error({err});
//			throw err;
		} else {
			const repoData = JSON.parse(repoRes.body);
			colLogger.info({url: repoUrl, repoData: repoData});
			const count = repoData.size;
			for(let i = 0; i < count; i+= 1) {
				getDataFromBitBucketForRepo(jobDetails, projName, repoData.values[i].slug, 0);
			}

			if(! repoData.isLastPage) {
				getDataFromBitBucketForProj(jobDetails, projName, start + count)
			}
		}
	})
	.catch((err) => {
		colLogger.error({err, url: repoUrl}, 'Error while sending request');
		throw err;
	})
	
	//store last fetched time in state
/*	const newLastState = {
		toolName: BBconfig.name, 
		teamId: jobDetails.teamId,
		project: jobDetails.projectName.value,
//		url: jobDetails.url.value,
		lastAccessed: now.getTime()
	};
    colLogger.info({newLastState: newLastState});
	setLastState(newLastState);
*/
}

async function getDataFromBitBucketForRepo(jobDetails: IBitBucketJobInfo, projName: string, repoSlug: string, start: number) {
	//TODO: data will be paged, so send request till there is no more data
	const auth = `${jobDetails.email.value}:${jobDetails.appToken.value}`;
	const encodedProjName = encodeURI(projName);
	const pullUrl = `${jobDetails.url.value}/rest/api/latest/projects/${encodedProjName}/repos/${repoSlug}/pull-requests?state=ALL&start=${start}&limit=1`;
	HttpRequest.httpRequest(getReqMethod, pullUrl, null, auth)
	.then((pullRes: any) => {
		colLogger.info({url: pullUrl, auth: auth, response: {statusCode: pullRes.statusCode, headers: pullRes.headers}});
		if(pullRes.statusCode < 200 || pullRes.statusCode >= 300) {
			const err: Error = new Error(`Error: Received response ${pullRes.statusCode} from ${pullUrl}`);
			colLogger.error({err});
//			reject(err);
		} else {
			const pullData = JSON.parse(pullRes.body);
			colLogger.info({url: pullUrl, pullData: pullData});
			if(pullData.size > 0) {
				storeInDB(jobDetails, projName, repoSlug, pullData.values[0]);
			}
			if(! pullData.isLastPage) {
				getDataFromBitBucketForRepo(jobDetails, projName, repoSlug, start + 1)
			}
		}
	})
	.catch((err) => {
		colLogger.error({err, url: pullUrl}, 'Error while sending request');
		throw err;
	})
}

function storeInDB(jobDetails: IBitBucketJobInfo, projName: string, repoName: string, pullData: any) {
	const filters: any[] = [
		{ term: { teamId: jobDetails.teamId } },
		{ term: { servicePath: jobDetails.servicePath } },
		{ term: { projectName: projName } },
		{ term: { repoName: repoName }},
		{ term: { pullId: pullData.id } }
	];

	const item: RepoDatabaseDataItem = {
		teamId: jobDetails.teamId,
		servicePath: jobDetails.servicePath,
		projectName: projName,
		pullId: pullData.id,
		raisedBy: pullData.author.user.name,
		raisedOn: Math.round(new Date(pullData.createdDate).getTime() / 1000),
		repoName: repoName,
		status: (pullData.state === 'OPEN') ? STATUS_OPEN : STATUS_CLOSED,
//		url: pullData.author.user.links.self[0].href
		url: pullData.toRef.repository.project.links.self[0].href
	};
	if((pullData.updatedDate) && (pullData.updatedDate !== pullData.createdDate)) {
		item.reviewedOn = Math.round(new Date(pullData.updatedDate).getTime() / 1000);
	}
	if(pullData.state === 'MERGED') {
		item.acceptState = STATE_ACCEPTED;
	}
	if(pullData.state === 'DECLINED') {
		item.acceptState = STATE_REJECTED;
	}

	const indexName = getTableNameForOrg(config.repoIndex);
	colLogger.info({item, filters}, `Storing item in ${indexName}`);
	esDBFuncs.updateOrInsert(indexName, filters, [], item);
}
