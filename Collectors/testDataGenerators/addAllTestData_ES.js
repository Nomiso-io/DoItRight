/* **** THIS CODE IS FOR ADDING TEMPORARY TEST DATA FOR METRICS DASHBOARD TESTING **** */

const {addCICDTestDataFor} = require('./addCICDTestData_ES');
const {addQualityTestDataFor} = require('./addQualityTestData_ES');
const {addRepoTestDataFor} = require('./addRepoTestData_ES');
const {addReqTestDataFor} = require('./addReqTestData_ES');
const {addIncidentTestDataFor} = require('./addIncidentTestData_ES');
const {addGitlabCommitTestDataFor} = require('./addGitlabCommitTestData_ES');

addtestData().catch(console.error);

async function addtestData(){

	//addDataForTeamForPeriod(team, services, projs, dateStartStr, dateEndStr)
	// **** Data for dev environment ****
	await addDataForTeamForPeriod("abc", ["prod1/mserv11", "prod1/mserv12", "prod2"], ["Prod1FE", "Prod2BE", "Prod2"], "January 1, 2021", "September 30, 2021");
	await addDataForTeamForPeriod("Alpha", ["Cloud Services", "Search Services"], ["Cloud-Services", "Search-Services"], "October 1, 2020", "March 30, 2021");
	await addDataForTeamForPeriod("Team-1", ["Automations", "AI", "BigData"], ["Automations", "AI", "BigData"], "August 7, 2020", "August 24, 2021");
	await addDataForTeamForPeriod("Team-2", ["Devops", "Data centers"], ["DevOps Services", "Data Centers"], "December 1, 2020", "February 31, 2021");
	await addDataForTeamForPeriod("test team", ["DevOpsMetrics"], ["DevOpsMetricsBuild"], "October 1, 2020", "September 30, 2021");
	await addDataForTeamForPeriod("Gteam", ["DoItRight/FrontEnd", "DoItRight/BackEnd", "DoItRight/Collectors"], ["DoItRightBuild", "DoItRightBuild", "DoItRightBuild"], "October 1, 2020", "September 30, 2021");
/*
	// **** Data for beta environment ****
	await addDataForTeamForPeriod("Truminds", ["Development"], ["Development"], "November 10, 2020", "September 30, 2021");
	await addDataForTeamForPeriod("Testing", ["Testing"], ["Testing"], "August 1, 2020", "September 30, 2021");
*/
}

async function addDataForTeamForPeriod(team, services, projs, startDateStr, endDateStr) {
//    await addCICDTestDataFor(team, services, projs, startDateStr, endDateStr);
//    await addRepoTestDataFor(team, services, projs, startDateStr, endDateStr);
//    await addReqTestDataFor(team, services, projs, startDateStr, endDateStr);
//    await addQualityTestDataFor(team, services, projs, startDateStr, endDateStr);
//    await addIncidentTestDataFor(team, services, projs, startDateStr, endDateStr);
//    await addGitlabCommitTestDataFor(team, services, projs, startDateStr, endDateStr);
}