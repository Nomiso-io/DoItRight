import * as HttpRequest from '../utils/httpRequest';
import { getLogger, config, getTableNameForOrg } from '../utils';
import * as esDBFuncs from '../elasticsearch/esFuncs';
//import { getLastState/*, setLastState*/ } from '../elasticsearch';
import { Jconfig, IJenkinsJobInfo } from './Jconfig';
import { BuildDatabaseDataItem, BuildDatabaseStageDataItem, STATUS_BLOCKED, STATUS_CANCELED, STATUS_FAILED, STATUS_INPROGRESS, STATUS_OTHER, STATUS_PENDING, STATUS_SCHEDULED, STATUS_SKIPPED, STATUS_SUCCESS } from '../models';

/*interface ESBuildDatabaseDataItem {
  _id: string;
  _index: string;
  _score: number;
  _source: BuildDatabaseDataItem;
  _type: string;
}*/

const getReqMethod = 'GET';
const colLogger = getLogger(Jconfig.name);

//callback is a method which takes err and data as parameter
module.exports = (input: any, callback: (err: any, data: any) => void) => {
	try {
		getDataFromJenkins(input)
		.then(() => callback(null, 'Jenkins Collector returning'));
	} catch(err) {
		colLogger.error({err}, 'Jenkins Collector returning with error');
		callback(new Error('Jenkins Collector returning with error'), null);
	}
}

async function getDataFromJenkins(jobDetails: IJenkinsJobInfo) {
	colLogger.info({jobDetails: jobDetails}, 'Jenkins Collector executing.');
//	getDataFromJenkinsForJob(jobDetails, jobDetails.job.value);
	let projects: string[] = jobDetails.job.value;
	if((projects.length > 0) && (projects[0] === 'All')) {
		projects = Object.keys(jobDetails.job.options);
	}
	projects.forEach((job: string) => {
		getDataFromJenkinsForJob(jobDetails, job);
	})
}

async function getDataFromJenkinsForJob(jobDetails: IJenkinsJobInfo, jobName: string) {
	//get the build number fetched for this job name from the state index
	const auth = `${jobDetails.userName.value}:${jobDetails.password.value}`;
	const encodedJobName = encodeURI(jobName);
//	const lastState = await getLastState({ //TODO: redesign how to store state
//		toolName: Jconfig.name,
//		teamId: jobDetails.teamId,
//		project: jobName
//	});
//	colLogger.info({lastState: lastState});
//	let startNum = (lastState) ? lastState.details.buildNum : 0;
	let startNum = 0;

	const getBuildNumAndJobsURL = `${jobDetails.url.value}/job/${encodedJobName}/api/json?tree=jobs[name],firstBuild[number],nextBuildNumber`;
	HttpRequest.httpRequest(getReqMethod, getBuildNumAndJobsURL, undefined, auth)
	.then((res: any) => {
		colLogger.info({url: getBuildNumAndJobsURL, auth: auth, response: {statusCode: res.statusCode, headers: res.headers}});
		if(res.statusCode < 200 || res.statusCode >= 300) {
			const err: Error = new Error(`Error: Received response ${res.statusCode} from ${getBuildNumAndJobsURL}`);
			colLogger.error({err});
//			throw err;
		} else {
			try {
				const data = JSON.parse(res.body);
				colLogger.info({url: getBuildNumAndJobsURL, data: data});
				//if build number received
				if(data.firstBuild) {
					startNum = (startNum === 0) ? data.firstBuild.number : startNum;
					getDataFromJenkinsForBuilds(jobDetails, jobName, startNum, data.nextBuildNumber);
				}
				//loop for each child job and fetch data for the child job
				if(data.jobs) {
					data.jobs.forEach((job: any) => {
						getDataFromJenkinsForJob(jobDetails, `${jobName}/job/${job.name}`);
					});
				}
			} catch (err) {
				colLogger.error({err, url: getBuildNumAndJobsURL}, 'Error while parsing response');
//				throw err;
			}
		}
	})
	.catch((err) => {
		colLogger.error({err, url: getBuildNumAndJobsURL}, 'Error while sending request');
//		throw err;
	})
}

async function getDataFromJenkinsForBuilds(jobDetails: IJenkinsJobInfo, jobName: string, startBuildNum: number, nextBuildNum: number) {
	const nextBuildNumList: number[] = [nextBuildNum];

	//loop from start build number to next build number for this job
//	for(let buildNum = startBuildNum; buildNum < nextBuildNum; buildNum += 1) {
	for(let buildNum = nextBuildNum - 1; buildNum >= startBuildNum; buildNum -= 1) { //TODO: rething if this is correct
		const num: number = await getDataFromJenkinsForBuildNum(jobDetails, jobName, buildNum);
		if(num > 0) {
			nextBuildNumList.push(num);
		}
	}
	colLogger.info({jobName: jobName, nextBuildNumList: nextBuildNumList})

	//store the next build number for this job in the state index
	const newLastState = {
		toolName: Jconfig.name, 
		teamId: jobDetails.teamId,
		project: jobName,
		lastAccessed: Date.now(),
		details: { buildNum: nextBuildNumList.reduce((a: number, b: number) => (a < b) ? a : b) }
	};
    colLogger.info({newLastState: newLastState});
//	setLastState(newLastState); //TODO: redesign how to store state
}

async function getDataFromJenkinsForBuildNum(jobDetails: IJenkinsJobInfo, jobName: string, buildNum: number): Promise<number> {
	return new Promise((resolve: (item: any) => void, reject: (err: any) => any): any => {
		const auth: string = `${jobDetails.userName.value}:${jobDetails.password.value}`;
		const encodedJobName = encodeURI(jobName);

		//get all the build details for the build for this job
		//const getBuildNumberInfoURL = `${jobDetails.url.value}/job/${encodedJobName}/${buildNum}/api/json?tree=number,building,result,timestamp,duration,url,estimatedDuration,actions[remoteUrls,lastBuiltRevision[branch[name]]]`;
//		const getBuildNumberInfoURL = `${jobDetails.url.value}/job/${encodedJobName}/${buildNum}/api/json?tree=number,building,result,timestamp,duration,url`;
		const getBuildNumberInfoURL = `${jobDetails.url.value}/job/${encodedJobName}/${buildNum}/wfapi/describe`;
		HttpRequest.httpRequest(getReqMethod, getBuildNumberInfoURL, undefined, auth)
		.then((res: any) => {
			colLogger.info({url: getBuildNumberInfoURL, auth: auth, response: {statusCode: res.statusCode, headers: res.headers}});
			if(res.statusCode < 200 || res.statusCode >= 300) {
				const err: Error = new Error(`Error: Received response ${res.statusCode} from ${getBuildNumberInfoURL}`);
				colLogger.error({err});
//				reject(err);
			} else {
				try {
					//if build details received, then store it
					const data: any = JSON.parse(res.body);
					colLogger.info({url: getBuildNumberInfoURL, data: data});
					const index = jobName.indexOf('/');
					const orgJobName = (index > 0) ? jobName.substring(0, index) : jobName;
					storeInDB(jobDetails, orgJobName, data);
					//if the build has not yet completed then remember that build number to be stored
					if(data.building) {
						resolve(buildNum);
					} else {
						resolve(0);
					}
				} catch (err) {
					colLogger.error({err, url: getBuildNumberInfoURL}, 'Error while parsing response');
//					reject(err);
				}
			}
		})
		.catch((err) => {
			colLogger.error({err, url: getBuildNumberInfoURL}, 'Error while sending request');
//			reject(err);
		})
	});
}

function storeInDB(jobDetails: IJenkinsJobInfo, jobName: string, buildInfo: any) {
	const filters: any[] = [
		{ term: { teamId: jobDetails.teamId } },
		{ term: { servicePath: jobDetails.servicePath } },
		{ term: { projectName: jobName } },
		{ term: { buildNum: parseInt(buildInfo.id, 10) } }
	];

	const item: BuildDatabaseDataItem = {
		teamId: jobDetails.teamId,
		servicePath: jobDetails.servicePath,
		projectName: jobName,
		failureWindow: jobDetails.failureWindow.value,
		buildNum: parseInt(buildInfo.id, 10),
		status: STATUS_SCHEDULED,
		startTimestamp: 0,
		duration: 0, //Math.round(buildInfo.durationMillis / 60000),
		pauseDuration: 0,
		url: `${jobDetails.url.value}${buildInfo._links.self.href}`,
		stages: [],
	};

/*	if(buildInfo.endTimeMillis && buildInfo.endTimeMillis > 0) {
		item.endTimestamp = Math.round(buildInfo.endTimeMillis / 1000);
	}
	if(buildInfo.pauseDurationMillis && buildInfo.pauseDurationMillis > 0) {
		item.pauseDuration = Math.round(buildInfo.pauseDurationMillis / 60000);
	}
*/

	let storeStage: boolean = false;

	buildInfo.stages.forEach((stage: any) => {
		const stageItem: BuildDatabaseStageDataItem = {
			stageName: stage.name,
			stageId: parseInt(stage.id, 10),
			status: getUniformStatusString(stage.status),
			startTimestamp: Math.round(stage.startTimeMillis / 1000),
			duration: Math.round(stage.durationMillis / 60000),
		}
		if(stage.status != 'IN_PROGRESS') {
			stageItem.endTimestamp = Math.round((stage.startTimeMillis + stage.durationMillis) / 1000);
		}
		if(stage.pauseDurationMillis && stage.pauseDurationMillis > 0) {
			stageItem.pauseDuration = Math.round(stage.pauseDurationMillis / 60000);
		}

		if((stage.name === jobDetails.startStage.value) &&
			((stageItem.status === STATUS_SUCCESS) || (stageItem.status === STATUS_INPROGRESS) || (stageItem.status === STATUS_FAILED))) {
				storeStage = true;
			item.startTimestamp = stageItem.startTimestamp;
			item.status = getUniformStatusString(buildInfo.status);
		}
		
//		if((stage.name === jobDetails.rollbackStage.value) && (stageItem.status != STATUS_OTHER)) {
//			item.status = STATUS_ROLLBACK;
//		}

		if(storeStage && (stageItem.status != STATUS_PENDING) && (stageItem.status != STATUS_SKIPPED)) {
			if(stageItem.endTimestamp) {
				item.endTimestamp = stageItem.endTimestamp;
			}
			item.duration += stageItem.duration;
			if(stageItem.pauseDuration) {
				item.pauseDuration = item.pauseDuration ? (item.pauseDuration + stageItem.pauseDuration) : stageItem.pauseDuration;
			}

			item.stages.push(stageItem);
		}
	});

	if(item.status != STATUS_SCHEDULED) {
		const indexName = getTableNameForOrg(config.buildIndex);
		colLogger.info({item, filters}, `Storing item in ${indexName}`);
		esDBFuncs.updateOrInsert(indexName, filters, [], item);
	}
}

function getUniformStatusString(status: string): string {
	switch(status) {
		case 'IN_PROGRESS':
			return STATUS_INPROGRESS;
		case 'SUCCESS':
			return STATUS_SUCCESS;
		case 'ABORTED':
			return STATUS_CANCELED;
		case 'FAILED':
			return STATUS_FAILED;
		case 'NOT_EXECUTED':
			return STATUS_SKIPPED;
		case 'PAUSED_PENDING_INPUT':
			return STATUS_BLOCKED;
		case 'UNSTABLE':
		default:
			return STATUS_OTHER;
	}
}
