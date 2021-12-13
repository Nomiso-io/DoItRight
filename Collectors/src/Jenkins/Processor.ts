/*const {config} = require('../config');
const {Jconfig} = require('./config');
const MongoDB = require('../mongoDBFunctions');
const {getLastState, setLastState} = require('../common');

const PROCESSOR_NAME = 'JenkinsProcessor';
*/
/*
export interface BuildGraphDataItem {
    countFailBuilds: number;
    countOtherBuilds: number;
    countSuccessBuilds: number;
    projectName: string;
    teamId: string;
    timestampEnd: number;
//    timestampStart: number;
}

export interface BuildListDataItem {
    buildNum: number;
    duration: number;
    projectName: string;
    status: string;
    teamId: string;
    timestamp: number;
    url: string;
}
*/
/*
const STATUS_PASS = 'Pass';
const STATUS_FAIL = 'Fail';
const STATUS_INPROGRESS = 'InProgress';
const STATUS_OTHER = 'Other'; //Like Aborted or Error etc.

//callback is a method which takes err and data as parameter
module.exports = (input, callback) => {
	processJenkinsData();
	callback(null, "JenkinsProcessor exiting");
}
*/
/*
function execute(jobs) {
	for (var i = 0; i < jobs.length; i++) {
//		console.log("Job " + i);
//		console.log(jobs[i]);
//		processJenkinsData(jobs[i]);
	}
}
*/
/*
async function processJenkinsData() {
	var lastState = await getLastState(PROCESSOR_NAME, null);
	var lastRunDate = new Date((lastState) ? (lastState.lastRun) : Date.now());
	lastRunDate.setDate(lastRunDate.getDate() - 1);
	console.log({lastRunDate: lastRunDate.toDateString()});

	var result = await MongoDB.getByQuery(config.env + "_" + Jconfig.jenkinsTable, {"timestamp": {$gte: lastRunDate}});
	
	
	
	var countsMap = new Map();
	
	for(var i = 0; i < result.length; i++) {
		var date = new Date(result[i].timestamp);
		console.log(result[i]);
		console.log("Date is " + date.getDate() + " " + date.getMonth() + " " + date.getFullYear() + "," + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
		console.log("UTC Date is " + date.getUTCDate() + " " + date.getUTCMonth() + " " + date.getUTCFullYear() + "," + date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds());
	}
}
*/
/*
function getDataFromJenkins(jobDetails) {
	var lastState = getLastState(COLLECTOR_NAME, jobDetails.job);
	var startNum = (lastState) ? (1 + lastState.info.buildNum) : 1;
	
	var getLastBuildNumURL = `${jobDetails.url}/job/${jobDetails.job}/lastBuild/api/json?tree=number`;
	HttpRequest.httpRequest(jenkinsReqMethod, getLastBuildNumURL, null, `${jobDetails.username}:${jobDetails.password}`)
	.then((res) => {
		if(res.statusCode < 200 || res.statusCode >= 300) {
			console.log('Error: ' + res.statusCode);
			return false;
		} else {
			try {
				var data = JSON.parse(res.body);
				var endNumber = data.number;
				for(var i = startNum; i <= endNumber; i++) {
					getBuildDataFromJenkinsForBuild(jobDetails, i);
				}
				setLastState(COLLECTOR_NAME, jobDetails.job, {"buildNum": endNumber});
			} catch (error) {
				console.log({Error: error});
				return false;
			}
		}
	})
	.catch((err) => {
		console.log({Error: err});
		return false;
	})
}

function getBuildDataFromJenkinsForBuild(jobDetails, buildNum) {
	var getBuildNumberInfoURL = `${jobDetails.url}/job/${jobDetails.job}/${buildNum}/api/json?tree=number,building,result,timestamp,duration,estimatedDuration,actions[remoteUrls,lastBuiltRevision[branch[name]]]`;
	HttpRequest.httpRequest(jenkinsReqMethod, getBuildNumberInfoURL, null, `${jobDetails.username}:${jobDetails.password}`)
	.then((res) => {
		if(res.statusCode < 200 || res.statusCode >= 300) {
			console.log('Error: ' + res.statusCode);
//			console.error(res)
			return false;
		} else {
			try {
				var data = JSON.parse(res.body);
				storeInDB(jobDetails.job, data);
			} catch (error) {
				console.log({Error: error});
				return false;
			}
		}
	})
	.catch((err) => {
		console.log({Error: err});
		return false;
	})
}

function storeInDB(jobName, buildInfo) {
	const item = {
		projectName: jobName,
		buildNum: buildInfo.number,
		status: (buildInfo.building ? STATUS_INPROGRESS : ((buildInfo.result == 'SUCCESS') ? STATUS_PASS : STATUS_FAIL)),
		timestamp: buildInfo.timestamp,
		duration: buildInfo.duration,
	}
	for (var i = 0; i < buildInfo.actions.length; i++ ) {
		if(buildInfo.actions[i]['_class'] == 'hudson.plugins.git.util.BuildData') {
			item.repoURL = buildInfo.actions[i].remoteUrls[0];
			item.repoBranch = buildInfo.actions[i].lastBuiltRevision.branch[0].name;
		}
	}
	console.log("Storing item :");
	console.log(item);
	MongoDB.insert(config.env + "_" + config.jenkinsTable, item);
}
*/