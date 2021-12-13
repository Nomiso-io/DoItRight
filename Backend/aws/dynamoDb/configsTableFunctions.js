//const mainTableName = 'Configs';
const CONFIGS_TABLE_NAME = 'Configs';

//const appClientIdValue = '6dr7paonmudqfqsvpnqiuepb8d';
//const appClientURLValue = 'qadoitright.auth.us-east-1.amazoncognito.com';
//const userpoolIdValue = 'us-east-1_OGtCgSmi6';
const appClientIdValue = 'xxxxxxxxxxxxxxxxxxxxxxxxxx';
const appClientURLValue = 'doitright.auth.us-east-1.amazoncognito.com';
const userpoolIdValue = 'us-east-1_xxxxxxxxx';

exports.getConfigsTableNameFor = (tablePrefix) => {
//	return tablePrefix + '_' + mainTableName;
	return tablePrefix + '_' + CONFIGS_TABLE_NAME;
}

//exports.createConfigsTable = (ddb, tableName) => {
exports.createConfigsTable = (ddb, tablePrefix) => {
	const tableName = this.getConfigsTableNameFor(tablePrefix);
	let params = {
	    AttributeDefinitions: [
	        {
	            AttributeName: "orgId",
	            AttributeType: "S",
	        },
	        {
	            AttributeName: "type",
	            AttributeType: "S",
	        },
	    ],
	    KeySchema: [
	        {
	            AttributeName: "orgId",
	            KeyType: "HASH",
	        },
	        {
	            AttributeName: "type",
	            KeyType: "RANGE",
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

exports.insertConfigsTableData = (ddbdc, tablePrefix) => {
	const tableName = this.getConfigsTableNameFor(tablePrefix);

	var params_SystemConfig = {
		Item: getSystemConfig(tablePrefix),
		TableName : tableName
	};

	ddbdc.put(params_SystemConfig, function(err, data) {
		if (err) {
			console.error("Error: Failed to insert SystemConfig into table" + tableName, err);
		} else {
			console.log("Successfully inserted SystemConfig into table " + tableName);
		}
	});

	let params_UserConfig = {
		Item: getUserConfig(tablePrefix),
		TableName: tableName
	 };
	ddbdc.putItem(params_UserConfig, function(err, data) {
		if (err) {
			console.error("Error: Failed to insert UserConfig into table" + tableName, err);
		} else {
			console.log("Successfully inserted UserConfig into table " + tableName);
		}
	});

	let params_TeamConfig = {
		Item: getTeamConfig(tablePrefix),
		TableName: tableName
	 };
	ddbdc.putItem(params_TeamConfig, function(err, data) {
		if (err) {
			console.error("Error: Failed to insert TeamConfig into table" + tableName, err);
		} else {
			console.log("Successfully inserted TeamConfig into table " + tableName);
		}
	});

	let params_ServiceConfig = {
		Item: getServiceConfig(tablePrefix),
		TableName: tableName
	 };
	ddbdc.putItem(params_ServiceConfig, function(err, data) {
		if (err) {
			console.error("Error: Failed to insert ServiceConfig into table" + tableName, err);
		} else {
			console.log("Successfully inserted ServiceConfig into table " + tableName);
		}
	});

	let params_GeneralConfig = {
		Item: getGeneralConfig(tablePrefix),
		TableName: tableName
	 };
	ddbdc.putItem(params_GeneralConfig, function(err, data) {
		if (err) {
			console.error("Error: Failed to insert GeneralConfig into table" + tableName, err);
		} else {
			console.log("Successfully inserted GeneralConfig into table " + tableName);
		}
	});
}

function getSystemConfig(tablePrefix) {
	return {
		orgId: tablePrefix,
		type: 'SystemConfig',
		config: {
			appClientId: appClientIdValue,
			appClientURL: appClientURLValue,
			userpoolId: userpoolIdValue,
			logLevel: 'warn',
		}
	};
}

function getUserConfig(tablePrefix) {
	return {
		orgId: tablePrefix,
		type: 'UserConfig',
		config: {
			emailId: {
				custom: false,
				displayName: 'Email',
				mandatory: true,
				type: 'string'
			},
			roles: {
				custom: false,
				displayName: 'Roles',
				mandatory: true,
				type: 'multi-list',
				options: { customFixed: 'Manager,Member' }
			},
			teams: {
				custom: false,
				displayName: 'Teams',
				mandatory: true,
				type: 'multi-list',
				options: { database: 'db-team-user' }
			},
		}
	};
}

function getTeamConfig(tablePrefix) {
	return {
		orgId: tablePrefix,
		type: 'TeamConfig',
		config: {
			teamName: {
				custom: false,
				displayName: 'Team Name',
				mandatory: true,
				type: 'string'
			},
			manager: {
				custom: false,
				displayName: 'Manager',
				mandatory: false,
				type: 'list',
				options: { database: 'db-user-managers' }
			},
			department: {
				custom: false,
				displayName: 'Department',
				mandatory: true,
				type: 'list-no-others',
				options: { custom: 'Others' }
			},
		}
	};
}

function getServiceConfig(tablePrefix) {
	return {
		orgId: tablePrefix,
		type: 'ServiceConfig',
		config: {
			name: {
				custom: false,
				displayName: 'Service Name',
				mandatory: true,
				type: 'string'
			},
			type: {
				custom: false,
				displayName: 'Service Type',
				mandatory: false,
				type: 'list-no-others',
				options: { custom: 'Not Applicable' }
			},
		}
	};
}

function getGeneralConfig(tablePrefix) {
	return {
		orgId: tablePrefix,
		type: 'GeneralConfig',
		config: {
			levels: [
					{
						name: 'Beginner',
						lowerLimit: 0,
						upperLimit: 30,
						color: '#949494'
					},
					{
						name: 'Intermediate',
						lowerLimit: 31,
						upperLimit: 70,
						color: '#E7B417'
					},
					{
						name: 'High',
						lowerLimit: 71,
						upperLimit: 90,
						color: '#60BC60'
					},
					{
						name: 'Elite',
						lowerLimit: 91,
						upperLimit: 100,
						color: '#017530'
					},
				],
			performanceMetricsConstant: 3,
			archiveDays: 0
		}
	};
}
