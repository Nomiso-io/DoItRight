const AWS = require("aws-sdk");
const cognitoUsersTableFunctions = require('./cognitoUsersTableFunctions');
const configsTableFunctions  = require('./configsTableFunctions');
const questionnairesTableFunctions  = require('./questionnairesTableFunctions');
const questionsTableFunctions  = require('./questionsTableFunctions');
const teamTableFunctions  = require('./teamTableFunctions');
const userAssessmentsTableFunctions  = require('./userAssessmentsTableFunctions');

let subdomainPrefix = "dev";
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
let ddb = new AWS.DynamoDB(config);
//let ddbdc = new AWS.DynamoDB.DocumentClient(config);

//const COGNITO_USERS_TABLE = cognitoUsersTableFunctions.getCognitoUsersTableNameFor(subdomainPrefix);
//const CONFIGS_TABLE = configsTableFunctions.getConfigsTableNameFor(subdomainPrefix);
//const TEAM_TABLE = teamTableFunctions.getTeamTableNameFor(subdomainPrefix);
//const QUESTIONS_TABLE = questionsTableFunctions.getQuestionsTableNameFor(subdomainPrefix);
//const QUESTIONNAIRES_TABLE = questionnairesTableFunctions.getQuestionnairesTableNameFor(subdomainPrefix);
//const USER_ASSESSMENT_TABLE = userAssessmentsTableFunctions.getUserAssessmentsTableNameFor(subdomainPrefix);

/*********************************************************************
* Main script calls

* Run the file as
*   node <path-to-this-file>/<this-file-name>.js <subdomain-prefix>
* e.g. node ./createTables.js dev
*
***********************************************************************/
createAllTables();

/*********** Main scripts end **************/

// Call DynamoDB to create the table
function createAllTables() {
//	cognitoUsersTableFunctions.createCognitoUsersTable(ddb, COGNITO_USERS_TABLE);
//	configsTableFunctions.createConfigsTable(ddb, CONFIGS_TABLE);	
//	teamTableFunctions.createTeamTable(ddb, TEAM_TABLE);
//	questionsTableFunctions.createQuestionsTable(ddb, QUESTIONS_TABLE);
//	questionnairesTableFunctions.createQuestionnairesTable(ddb, QUESTIONNAIRES_TABLE);
//	userAssessmentsTableFunctions.createUserAssessmentsTable(ddb, USER_ASSESSMENT_TABLE);
	cognitoUsersTableFunctions.createCognitoUsersTable(ddb, subdomainPrefix);
	configsTableFunctions.createConfigsTable(ddb, subdomainPrefix);	
	teamTableFunctions.createTeamTable(ddb, subdomainPrefix);
	questionsTableFunctions.createQuestionsTable(ddb, subdomainPrefix);
	questionnairesTableFunctions.createQuestionnairesTable(ddb, subdomainPrefix);
	userAssessmentsTableFunctions.createUserAssessmentsTable(ddb, subdomainPrefix);
}
