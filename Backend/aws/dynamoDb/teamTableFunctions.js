const fs = require('fs');
const cognitoUsersTableFunctions = require('./cognitoUsersTableFunctions');

//const mainTableName = 'Team';
const TEAM_TABLE_NAME = 'Team';

exports.getTeamTableNameFor = (tablePrefix) => {
//	return tablePrefix + '_' + mainTableName;
	return tablePrefix + '_' + TEAM_TABLE_NAME;
}

//exports.createTeamTable = (ddb, tableName) => {
exports.createTeamTable = (ddb, tablePrefix) => {
	const tableName = this.getTeamTableNameFor(tablePrefix);
	let params = {
	    AttributeDefinitions: [
	        {
	            AttributeName: "teamId",
	            AttributeType: "S",
	        },
	    ],
	    KeySchema: [
	        {
	            AttributeName: "teamId",
	            KeyType: "HASH",
	        },
	    ],
	    ProvisionedThroughput: {
	        ReadCapacityUnits: 1,
	        WriteCapacityUnits: 1,
	    },
	    TableName: tableName,
	};
	
	// Call DynamoDB to create the table
	ddb.createTable(params, (err, data) => {
	    if (err) {
	        console.error("Error: Failed to create table " + tableName, err);
	    } else {
	        console.log("Successfully Created Table " + tableName);
	    }
	});
}

exports.insertTeamTableData = (ddbdc, tablePrefix) => {
	const tableName = this.getTeamTableNameFor(tablePrefix);

	var params = {
		TableName : tableName,
		Item: {
			teamId: 'Others',
			teamName: 'Others',
			active: 'true',
			application: 'Login',
			createdOn: new Date().getTime(),
			order: ['admin'],
			questionnaireId: [],
			questionnaires: []
		}
	};

	ddbdc.put(params, function(err, data) {
		if (err) {
			console.error("Error: Failed to insert item into table" + tableName, err);
		} else {
			console.log("Successfully inserted item into table " + tableName);
		}
	});
}

exports.importTableDataFromJSONFile = (ddbdc, tablePrefix, importDir) => {
	const tableName = this.getTeamTableNameFor(tablePrefix);
	const userTableName = cognitoUsersTableFunctions.getCognitoUsersTableNameFor(tablePrefix);
	const fileNameWithPath = `${importDir}/${tableName}.json`;

	try {
		const data = fs.readFileSync(fileNameWithPath, 'utf8');
		const teamsDetails = JSON.parse(data);

		teamsDetails.forEach((teamDetail, index) => {
			console.log("Team " + index + ": ", teamDetail);
			//get userId for manager and update the managerId field
			teamDetail.manager
			const params = {
				ExpressionAttributeNames: {
				  '#emailId': 'emailId',
				},
				ExpressionAttributeValues: {
				  ':emailId': teamDetail.manager,
				},
				FilterExpression: '#emailId = :emailId',
				TableName: userTableName,
			};
			ddbdc.scan(params, (err, data) => {
				if(err) {
					console.log("User " + teamDetail.manager + " is not found in " + userTableName, err);
				} else {
					console.log(data);
					//store the team details
					teamDetail.managerId = data.Items[0].id;
					const params1 = {
						Item: teamDetail,
						TableName: tableName,
					}

					ddbdc.put(params1, function(err1, data1) {
						if (err1) {
							console.error("Error adding team " + teamDetail.teamName + " to table " + tableName, err);
						} else {
							console.log("Added team " + teamDetail.teamName + " to table " + tableName);
						}
					});
				}
			});
		});
	} catch (err) {
		console.error("Error reading and parsing data from " + fileNameWithPath, err)
	}
}
