
import * as HttpRequest from '../utils/httpRequest';
import { getLogger, config, getTableNameForOrg } from '../utils';
import * as esDBFuncs from '../elasticsearch/esFuncs';
//import { getLastState, setLastState } from '../elasticsearch';
import { Jconfig, IJIRAIncidentsJobInfo } from './Jconfig';
import { IncidentDatabaseDataItem, ReqDatabaseDataItem, REQ_STATUS_CLOSED } from '../models';

const getReqMethod = 'GET';
const colLogger = getLogger(Jconfig.name);

//callback is a method which takes err and data as parameter
module.exports = (input: any, callback: (err: any, data: any) => void) => {
	try {
        getDataFromJIRAIncidents(input)
		.then(() => callback(null, "JIRA Incidents Collector exiting"));
	} catch(err) {
		colLogger.error({err}, 'JIRA Incidents Collector returning with error');
		callback(new Error("JIRA Incidents Collector existed with error"), null);
	}
}

async function getDataFromJIRAIncidents(jobDetails: IJIRAIncidentsJobInfo) {
	colLogger.info({jobDetails: jobDetails}, 'JIRA Incidents Collector executing.');
	let projects: string[] = jobDetails.projectName.value;
	if((projects.length > 0) && (projects[0] === 'All')) {
		projects = Object.keys(jobDetails.projectName.options);
	}
	projects.forEach((proj: string) => {
		getDataFromJIRAIncidentsForProject(jobDetails, proj);
	})
}

async function getDataFromJIRAIncidentsForProject(jobDetails: IJIRAIncidentsJobInfo, projectName: string) {
	//get last fetched time from sate
/*	const lastState = await getLastState({
		toolName: Jconfig.name,
		teamId: jobDetails.teamId,
		project: projectName
	});
//	colLogger.info({lastState: lastState});
*/
	const proj = encodeURI(projectName);
    const baseURL = `${jobDetails.url.value}/rest/api/latest/search?jql=project%3D%27${proj}%27`;
	const now: Date = new Date(Date.now());
	const toDateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}%20${now.getHours()}:${now.getMinutes()}`;
	
	//get all issues in system
	let createdURL = `${baseURL}%20AND%20created%3C%3D%27${toDateStr}%27`;
	let updatedURL = `${baseURL}%20AND%20updated%3C%3D%27${toDateStr}%27`;
	
/*	if(lastState) {
		//get all issues that were updated after last accessed
		const from: Date = new Date(lastState.lastAccessed);
		const fromDateStr = `${from.getFullYear()}-${from.getMonth() + 1}-${from.getDate()}%20${from.getHours()}:${from.getMinutes()}`;
		createdURL = `${baseURL}%20AND%20created%3E%3D%27${fromDateStr}%27%20AND%20created%3C%3D%27${toDateStr}%27`;
		updatedURL = `${baseURL}%20AND%20updated%3E%3D%27${fromDateStr}%27%20AND%20updated%3C%3D%27${toDateStr}%27`;
	}
*/
	getDataFromJIRAWithURL(jobDetails, projectName, createdURL);

	getDataFromJIRAWithURL(jobDetails, projectName, updatedURL);
	
	//store last fetched time in state
/*	const newLastState = {
		toolName: Jconfig.name, 
		teamId: jobDetails.teamId,
		project: projectName,
		lastAccessed: now.getTime()
	};
    colLogger.info({newLastState: newLastState});
	setLastState(newLastState);
*/
}

async function getDataFromJIRAWithURL(jobDetails: IJIRAIncidentsJobInfo, projectName: string, url: string) {
	const auth = `${jobDetails.email.value}:${jobDetails.appToken.value}`;
	const maxNum = 50;

	//data will be paged, so send request till there is no more data
	HttpRequest.httpRequest(getReqMethod, `${url}&startAt=0&maxResults=0`, null, auth)
	.then((countRes: any) => {
		colLogger.info({url: `${url}&startAt=0&maxResults=0`, auth: auth, response: {statusCode: countRes.statusCode, headers: countRes.headers}});
		if(countRes.statusCode < 200 || countRes.statusCode >= 300) {
			const err: Error = new Error(`Error: Received response ${countRes.statusCode} from ${url}&startAt=0&maxResults=0`);
			colLogger.error({err});
		} else {
			const countData = JSON.parse(countRes.body);
			colLogger.info({url: `${url}&startAt=0&maxResults=0`, countData: countData});
			let total = /*(countData.total > 500) ? 500 : */countData.total;
			for(let i = 0; i < total; i+= maxNum) {
				HttpRequest.httpRequest(getReqMethod, `${url}&startAt=${i}&maxResults=${maxNum}`, null, auth)
				.then((res: any) => {
					colLogger.info({url: `${url}&startAt=${i}&maxResults=${maxNum}`, auth: auth, response: {statusCode: res.statusCode, headers: res.headers}});
					if(res.statusCode < 200 || res.statusCode >= 300) {
						const err: Error = new Error(`Error: Received response ${res.statusCode} from ${url}&startAt=${i}&maxResults=${maxNum}`);
						colLogger.error({err});
					} else {
						try {
							const data = JSON.parse(res.body);
							colLogger.info({url: `${url}&startAt=${i}&maxResults=${maxNum}`, data: data});
							data.issues.forEach((issue: any) => {
								if(issue.fields[jobDetails.serviceMappingKey.value].value.toLowerCase() === jobDetails.serviceMappingValue.value.toLowerCase()) {
									storeInIncidentDB(jobDetails, projectName, issue);
									storeInReqDB(jobDetails, projectName, issue);
								}
							});
						} catch (error) {
							colLogger.error({error, url: `${url}&startAt=${i}&maxResults=${maxNum}`}, 'Error while parsing response');
						}
					}
				})
				.catch((err) => {
					colLogger.error({err, url: `${url}&startAt=${i}&maxResults=${maxNum}`}, 'Error while sending request');
				})
			}
		}
	})
	.catch((err) => {
		colLogger.error({err, url: `${url}&startAt=0&maxResults=0`}, 'Error while sending request');
	})

}

function storeInIncidentDB(jobDetails: IJIRAIncidentsJobInfo, projectName: string, issueData: any) {
	const filters: any[] = [
		{ term: { teamId: jobDetails.teamId } },
		{ term: { servicePath: jobDetails.servicePath } },
		{ term: { projectName: projectName } },
		{ term: { itemId: issueData.id } }
	];

	const item: IncidentDatabaseDataItem = {
		teamId: jobDetails.teamId,
		servicePath: jobDetails.servicePath,
		projectName: projectName,
		itemId: issueData.id,
		itemPriority: issueData.fields.priority.name,
		itemType: issueData.fields.issuetype.name,
		status: issueData.fields.status.statusCategory.name,
		startTime: Math.round(new Date(issueData.fields[jobDetails.incidentStartKey.value]).getTime() / 1000),
		url: `${jobDetails.url.value}/browse/${issueData.key}`
	};

	if(issueData.fields[jobDetails.incidentEndKey.value]) {
		item.endTime = Math.round(new Date(issueData.fields[jobDetails.incidentEndKey.value]).getTime() / 1000);
	} else if(item.status === REQ_STATUS_CLOSED) {
		item.endTime = Math.round(new Date(issueData.fields.resolutiondate).getTime() / 1000);
	}

	if(item.endTime && (item.endTime < item.startTime)) {
		item.endTime = item.startTime;
	}

	const indexName = getTableNameForOrg(config.incidentIndex);
	colLogger.info({item, filters}, `Storing item in ${indexName}`);
	esDBFuncs.updateOrInsert(indexName, filters, [], item);
}

function storeInReqDB(jobDetails: IJIRAIncidentsJobInfo, projectName: string, issueData: any) {
	const filters: any[] = [
		{ term: { teamId: jobDetails.teamId } },
		{ term: { servicePath: jobDetails.servicePath } },
		{ term: { projectName: projectName } },
		{ term: { itemId: issueData.id } }
	];

	const item: ReqDatabaseDataItem = {
		teamId: jobDetails.teamId,
		servicePath: jobDetails.servicePath,
		projectName: projectName,
		itemId: issueData.id,
		itemPriority: issueData.fields.priority.name,
		itemType: issueData.fields.issuetype.name,
		status: issueData.fields.status.statusCategory.name,
		createdOn: Math.round(new Date(issueData.fields.created).getTime() / 1000),
		startedOn: Math.round(new Date(issueData.fields.created).getTime() / 1000),
		url: `${jobDetails.url.value}/browse/${issueData.key}`
	};

	if(issueData.fields.resolutiondate) {
		item.closedOn = Math.round(new Date(issueData.fields.resolutiondate).getTime() / 1000);
		if(item.closedOn < item.createdOn) {
			item.closedOn = item.createdOn;
		}
	}

	const indexName = getTableNameForOrg(config.reqIndex);
	colLogger.info({item, filters}, `Storing item in ${indexName}`);
	esDBFuncs.updateOrInsert(indexName, filters, [], item);
}
