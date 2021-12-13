/* **** THIS CODE IS FOR ADDING TEMPORARY TEST DATA FOR METRICS DASHBOARD TESTING **** */

const { Client } = require('@elastic/elasticsearch');
const {config} = require('./config');

const STATUS_SUCCESS = 'SUCCESS';
const STATUS_FAILED = 'FAILED';
const STATUS_INPROGRESS = 'IN_PROGRESS';
//const STATUS_ROLLBACK = 'ROLLBACK';
const STATUS_SCHEDULED = 'SCHEDULED';
const STATUS_OTHER = 'OTHER'; //Like Aborted, Error etc.

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

	//generateDataForTeam(team, services, projs, dateStartStr, dateEndStr, maxBuildsPerDay)
	// **** Data for dev environment ****
	await generateDataForTeam("abc", ["prod1", "prod2"], ["Prod1", "Prod2"], "January 1, 2021", "September 30, 2021", 3);
	await generateDataForTeam("Alpha", ["Cloud Services", "Search Services"], ["Cloud-Services", "Search-Services"], "October 1, 2020", "March 30, 2021", 5);
	await generateDataForTeam("Team-1", ["Automations", "AI", "BigData"], ["Automations", "AI", "BigData"], "August 7, 2020", "August 24, 2021", 4);
	await generateDataForTeam("Team-2", ["Devops", "Data centers"], ["DevOps Services", "Data Centers"], "December 1, 2020", "February 31, 2021", 5);
	await generateDataForTeam("test team", ["DevOpsMetrics"], ["DevOpsMetricsBuild"], "October 1, 2020", "September 30, 2021", 4);
	await generateDataForTeam("Gteam", ["DoItRight"], ["DoItRightBuild"], "October 1, 2020", "September 30, 2021", 4);

	// **** Data for beta environment ****
//	await generateDataFor("Truminds", ["Development"], ["Development"], "November 10, 2020", "September 30, 2021", 3);
//	await generateDataFor("Testing", ["Testing"], ["Testing"], "August 1, 2020", "September 30, 2021", 4);

	//We need to force an index refresh at this point, otherwise we will not get any result in the consequent search
	await esClient.indices.refresh({ index: `${config.env}_${config.buildIndex}`});
}
*/

exports.addCICDTestDataFor = async function (team, services, projs, startDateStr, endDateStr) {
    generateDataForTeam(team, services, projs, startDateStr, endDateStr, Math.floor(Math.random() * 5) + 2);

	//We need to force an index refresh at this point, otherwise we will not get any result in the consequent search
	await esClient.indices.refresh({ index: `${config.env}_${config.buildIndex}`});
}

async function generateDataForTeam(team, services, projs, dateStartStr, dateEndStr, maxBuildsPerDay) {
	for(i = 0; i < services.length; i++) {
		generateDataFor(team, services[i], projs[i], dateStartStr, dateEndStr, maxBuildsPerDay);
	}
}

async function generateDataFor(team, service, proj, dateStartStr, dateEndStr, maxBuildsPerDay) {
	startDate = new Date(dateStartStr);
	endDate = new Date(dateEndStr);
	startBuildNum = 1;
	for(var date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
		numBuildOnDay = Math.floor(Math.random() * maxBuildsPerDay) + 1;
		await generateData(team, service, proj, date, numBuildOnDay, startBuildNum);
		startBuildNum += numBuildOnDay;
	}
}

async function generateData(team, service, proj, date, buildsCount, startBuildNum) {
	var gap = Math.floor(16 * 3600000 / buildsCount);
	var baseHour = 7 * 3600000;
	for(var i = 0; i < buildsCount; i++) {
		var dateTime = new Date(date.getTime() + baseHour + (gap * i));
		var toss = Math.random();
		if(toss < 0.2) {
			var duration = Math.floor(Math.random() * 120) + 1;
			await putData(team, service, proj, startBuildNum + i, dateTime, duration, STATUS_FAILED);
		} else if(toss < 0.8) {
			var duration = Math.floor(Math.random() * 180) + 1;
			await putData(team, service, proj, startBuildNum + i, dateTime, duration, STATUS_SUCCESS);
		} else if(toss < 0.9) {
			var duration = Math.floor(Math.random() * 30) + 1;
			await putData(team, service, proj, startBuildNum + i, dateTime, duration, STATUS_INPROGRESS);
		} else {
			var duration = Math.floor(Math.random() * 300) + 1;
			await putData(team, service, proj, startBuildNum + i, dateTime, duration, STATUS_OTHER);
		}
	}
}

async function putData(team, service, proj, buildNum, startDate, duration, status) {
	await esClient.index({
		index: `${config.env}_${config.buildIndex}`,
		body: {
		    teamId: team, //string [keyword]
			servicePath: service, //string [keyword]
		    projectName: proj, //string [keyword]
			failureWindow: 48, //number [integer]
		    buildNum: buildNum, //number [integer]
		    startTimestamp: Math.round(startDate.getTime() / 1000), //date(converted to seconds from epoch) [date, format: epoch_second]
		    endTimestamp: Math.round((startDate.getTime() + duration) / 1000), //date(converted to seconds from epoch) [date, format: epoch_second]
		    duration: duration, //number (in minutes) [integer]
			pauseDuration: 0,
		    status: status, //string (SUCCESS/FAILED/ROLLBACK/SCHEDULED/IN_PROGRESS/OTHER) [keyword]
		    url: `http://ec2-34-234-42-134.compute-1.amazonaws.com:8080/job/${proj}/${buildNum}`, //[text]
			stages: [],
		}
	});
}
