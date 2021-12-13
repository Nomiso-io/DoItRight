/* **** THIS CODE IS FOR ADDING TEMPORARY TEST DATA FOR METRICS DASHBOARD TESTING **** */

const { Client } = require('@elastic/elasticsearch');
const {config} = require('./config');

const esClient = new Client({
  node: config.elasticSearchURL,
  auth: {
    username: config.elasticSearchUser,
    password: config.elasticSearchPass
  }
});

/*
addtestData().catch(console.error);

async function addtestData(){

	//generateDataFor(team, services, projs, memberArray, dateStartStr, dateEndStr, maxReqLifeInHrs)
	// **** Data for dev environment ****
	await generateDataForTeam("abc", ["prod1", "prod2"], ["Prod1", "Prod2"], "January 1, 2021", "September 30, 2021", ["abc@company.com", "xyz@company.com", "def@company.com"], 24);
	await generateDataForTeam("Alpha", ["Cloud Services", "Search Services"], ["Cloud-Services", "Search-Services"], "October 1, 2020", "March 30, 2021", ["abc@company.com", "xyz@company.com"], 48);
	await generateDataForTeam("Team-1", ["Automations", "AI", "BigData"], ["Automations", "AI", "BigData"], "August 7, 2020", "August 24, 2021", ["def@company.com", "ijklm@company.com", "abcde@company.com"], 72);
	await generateDataForTeam("Team-2", ["Devops", "Data centers"], ["DevOps Services", "Data Centers"], "December 1, 2020", "February 31, 2021", ["ram@tech.com", "dan@tech.com"], 24);
	await generateDataForTeam("test team", ["DevOpsMetrics"], ["DevOpsMetricsBuild"], "October 1, 2020", "September 30, 2021", ["ram@tech.com", "dan@tech.com", "sam@tech.com", "tom@tech.com"], 24);
	await generateDataForTeam("Gteam", ["DoItRight"], ["DoItRightBuild"], "October 1, 2020", "September 30, 2021", ["Pankaj Gamnani", "Abhishek Marathe", "Mihika"], 48);

	// **** Data for beta environment ****
//	await generateDataFor("Truminds", ["Development"], ["Development"], "November 10, 2020", "September 30, 2021", ["gargi", "hassan", "rachit", "darshan"], 24);
//	await generateDataFor("Testing", ["Testing"], ["Testing"], "August 1, 2020", "September 30, 2021", ["vaida", "rachit", "arvenka"], 48);

	//We need to force an index refresh at this point, otherwise we will not get any result in the consequent search
	await esClient.indices.refresh({ index: `${config.env}_${config.repoIndex}`});
}
*/

exports.addGitlabCommitTestDataFor = async function (team, services, projs, startDateStr, endDateStr) {
    generateDataForTeam(team, services, projs, startDateStr, endDateStr, ["abc@company.com", "xyz@company.com"], (Math.floor(Math.random() * 96) + 24) * 60);

	//We need to force an index refresh at this point, otherwise we will not get any result in the consequent search
	await esClient.indices.refresh({ index: `${config.env}_${config.repoIndex}`});
}

async function generateDataForTeam(team, services, projs, dateStartStr, dateEndStr, memberArray, maxDurationInMin) {
	for(i = 0; i < services.length; i++) {
		generateDataFor(team, services[i], projs[i], dateStartStr, dateEndStr, memberArray, maxDurationInMin);
	}
}

async function generateDataFor(team, service, proj, dateStartStr, dateEndStr, memberArray, maxDurationInMin) {
	startDate = new Date(dateStartStr);
	endDate = new Date(dateEndStr);
	startCommitId = 1;
	for(var date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
		var i = Math.floor(Math.random() * memberArray.length);
		var commitCount = Math.floor(Math.random() * 3);
		await generateData(team, service, proj, memberArray[i], date, maxDurationInMin, startCommitId, commitCount);
		startCommitId += commitCount;
	}
}

async function generateData(team, service, proj, name, date, maxDurationInMin, startCommitId, commitCount) {
	var rand = Math.floor(Math.random() * 8);
	var gap = Math.floor((10 - rand) * 3600000 / commitCount);
	var baseHour = (rand + 9) * 3600000;
	for(var i = 0; i < commitCount; i++) {
		var durationInMin = Math.floor(Math.random() * maxDurationInMin) + 30;
		var delayInMin = Math.floor(Math.random() * (20 * 60)) + 2;
		var commitDate = new Date(date.getTime() + baseHour + (gap * i));
		var pipelineStartDate = new Date(commitDate.getTime() + (delayInMin * 60000));
		var pipelineEndDate = new Date(pipelineStartDate.getTime() + (durationInMin * 60000));
		var pipelineId = Math.floor(Math.random() * 100000) + 1;
		var toss = Math.random();
		if(toss < 0.3) {
			await putData(team, service, proj, startCommitId + i, name,  commitDate, pipelineId, 'success', pipelineStartDate, pipelineEndDate);
		} else if(toss < 0.45) {
			await putData(team, service, proj, startCommitId + i, name,  commitDate, pipelineId, 'failed', pipelineStartDate, pipelineEndDate);
		} else if(toss < 0.5) {
			await putData(team, service, proj, startCommitId + i, name,  commitDate, pipelineId, 'running', pipelineStartDate, null);
		} else {
			await putData(team, service, proj, startCommitId + i, name,  commitDate, null, null, null, null);
		}
	}
}

async function putData(team, service, proj, commitId, committedBy, commitDate, pipelineId, status, pipelineStartDate, pipelineEndDate) {
	await esClient.index({
		index: `${config.env}_${config.gitlabCommitIndex}`,
		body: {
			teamId: team, //string [keyword]
			servicePath: service, //string [keyword]
		    projectName: proj, //string [keyword]
			repoName: proj, //string [keyword]
			commitId: commitId, //string [keyword]
			committedBy: committedBy, //string [keyword]
			commitDate: Math.floor(commitDate.getTime() / 1000), //date(converted to seconds from epoch) [date, format: epoch_second]
			pipelineId: pipelineId ? pipelineId : null, //string [keyword]
			ref: pipelineId ? commitId : null, //string [keyword]
			pipelineStatus: status ? status : null, //string (success/failed/running) [keyword]
			pipelineStartDate: pipelineStartDate ? Math.floor(pipelineStartDate.getTime() / 1000) : null, //date(converted to seconds from epoch) [date, format: epoch_second]
			pipelineEndDate: pipelineEndDate ? Math.floor(pipelineEndDate.getTime() / 1000) : null, //date(converted to seconds from epoch) [date, format: epoch_second]
		    url: `https://pinimbus.gitlab.com/projects/${proj}/repos/${proj}/commits/${commitId}` //[text]
		}
	});
}
