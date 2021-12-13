const fs = require('fs');

//const mainTableName = 'CognitoUsers';
const COGNITO_USERS_TABLE_NAME = 'CognitoUsers';
const userpoolIdValue = 'us-east-1_xxxxxxxxxx'; //replace by the correct one

exports.getCognitoUsersTableNameFor = (tablePrefix) => {
//	return tablePrefix + '_' + mainTableName;
	return tablePrefix + '_' + COGNITO_USERS_TABLE_NAME;
}

//exports.createCognitoUsersTable = (ddb, tableName) => {
exports.createCognitoUsersTable = (ddb, tablePrefix) => {
	const tableName = this.getCognitoUsersTableNameFor(tablePrefix);
	let params = {
	    AttributeDefinitions: [
	        {
	            AttributeName: "id",
	            AttributeType: "S",
	        },
	    ],
	    KeySchema: [
	        {
	            AttributeName: "id",
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
	        console.error("Error creating table " + tableName, err);
	    } else {
	        console.log("Successfully Created Table " + tableName);
	    }
	});
}

exports.importTableDataFromJSONFile = (ddbdc, cisp, tablePrefix, importDir) => {
	const tableName = this.getCognitoUsersTableNameFor(tablePrefix);
	const fileNameWithPath = `${importDir}/${tableName}.json`;

	try {
		const data = fs.readFileSync(fileNameWithPath, 'utf8');
		const usersDetails = JSON.parse(data);

		usersDetails.forEach((userDetail, index) => {
			console.log("User " + index + ": ", userDetail);
			if(userDetail.emailVerified === 'true') {
				addUserToCognitoUserPoolAndTable(ddbdc, cisp, userDetail, tableName);
			}
		});
	  } catch (err) {
		console.error("Error reading and parsing data from " + fileNameWithPath, err)
	  }
}

function addUserToCognitoUserPoolAndTable(ddbdc, cisp, userDetail, tableName) {
    const params = {
		DesiredDeliveryMediums: ['EMAIL'],
		TemporaryPassword: 'Chang3Me!',
		UserAttributes: [
		  {
			Name: 'email',
			Value: userDetail.emailId,
		  },
		  {
			Name: 'email_verified',
			Value: 'true',
		  },
		  {
			Name: 'custom:teamName',
			Value: (userDetail.teams && userDetail.teams.length > 0) ? userDetail.teams[0].name : 'Others',
		  },
		],
		UserPoolId: userpoolIdValue,
		Username: userDetail.emailId,
	};

	cisp.adminCreateUser(params, (err, data) => {
		if (err) {
			console.error("Error creating user in cognito user pool for user " + userDetail.emailId, err);
		}
		if(data) {
			console.log("Added user " + userDetail.emailId + " to cognito  user pool.");
			userDetail.id = data.User.Username;
			console.log("User Id = " + userDetail.id);
			addUserToCognitoGroup(cisp, userDetail);
			addUserToDatabase(ddbdc, userDetail, tableName);
		} else {
			console.error("Error receiving data from cognito for user " + userDetail.emailId, err);
		}
	});
}

function addUserToCognitoGroup(cisp, userDetail) {
	userDetail.roles.forEach((role) => {
		const params = {
			GroupName: role,
			UserPoolId: userpoolIdValue,
			Username: userDetail.id,
		};
		cisp.adminAddUserToGroup(params, (err, data) => {
			if (err) {
				console.error("Error adding user " + userDetail.emailId + " to group " + role, err);
			} else {
				console.log("Added user " + userDetail.emailId + " to group " + role);
			}
		});
	});
}

function addUserToDatabase(ddbdc, userDetail, tableName) {
	const params = {
		ConditionExpression:
		  'attribute_not_exists(emailId) AND #emailId <> :emailId',
		ExpressionAttributeNames: {
		  '#emailId': 'emailId',
		},
		ExpressionAttributeValues: {
		  ':emailId': userDetail.emailId,
		},
		Item: userDetail,
		TableName: tableName,
	};
	
	ddbdc.put(params, function(err, data) {
		if (err) {
			console.error("Error adding user " + userDetail.emailId + " to table " + tableName, err);
		} else {
			console.log("Added user " + userDetail.emailId + " to table " + tableName);
		}
	});
}