
import * as HttpRequest from '../utils/httpRequest';
import { getLogger, config, getTableNameForOrg } from '../utils';
import * as esDBFuncs from '../elasticsearch/esFuncs';
//import { getLastState, setLastState } from '../elasticsearch';
import { Jconfig, IJIRAJobInfo } from './Jconfig';
import { ReqDatabaseDataItem } from '../models';
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
const colLogger = getLogger(Jconfig.name);

//callback is a method which takes err and data as parameter
module.exports = (input: any, callback: (err: any, data: any) => void) => {
	try {
        getDataFromJIRA(input)
		.then(() => callback(null, "JIRA Collector exiting"));
	} catch(err) {
		colLogger.error({err}, 'JIRA Collector returning with error');
		callback(new Error("JIRA Collector existed with error"), null);
	}
}

async function getDataFromJIRA(jobDetails: IJIRAJobInfo) {
	colLogger.info({jobDetails: jobDetails}, 'JIRA Collector executing.');
	let projects: string[] = jobDetails.projectName.value;
	if((projects.length > 0) && (projects[0] === 'All')) {
		projects = Object.keys(jobDetails.projectName.options);
	}
	projects.forEach((proj: string) => {
		getDataFromJIRAForProject(jobDetails, proj);
	})
}

async function getDataFromJIRAForProject(jobDetails: IJIRAJobInfo, projectName: string) {
	//get last fetched time from sate
/*	const lastState = await getLastState({
		toolName: Jconfig.name,
		teamId: jobDetails.teamId,
		project: projectName
	});
//	colLogger.info({lastState: lastState});
*/
	const proj = encodeURI(projectName);
    const baseURL = `${jobDetails.url.value}/rest/api/latest/search?expand=changelog&jql=project%3D%27${proj}%27`;
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

async function getDataFromJIRAWithURL(jobDetails: IJIRAJobInfo, projectName: string, url: string) {
	const auth = `${jobDetails.email.value}:${jobDetails.appToken.value}`;
	const maxNum = 50;

	//data will be paged, so send request till there is no more data
	HttpRequest.httpRequest(getReqMethod, `${url}&startAt=0&maxResults=0`, null, auth)
	.then((countRes: any) => {
		colLogger.info({url: `${url}&startAt=0&maxResults=0`, auth: auth, response: {statusCode: countRes.statusCode, headers: countRes.headers}});
		if(countRes.statusCode < 200 || countRes.statusCode >= 300) {
			const err: Error = new Error(`Error: Received response ${countRes.statusCode} from ${url}&startAt=0&maxResults=0`);
			colLogger.error({err});
//			throw err;
		} else {
			const countData = JSON.parse(countRes.body);
			colLogger.info({url: `${url}&startAt=0&maxResults=0`, countData: countData});
			let total = countData.total;
			for(let i = 0; i < total; i+= maxNum) {
				HttpRequest.httpRequest(getReqMethod, `${url}&startAt=${i}&maxResults=${maxNum}`, null, auth)
				.then((res: any) => {
					colLogger.info({url: `${url}&startAt=${i}&maxResults=${maxNum}`, auth: auth, response: {statusCode: res.statusCode, headers: res.headers}});
					if(res.statusCode < 200 || res.statusCode >= 300) {
						const err: Error = new Error(`Error: Received response ${res.statusCode} from ${url}&startAt=${i}&maxResults=${maxNum}`);
						colLogger.error({err});
//						throw err;
					} else {
						try {
							const data = JSON.parse(res.body);
							colLogger.info({url: `${url}&startAt=${i}&maxResults=${maxNum}`, data: data});
							data.issues.forEach((issue: any) => {
								if(jobDetails.items.value.includes('All') || jobDetails.items.value.includes(issue.fields.issuetype.name)) {
									storeInDB(jobDetails, projectName, issue);
								}
							});
						} catch (error) {
							colLogger.error({error, url: `${url}&startAt=${i}&maxResults=${maxNum}`}, 'Error while parsing response');
//							throw error;
						}
					}
				})
				.catch((err) => {
					colLogger.error({err, url: `${url}&startAt=${i}&maxResults=${maxNum}`}, 'Error while sending request');
//					throw err;
				})
			}
		}
	})
	.catch((err) => {
		colLogger.error({err, url: `${url}&startAt=0&maxResults=0`}, 'Error while sending request');
//		throw err;
	})

}

/*
function storeInDB(jobDetails: IJIRAJobInfo, projectName: string, issueData: any) {
	const filters: any[] = [
		{ term: { teamId: jobDetails.teamId } },
		{ term: { servicePath: jobDetails.servicePath } },
		{ term: { projectName: projectName } },
		{ term: { itemId: issueData.id } }
	];

	const indexName = getTableNameForOrg(config.reqIndex);
	esDBFuncs.searchAll<ESReqDatabaseDataItem[]>(indexName, filters, [])
	.then( (result: ESReqDatabaseDataItem[] )	=> {
		if(!result || result.length == 0) {
			const item: ReqDatabaseDataItem = {
				teamId: jobDetails.teamId,
				servicePath: jobDetails.servicePath,
				projectName: projectName,
				itemId: issueData.id,
				itemPriority: issueData.fields.priority.name,
				itemType: issueData.fields.issuetype.name,
				status: issueData.fields.status.statusCategory.name,
				createdOn: Math.round(new Date(issueData.fields.created).getTime() / 1000),
                url: `${jobDetails.url.value}/browse/${issueData.key}`
			};
			
			issueData.changelog.histories.forEach((changeEntry: any) => {
				changeEntry.items.forEach((changeItem: any) => {
					if((! item.startedOn) && (changeItem.field === 'status') && (changeItem.toString === jobDetails.startState.value)) {
						item.startedOn = Math.round(new Date(changeEntry.created).getTime() / 1000);
					}

					if((changeItem.field === 'status') && (changeItem.toString === jobDetails.closeState.value)) {
						item.closedOn = Math.round(new Date(changeEntry.created).getTime() / 1000);
					}
				});
			});

			if(item.closedOn && !item.startedOn) {
				item.startedOn = item.createdOn;
			}

//			if((issueData.fields.status.name === jobDetails.startState.value)
//			  || (issueData.fields.status.statusCategory.name === jobDetails.startState.value)) {
//				item.startedOn = Math.round(new Date(issueData.fields.updated).getTime() / 1000);
//			}
		
//			if((issueData.fields.status.name === jobDetails.closeState.value)
//			  || (issueData.fields.status.statusCategory.name === jobDetails.closeState.value)) {
//				item.closedOn = Math.round(new Date(issueData.fields.updated).getTime() / 1000);
//				if(! item.startedOn) {
//					item.startedOn = Math.round(new Date(issueData.fields.updated).getTime() / 1000);
//				}
//			}

			colLogger.info({item, filters}, `Inserting item in ${indexName}`);
			esDBFuncs.insert(indexName, item);
		} else {
			const item: ReqDatabaseDataItem = result[0]._source;

			item.itemPriority = issueData.fields.priority.name;
			item.itemType = issueData.fields.issuetype.name;
			item.status = issueData.fields.status.statusCategory.name;
			
			if(! item.startedOn) {
			    if((issueData.fields.status.name === jobDetails.startState.value)
  				  || (issueData.fields.status.statusCategory.name === jobDetails.startState.value)) {
					item.startedOn = Math.round(new Date(issueData.fields.updated).getTime() / 1000);
				}
			}
		
			if((issueData.fields.status.name === jobDetails.closeState.value)
			  || (issueData.fields.status.statusCategory.name === jobDetails.closeState.value)) {
				item.closedOn = Math.round(new Date(issueData.fields.updated).getTime() / 1000);
				if(! item.startedOn) {
					item.startedOn = Math.round(new Date(issueData.fields.updated).getTime() / 1000);
				}
			}

			colLogger.info({item, filters}, `Updating item in ${indexName}`);
			esDBFuncs.update(indexName, result[0]._id, item);
		}
	})
	.catch((err: any) => {
        colLogger.info({err, filters}, `Searching in ${indexName}`);
	})
}
*/

function storeInDB(jobDetails: IJIRAJobInfo, projectName: string, issueData: any) {
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
		url: `${jobDetails.url.value}/browse/${issueData.key}`
	};
	
	issueData.changelog.histories.forEach((changeEntry: any) => {
		changeEntry.items.forEach((changeItem: any) => {
			//TODO: try to match the statusCategory of the status string in 'changeItem.toString' to the configured state value
			if((! item.startedOn) && (changeItem.field === 'status') && (changeItem.toString === jobDetails.startState.value)) {
				item.startedOn = Math.round(new Date(changeEntry.created).getTime() / 1000);
			}

			if((changeItem.field === 'status') && (changeItem.toString === jobDetails.closeState.value)) {
				item.closedOn = Math.round(new Date(changeEntry.created).getTime() / 1000);
			}
		});
	});

	if(item.closedOn && !item.startedOn) {
		item.startedOn = item.createdOn;
	}

//			if((issueData.fields.status.name === jobDetails.startState.value)
//			  || (issueData.fields.status.statusCategory.name === jobDetails.startState.value)) {
//				item.startedOn = Math.round(new Date(issueData.fields.updated).getTime() / 1000);
//			}
		
//			if((issueData.fields.status.name === jobDetails.closeState.value)
//			  || (issueData.fields.status.statusCategory.name === jobDetails.closeState.value)) {
//				item.closedOn = Math.round(new Date(issueData.fields.updated).getTime() / 1000);
//				if(! item.startedOn) {
//					item.startedOn = Math.round(new Date(issueData.fields.updated).getTime() / 1000);
//				}
//			}

	const indexName = getTableNameForOrg(config.reqIndex);
	colLogger.info({item, filters}, `Storing item in ${indexName}`);
	esDBFuncs.updateOrInsert(indexName, filters, [], item);
}
