const AWS = require("aws-sdk");
const commonTableFunctions = require('./commonTableFunctions');
const cognitoUsersTableFunctions = require('./cognitoUsersTableFunctions');
const configsTableFunctions  = require('./configsTableFunctions');
const questionnairesTableFunctions  = require('./questionnairesTableFunctions');
const questionsTableFunctions  = require('./questionsTableFunctions');
const teamTableFunctions  = require('./teamTableFunctions');
const userAssessmentsTableFunctions  = require('./userAssessmentsTableFunctions');

let subdomainPrefix = "dish";
let myArgs = process.argv.slice(2);
if(myArgs.length > 0) {
	subdomainPrefix = myArgs[0];
}

let config = {
  "apiVersion": "2012-08-10",
  "region":"us-east-1",
}

if(subdomainPrefix === 'local') {
	subdomainPrefix = 'dev';
	config['endpoint'] = "http://localhost:8000";
}
let ddbdc = new AWS.DynamoDB.DocumentClient(config);

const exportDir = './TableData';

/*********************************************************************
* Main script calls

* Run the file as
*   node <path-to-this-file>/<this-file-name>.js <subdomain-prefix>
* e.g. node ./exportTableDataAsJSON.js dev
*
***********************************************************************/
exportTableDataToFileAsJSON();

/*********** Main scripts end **************/

function exportTableDataToFileAsJSON() {
//  commonTableFunctions.exportAllDataToFileAsJSON(ddbdc, configsTableFunctions.getConfigsTableNameFor(subdomainPrefix), exportDir);
//  commonTableFunctions.exportAllDataToFileAsJSON(ddbdc, questionsTableFunctions.getQuestionsTableNameFor(subdomainPrefix), exportDir);
//  commonTableFunctions.exportAllDataToFileAsJSON(ddbdc, questionnairesTableFunctions.getQuestionnairesTableNameFor(subdomainPrefix), exportDir);
//  commonTableFunctions.exportAllDataToFileAsJSON(ddbdc, userAssessmentsTableFunctions.getUserAssessmentsTableNameFor(subdomainPrefix), exportDir);
//  commonTableFunctions.exportAllDataToFileAsJSON(ddbdc, teamTableFunctions.getTeamTableNameFor(subdomainPrefix), exportDir);
//  commonTableFunctions.exportAllDataToFileAsJSON(ddbdc, cognitoUsersTableFunctions.getCognitoUsersTableNameFor(subdomainPrefix), exportDir);
}
