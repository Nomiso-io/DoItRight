import * as HttpRequest from '../utils/httpRequest';
import { getLogger, config, getTableNameForOrg } from '../utils';
import * as esDBFuncs from '../elasticsearch/esFuncs';
import { getLastState, setLastState } from '../elasticsearch';
import { GLconfig, IGitLabCICDJobInfo } from './GLconfig';
import { BuildDatabaseDataItem, BuildDatabaseStageDataItem, STATUS_BLOCKED, STATUS_CANCELED, STATUS_FAILED, STATUS_INPROGRESS, STATUS_OTHER, STATUS_PENDING, STATUS_SCHEDULED, STATUS_SKIPPED, STATUS_SUCCESS } from '../models';

const getReqMethod = 'GET';
const colLogger = getLogger(GLconfig.name);

//callback is a method which takes err and data as parameter
module.exports = (input: any, callback: (err: any, data: any) => void) => {
	try {
		getDataFromGitLabCICD(input)
		.then(() => callback(null, 'GitLabCICD Collector returning'));
	} catch(err) {
		colLogger.error({err}, 'GitLabCICD Collector returning with error');
		callback(new Error('GitLabCICD Collector returning with error'), null);
	}
}

async function getDataFromGitLabCICD(jobDetails: IGitLabCICDJobInfo) {
	colLogger.info({jobDetails: jobDetails}, 'GitlabCICD Collector executing.');
//	getDataFromGitLabCICDForProj(jobDetails, jobDetails.projectName.value);
	let projects: string[] = jobDetails.projectName.value;
	if((projects.length > 0) && (projects[0] === 'All')) {
		projects = Object.keys(jobDetails.projectName.options);
	}
	projects.forEach((proj: string) => {
		getDataFromGitLabCICDForProj(jobDetails, proj);
	})
}

async function getDataFromGitLabCICDForProj(jobDetails: IGitLabCICDJobInfo, projId: string) {
	const lastState = await getLastState({
		toolName: GLconfig.name,
		teamId: jobDetails.teamId,
		project: projId
	});
	colLogger.info({lastState: lastState});

	const baseURL = `${jobDetails.url.value}/api/v4/projects/${projId}/pipelines`;
	const now: Date = new Date(Date.now());
//	const now: Date = new Date(2021, 3, 1);
	const toDateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}T${now.getHours()}:${now.getMinutes()}:00Z`;

	//get all issues in system
	// TODO: created_before and created_after are not available. use something alternate
	let createdURL = `${baseURL}?created_before=${toDateStr}`;
	let updatedURL = `${baseURL}?updated_before=${toDateStr}`;

/*	if(lastState) {
		//get all issues that were updated after last accessed
		const from: Date = new Date(lastState.lastAccessed);
		const fromDateStr = `${from.getFullYear()}-${from.getMonth() + 1}-${from.getDate()}T${from.getHours()}:${from.getMinutes()}:00Z`;
		createdURL = `${baseURL}&created_after=${fromDateStr}&created_before=${toDateStr}`;
		updatedURL = `${baseURL}&updated_after=${fromDateStr}&updated_before=${toDateStr}`;
	}
*/	getDataFromGitLabCICDWithURL(jobDetails, projId, createdURL, '1');

	getDataFromGitLabCICDWithURL(jobDetails, projId, updatedURL, '1');

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

async function getDataFromGitLabCICDWithURL(jobDetails: IGitLabCICDJobInfo, projId: string, url: string, pageNum: string) {
	const header = { 'PRIVATE-TOKEN': jobDetails.appToken.value, Accept: '*/*', 'User-Agent': 'nodejs' };
	const pipelinesUrl = `${url}&page=${pageNum}&per_page=100`;
	HttpRequest.httpRequest(getReqMethod, pipelinesUrl, undefined, undefined, header)
	.then((pipelinesRes: any) => {
		colLogger.info({url: pipelinesUrl, header: header, response: {statusCode: pipelinesRes.statusCode, headers: pipelinesRes.headers}});
		if(pipelinesRes.statusCode < 200 || pipelinesRes.statusCode >= 300) {
			const err: Error = new Error(`Error: Received response ${pipelinesRes.statusCode} from ${pipelinesUrl}`);
			colLogger.error({err});
//			throw err;
		} else {
			try {
				const pipelinesList = JSON.parse(pipelinesRes.body);
				colLogger.info({url: pipelinesUrl, pipelinesList: pipelinesList});
				pipelinesList.forEach((data: any) => {
					getDataFromGitLabCICDForPipeline(jobDetails, projId, data.id);
				});

				if(pipelinesRes.headers['x-next-page'] !== '') {
					getDataFromGitLabCICDWithURL(jobDetails, projId, url, pipelinesRes.headers['x-next-page'])
				}	  
			} catch (err) {
				colLogger.error({err, url: pipelinesUrl}, 'Error while parsing response');
//				throw err;
			}
		}
	})
	.catch((err) => {
		colLogger.error({err, url: pipelinesUrl}, 'Error while sending request');
//		throw err;
	})
}

async function getDataFromGitLabCICDForPipeline(jobDetails: IGitLabCICDJobInfo, projId: string, pipelineId: number) {
	const header = { 'PRIVATE-TOKEN': jobDetails.appToken.value, Accept: '*/*', 'User-Agent': 'nodejs' };
//	const url = `${jobDetails.url.value}/api/v4/projects/${projId}/pipelines/${pipelineId}`;
	const url = `${jobDetails.url.value}/api/v4/projects/${projId}/pipelines/${pipelineId}/jobs?per_page=100`;

	HttpRequest.httpRequest(getReqMethod, url, undefined, undefined, header)
	.then((res: any) => {
		colLogger.info({url: url, header: header, response: {statusCode: res.statusCode, headers: res.headers}});
		if(res.statusCode < 200 || res.statusCode >= 300) {
			const err: Error = new Error(`Error: Received response ${res.statusCode} from ${url}`);
			colLogger.error({err});
//			throw err;
		} else {
			try {
				const pipelineData = JSON.parse(res.body);
				colLogger.info({url: url, pipelineData: pipelineData});
//				if(pipelinesRes.headers['x-next-page'] !== '') {
//                TODO: get more jobs for the pipeline and append to the same pipeline
//                TODO: process the complete data once the whole data has been fetched
//				}	  
				if(pipelineData.length > 0) {
					storeInDB(jobDetails, jobDetails.projectName.options[projId], pipelineData);
				}
			} catch (err) {
				colLogger.error({err, url: url}, 'Error while parsing response');
//				throw err;
			}
		}
	})
	.catch((err) => {
		colLogger.error({err, url: url}, 'Error while sending request');
//		throw err;
	})
}

function storeInDB(jobDetails: IGitLabCICDJobInfo, projName: string, pipelineData: any) {
	const filters: any[] = [
		{ term: { teamId: jobDetails.teamId } },
		{ term: { servicePath: jobDetails.servicePath } },
		{ term: { projectName: projName } },
		{ term: { buildNum: pipelineData[0].pipeline.id } }
	];

	const item: BuildDatabaseDataItem = {
		teamId: jobDetails.teamId,
		servicePath: jobDetails.servicePath,
		projectName: projName,
		failureWindow: jobDetails.failureWindow.value,
		buildNum: pipelineData[0].pipeline.id,
		status: STATUS_SCHEDULED,
		startTimestamp: 0,
		duration: 0,
		pauseDuration: 0,
		url: pipelineData[0].pipeline.web_url,
		stages: [],
	};

	let storeStage: boolean = false;

	pipelineData.forEach((stage: any) => {
		const stageItem: BuildDatabaseStageDataItem = {
			stageName: stage.stage,
			stageId: stage.id,
			status: getUniformStatusString(stage.status),
			startTimestamp: (stage.started_at) ? Math.round(new Date(stage.started_at).getTime() / 1000) : 0,
			endTimestamp: (stage.finished_at) ? Math.round(new Date(stage.finished_at).getTime() / 1000) : 0,
			duration: (stage.duration) ? Math.round(stage.duration / 60) : 0,
			pauseDuration: 0,
		}

		if((stage.stage === jobDetails.startStage.value) &&
			((stageItem.status === STATUS_SUCCESS) || (stageItem.status === STATUS_INPROGRESS) || (stageItem.status === STATUS_FAILED))) {
			storeStage = true;
			item.startTimestamp = stageItem.startTimestamp;
			item.status = getUniformStatusString(stage.pipeline.status);
		}

//		if((stage.name === jobDetails.rollbackStage.value) && (stageItem.status != STATUS_OTHER)) {
//			storeStage = true;
//			item.status = STATUS_ROLLBACK;
//		}

		if(storeStage && (stageItem.status != STATUS_PENDING) && (stageItem.status != STATUS_SKIPPED) && (stageItem.status != STATUS_OTHER)) {
			if(stage.finished_at) {
				item.endTimestamp = stageItem.endTimestamp;
			}
			item.duration += stageItem.duration;

			item.stages.push(stageItem);
		}

//		if(stage.stage === jobDetails.endStage.value) {
//			storeStage = false;
//		}
	});

	if(item.status != STATUS_SCHEDULED) {
		const indexName = getTableNameForOrg(config.buildIndex);
		colLogger.info({item, filters}, `Storing item in ${indexName}`);
		esDBFuncs.updateOrInsert(indexName, filters, [], item);
	}
}

function getUniformStatusString(status: string): string {
	switch(status) {
		case 'running':
			return STATUS_INPROGRESS;
		case 'success':
			return STATUS_SUCCESS;
		case 'canceled':
			return STATUS_CANCELED;
		case 'failed':
			return STATUS_FAILED;
		case 'pending':
			return STATUS_PENDING;
		case 'skipped':
			return STATUS_SKIPPED;
		case 'blocked':
			return STATUS_BLOCKED;
		default:
			return STATUS_OTHER;
	}
}
