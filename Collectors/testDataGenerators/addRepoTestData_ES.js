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

exports.addRepoTestDataFor = async function (team, services, projs, startDateStr, endDateStr) {
    generateDataForTeam(team, services, projs, startDateStr, endDateStr, ["abc@company.com", "xyz@company.com", "def@company.com", "Pankaj Gamnani", "Abhishek Marathe", "Mihika"], Math.floor(Math.random() * 96) + 24);

	//We need to force an index refresh at this point, otherwise we will not get any result in the consequent search
	await esClient.indices.refresh({ index: `${config.env}_${config.repoIndex}`});
}

async function generateDataForTeam(team, services, projs, dateStartStr, dateEndStr, memberArray, maxReqLifeInHrs) {
	for(i = 0; i < services.length; i++) {
		generateDataFor(team, services[i], projs[i], dateStartStr, dateEndStr, memberArray, maxReqLifeInHrs);
	}
}

async function generateDataFor(team, service, proj, dateStartStr, dateEndStr, memberArray, maxReqLifeInHrs) {
	startDate = new Date(dateStartStr);
	endDate = new Date(dateEndStr);
	startPullNum = 1;
	for(var date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
		for(var i = 0; i < memberArray.length; i++ ) {
			var reqCount = Math.floor(Math.random() * 6);
			await generateData(team, service, proj, memberArray[i], date, maxReqLifeInHrs, startPullNum, reqCount);
			startPullNum += reqCount;
		}
	}
}

async function generateData(team, service, proj, name, date, maxReqLifeInHrs, startPullNum, reqCount) {
	var rand = Math.floor(Math.random() * 8);
	var gap = Math.floor((10 - rand) * 3600000 / reqCount);
	var baseHour = (rand + 9) * 3600000;
	for(var i = 0; i < reqCount; i++) {
		var lifeInHrs = Math.floor(Math.random() * maxReqLifeInHrs) + 1;
		var createdOnDateTime = new Date(date.getTime() + baseHour + (gap * i));
		var reviewedOnDateTime = new Date(createdOnDateTime.getTime() + (lifeInHrs * 3600000));
		var toss = Math.random();
		if(toss < 0.2) {
			await putData(team, service, proj, name, startPullNum + i, 'CLOSED', 'REJECTED', createdOnDateTime, reviewedOnDateTime);
		} else if(toss > 0.2) {
			await putData(team, service, proj, name, startPullNum + i, 'CLOSED', 'ACCEPTED', createdOnDateTime, reviewedOnDateTime);
		} else {
			await putData(team, service, proj, name, startPullNum + i, 'OPEN', null, createdOnDateTime, null);
		}
	}
}

async function putData(team, service, proj, name, pullId, status, acceptState, createdOnDate, reviewedOnDate) {
	await esClient.index({
		index: `${config.env}_${config.repoIndex}`,
		body: {
		    teamId: team, //string [keyword]
			servicePath: service, //string [keyword]
		    projectName: proj, //string [keyword]
			repoName: proj, //string [keyword]
		    raisedBy: name, //string [keyword]
		    pullId: pullId, //number, [integer/keyword]
		    status: status, //string (OPEN/CLOSED) [keyword]
		    acceptState: (status === 'CLOSED') ? acceptState : null, //string (ACCEPTED/REJECTED) [keyword]
		    raisedOn: Math.floor(createdOnDate.getTime() / 1000), //date(converted to seconds from epoch) [date, format: epoch_second]
		    reviewedOn: (status === 'CLOSED') ? Math.floor(reviewedOnDate.getTime() / 1000) : null, //date(converted to seconds from epoch) [date, format: epoch_second]
		    url: "https://console.aws.amazon.com/codesuite/codecommit/repositories?region=us-east-1" //[text]
		}
	});
}
