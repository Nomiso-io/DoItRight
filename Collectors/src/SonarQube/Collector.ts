import * as HttpRequest from '../utils/httpRequest';
import { appLogger, config, getTableNameForOrg } from '../utils';
import * as esDBFuncs from '../elasticsearch/esFuncs';
import { getLastState, setLastState } from '../elasticsearch';
import { SQconfig, ISonarJobInfo } from './SQconfig';
import { QualityDatabaseDataItem } from '../models';

/*
interface ESReqDatabaseDataItem {
  _id: string;
  _index: string;
  _score: number;
  _source: ReqDatabaseDataItem;
  _type: string;
}
*/

const getReqMethod = 'GET';
//const postReqMethod = 'POST';

//callback is a method which takes err and data as parameter
module.exports = (input: any, callback: (err: any, data: any) => void) => {
	try {
		appLogger.info('SonarQube Collector executing', {input: input});
		getDataFromSonar(input)
		.then(() => callback(null, "SonarQube Collector exiting"));
	} catch(err) {
		appLogger.error(err);
		callback(new Error("SonarQube Collector existed with error"), null);
	}
}

async function getDataFromSonar(jobDetails: ISonarJobInfo) {
	let projects: string[] = jobDetails.projectName.value;
	if((projects.length > 0) && (projects[0] === 'All')) {
		projects = Object.keys(jobDetails.projectName.options);
	}
	projects.forEach((proj: string) => {
		getDataFromSonarForProject(jobDetails, proj);
	})
}

async function getDataFromSonarForProject(jobDetails: ISonarJobInfo, projectName: string) {
	//get last fetched time from sate
	const lastState = await getLastState({
		toolName: SQconfig.name,
		teamId: jobDetails.teamId,
		project: projectName
	});
	appLogger.info({lastState: lastState});

	let metrics: string[] = jobDetails.metrics.value;
	if((metrics.length > 0) && (metrics[0] === 'All')) {
		metrics = Object.keys(jobDetails.metrics.options);
	}
	const proj = encodeURI(projectName);
	const baseURL = `${jobDetails.url.value}/api/measures/search_history?component=${proj}&metrics=${metrics.join(',')}`;
	const now: Date = new Date(Date.now());
	const toDateStr = now.toDateString();
	if(lastState) {
		//get all issues that werere updated after last accessed
		const from: Date = new Date(lastState.lastAccessed);
		const fromDateStr = from.toDateString();
		const url = `${baseURL}&from=${fromDateStr}&to=${toDateStr}`;
		getDataFromSonarWithURL(jobDetails, projectName, url);
	} else {
		//get all issues in system
		const url = `${baseURL}&to=${toDateStr}`;
		getDataFromSonarWithURL(jobDetails, projectName, url);
	}
	
	//store last fetched time in state
	setLastState({
		toolName: SQconfig.name, 
		teamId: jobDetails.teamId,
		project: projectName,
//		url: jobDetails.url.value,
		lastAccessed: now.getTime()
	});
}

async function getDataFromSonarWithURL(jobDetails: ISonarJobInfo, projectName: string, url: string) {
//	const auth = `${jobDetails.username}:${jobDetails.appToken}`;
	const auth = jobDetails.appToken;

	//TODO: data will be paged, so send request till there is no more data	
	HttpRequest.httpRequest(getReqMethod, url, null, auth)
	.then((res: any) => {
		if(res.statusCode < 200 || res.statusCode >= 300) {
			appLogger.error('Error: Error receiving data' + res.statusCode);
			throw new Error('Error receiving data');
		} else {
			try {
				const data = JSON.parse(res.body);
				data.measures.forEach((measure: any) => {
					storeInDB(jobDetails, projectName, measure);
				});
			} catch (error) {
				appLogger.error({SonarQubeGetDataParseError: error});
				throw error;
			}
		}
	})
	.catch((err) => {
		appLogger.error({SonarQubeGetError: err});
		throw err;
	})
}

function storeInDB(jobDetails: ISonarJobInfo, projectName: string, data: any) {
	data.history.forEach((historyItem: any) => {
		const item: QualityDatabaseDataItem = {
			teamId: jobDetails.teamId,
			servicePath: jobDetails.servicePath,
			projectName: projectName,
			metrics: data.metric,
			timestamp: new Date(historyItem.date).getTime(),
			value: historyItem.value,
			url: `${jobDetails.url.value}/projects?search=${projectName}`
		};
		appLogger.info("Storing item :", item);
		esDBFuncs.insert(getTableNameForOrg(config.qualityIndex), item);
	})
}
