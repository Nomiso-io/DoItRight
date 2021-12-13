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

let dbConfig = {
  "apiVersion": "2012-08-10",
  "region":"us-west-2",
}

let ciConfig = {
	"apiVersion": "2016-04-18",
	"region":"us-west-2",
}
  
if(subdomainPrefix === 'local') {
	subdomainPrefix = 'dev';
	dbConfig['endpoint'] = "http://localhost:8000";
}
let ddbdc = new AWS.DynamoDB.DocumentClient(dbConfig);
let cisp = new AWS.CognitoIdentityServiceProvider(ciConfig);

const importDir = './TableData';

/*********************************************************************
* Main script calls

* Run the file as
*   node <path-to-this-file>/<this-file-name>.js <subdomain-prefix>
* e.g. node ./importTableDataFromJSON.js dev
*
***********************************************************************/
importTableDataFromJSONFile();

/*********** Main scripts end **************/

function importTableDataFromJSONFile() {
//  commonTableFunctions.importTableDataFromJSONFile(ddbdc, configsTableFunctions.getConfigsTableNameFor(subdomainPrefix), importDir);
	cognitoUsersTableFunctions.importTableDataFromJSONFile(ddbdc, cisp, subdomainPrefix, importDir);
//	teamTableFunctions.importTableDataFromJSONFile(ddbdc, subdomainPrefix, importDir);
//	questionsTableFunctions.importTableDataFromJSONFile(ddbdc, subdomainPrefix, importDir);
//	questionnairesTableFunctions.importTableDataFromJSONFile(ddbdc, subdomainPrefix, importDir);
//	userAssessmentsTableFunctions.importTableDataFromJSONFile(ddbdc, subdomainPrefix, importDir);
}
