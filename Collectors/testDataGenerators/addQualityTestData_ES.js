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

	//generateDataForTeam(team, services, projs, dateStartStr, dateEndStr, minValue, maxValue)
	// **** Data for dev environment ****
	await generateDataForTeam("abc", ["prod1", "prod2"], ["Prod1", "Prod2"], "January 1, 2021", "September 30, 2021", 30, 80);
	await generateDataForTeam("Alpha", ["Cloud Services", "Search Services"], ["Cloud-Services", "Search-Services"], "October 1, 2020", "March 30, 2021", 80, 99);
	await generateDataForTeam("Team-1", ["Automations", "AI", "BigData"], ["Automations", "AI", "BigData"], "August 7, 2020", "August 24, 2021", 40, 75);
	await generateDataForTeam("Team-2", ["Devops", "Data centers"], ["DevOps Services", "Data Centers"], "December 1, 2020", "February 31, 2021", 50, 99);
	await generateDataForTeam("test team", ["DevOpsMetrics"], ["DevOpsMetricsBuild"], "October 1, 2020", "September 30, 2021", 70,90);
	await generateDataForTeam("Gteam", ["DoItRight"], ["DoItRightBuild"], "October 1, 2020", "September 30, 2021", 70, 95);

	// **** Data for beta environment ****
//	await generateDataFor("Truminds", ["Development"], ["Development"], "November 10, 2020", "September 30, 2021", 30, 80);
//	await generateDataFor("Testing", ["Testing"], ["Testing"], "August 1, 2020", "September 30, 2021", 40, 95);

	//We need to force an index refresh at this point, otherwise we will not get any result in the consequent search
	await esClient.indices.refresh({ index: `${config.env}_${config.qualityIndex}`});
}
*/

exports.addQualityTestDataFor = async function (team, services, projs, startDateStr, endDateStr) {
    generateDataForTeam(team, services, projs, startDateStr, endDateStr, Math.floor(Math.random() * 50) + 30, Math.floor(Math.random() * 30) + 75);

	//We need to force an index refresh at this point, otherwise we will not get any result in the consequent search
	await esClient.indices.refresh({ index: `${config.env}_${config.qualityIndex}`});
}
	
async function generateDataForTeam(team, services, projs, dateStartStr, dateEndStr, minValue, maxValue) {
	for(i = 0; i < services.length; i++) {
		generateDataFor(team, services[i], projs[i], dateStartStr, dateEndStr, minValue, maxValue);
	}
}

async function generateDataFor(team, service, proj, dateStartStr, dateEndStr, minValue, maxValue) {
	startDate = new Date(dateStartStr);
	endDate = new Date(dateEndStr);
//	startBuildNum = 1;
	for(var date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
//		numBuildOnDay = Math.floor(Math.random() * maxBuildsPerDay) + 1;
		await generateData(team, service, proj, date, minValue, maxValue);
//		startBuildNum += numBuildOnDay;
	}
}

async function generateData(team, service, proj, date, minValue, maxValue) {
	var coverage = Math.floor(Math.random() * (maxValue - minValue)) + minValue;
	var duplications = Math.floor(Math.random() * (maxValue - minValue)) + minValue;
	var maintainability = Math.floor(Math.random() * (maxValue - minValue)) + minValue;
	var reliability = Math.floor(Math.random() * (maxValue - minValue)) + minValue;
	var security = Math.floor(Math.random() * (maxValue - minValue)) + minValue;
	await putData(team, service, proj, date, coverage, duplications, maintainability, reliability, security);

/*	var gap = Math.floor(16 * 3600000 / buildsCount);
	var baseHour = 7 * 3600000;
	for(var i = 0; i < buildsCount; i++) {
		var dateTime = new Date(date.getTime() + baseHour + (gap * i));
		var toss = Math.random();
		if(toss < 0.2) {
			var duration = Math.floor(Math.random() * 5) + 1;
			await putData(team, proj, startBuildNum + i, dateTime, duration, 'FAILURE');
		} else if(toss > 0.2) {
			var duration = Math.floor(Math.random() * 10) + 1;
			await putData(team, proj, startBuildNum + i, dateTime, duration, 'SUCCESS');
		} else {
			var duration = Math.floor(Math.random() * 8) + 1;
			await putData(team, proj, startBuildNum + i, dateTime, duration, 'ABORTED');
		}
	}
*/
}

async function putData(team, service, proj, date, coverage, duplications, maintainability, reliability, security) {
	await esClient.index({
		index: `${config.env}_${config.qualityIndex}`,
		body: {
			teamId: team, //string [keyword]
			servicePath: service, //string [keyword]
			projectName: proj, //string [keyword]
			timestamp: Math.floor(date.getTime() / 1000), //date(converted to seconds from epoch) [date, format: epoch_second]
			coverage: coverage, //number [short]
			duplications: duplications, //number [short]
			maintainability: maintainability, //number [short]
			reliability: reliability, //number [short]
			security: security, //number [short]
			url: `http://ec2-54-146-210-161.compute-1.amazonaws.com/sonarQube/${proj}`, //string [text]
		}
	});
}
