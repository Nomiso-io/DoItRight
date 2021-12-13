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

	//generateDataFor(team, services, projs, dateStartStr, dateEndStr, typeList, numPriorities, maxItems)
	// **** Data for dev environment ****
	await generateDataForTeam("abc", ["prod1", "prod2"], ["Prod1", "Prod2"], "January 1, 2021", "September 30, 2021", ['Features', 'Bugs'], 3, 5);
	await generateDataForTeam("Alpha", ["Cloud Services", "Search Services"], ["Cloud-Services", "Search-Services"], "October 1, 2020", "March 30, 2021", ['Features', 'Bugs', 'Tasks'], 3, 5);
	await generateDataForTeam("Team-1", ["Automations", "AI", "BigData"], ["Automations", "AI", "BigData"], "August 7, 2020", "August 24, 2021", ['Requirement', 'Issues'], 3, 5);
	await generateDataForTeam("Team-2", ["Devops", "Data centers"], ["DevOps Services", "Data Centers"], "December 1, 2020", "February 31, 2021", ['Features', 'Bugs'], 4, 5);
	await generateDataForTeam("test team", ["DevOpsMetrics"], ["DevOpsMetricsBuild"], "October 1, 2020", "September 30, 2021", ['Requirement', 'Issues'], 3, 5);
	await generateDataFor("Testing", ["Testing"], ["Testing"], "August 1, 2020", "September 30, 2021", ['Story', 'Bugs', 'Tasks'], 3, 5);

	// **** Data for beta environment ****
	await generateDataFor("Truminds", ["Development"], ["Development"], "November 10, 2020", "September 30, 2021", ['Story', 'Bugs', 'Tasks'], 3, 5);
	await generateDataFor("Testing", "Testing", "August 1, 2020", "December 26, 2020", ['Features', 'Bugs'], 4, 5);

	//We need to force an index refresh at this point, otherwise we will not get any result in the consequent search
	await esClient.indices.refresh({ index: `${config.env}_${config.reqIndex}`});
}
*/

exports.addIncidentTestDataFor = async function (team, services, projs, startDateStr, endDateStr) {
    generateDataForTeam(team, services, projs, startDateStr, endDateStr, ['Incident'], 5, Math.floor(Math.random() * 3) );

	//We need to force an index refresh at this point, otherwise we will not get any result in the consequent search
	await esClient.indices.refresh({ index: `${config.env}_${config.reqIndex}`});
}

async function generateDataForTeam(team, services, projs, dateStartStr, dateEndStr, typeList, numPriorities, maxItems) {
	for(i = 0; i < services.length; i++) {
		generateDataFor(team, services[i], projs[i], dateStartStr, dateEndStr, typeList, numPriorities, maxItems);
	}
}

async function generateDataFor(team, service, proj, dateStartStr, dateEndStr, typeList, numPriorities, maxItems) {
	startDate = new Date(dateStartStr);
	endDate = new Date(dateEndStr);
	startItemNum = 1;
	for(var date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
		numItemOnDay = Math.floor(Math.random() * maxItems) + 1;
		await generateData(team, service, proj, date, numItemOnDay, startItemNum, typeList, numPriorities);
		startItemNum += numItemOnDay;
	}
}

async function generateData(team, service, proj, date, itemCount, startItemNum, typeList, numPriorities) {
	var gap = Math.floor(16 * 3600000 / itemCount);
	var baseHour = 7 * 3600000;
	for(var i = 0; i < itemCount; i++) {
		var startDate = new Date(date.getTime() + baseHour + (gap * i));
		var priority = Math.floor(Math.random() * numPriorities) + 1;
		var type = typeList[Math.floor(Math.random() * typeList.length)];
		var toss = Math.random();
		if(toss < 0.3) {
			await putData(team, service, proj, startItemNum + i, priority, type, startDate, null);
		} else {
			var endDate = new Date(startDate.getTime() + Math.floor(Math.random() * 4*24*3600000));
			await putData(team, service, proj, startItemNum + i, priority, type, startDate, endDate);
		}
	}
}

async function putData(team, service, proj, itemId, priority, type, startDate, endDate) {
	await esClient.index({
		index: `${config.env}_${config.incidentIndex}`,
		body: {
		    teamId: team, //string [keyword]
			servicePath: service, //string [keyword]
		    projectName: proj, //string [keyword]
		    itemId: itemId.toString(), //string [keyword]
		    itemPriority: priority.toString(), //string [keyword]
		    itemType: type, //string [keyword]
		    status: endDate ? 'Done' : (startDate ? 'In Progress' : 'To Do'), //string (To Do/In Progress/Done) [keyword]
			startTime: startDate ? Math.floor(startDate.getTime() / 1000) : null, //date(converted to seconds from epoch) [date, format: epoch_second]
			endTime: endDate ? Math.floor(endDate.getTime() / 1000) : null, //date(converted to seconds from epoch) [date, format: epoch_second]
		    url: `https://jira.atlassian.com/${proj}/${itemId}`, //[text]
		}
	});
}
