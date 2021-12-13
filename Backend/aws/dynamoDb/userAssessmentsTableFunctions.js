const fs = require('fs');

//const mainTableName = 'UserAssessments';
const USER_ASSESSMENT_TABLE_NAME = 'UserAssessments';

exports.getUserAssessmentsTableNameFor = (tablePrefix) => {
//	return tablePrefix + '_' + mainTableName;
	return tablePrefix + '_' + USER_ASSESSMENT_TABLE_NAME;
}

//exports.createUserAssessmentsTable = (ddb, tableName) => {
exports.createUserAssessmentsTable = (ddb, tablePrefix) => {
	const tableName = this.getUserAssessmentsTableNameFor(tablePrefix);
	let params = {
		AttributeDefinitions: [
			{
				AttributeName: "userId",
				AttributeType: "S",
			},
			{
				AttributeName: "assessmentId",
				AttributeType: "S",
			},
		],
		KeySchema: [
			{
				AttributeName: "userId",
				KeyType: "HASH",
			},
			{
				AttributeName: "assessmentId",
				KeyType: "RANGE",
			},
		],
//		BillingMode: PAY_PER_REQUEST, //use for on-demand billing
		ProvisionedThroughput: { //use for provisioned billing
			ReadCapacityUnits: 5,
			WriteCapacityUnits: 5,
		},
		TableName: tableName,
		GlobalSecondaryIndexes: [
			{
				IndexName: "assessmentId-index",
				KeySchema: [
					{
						AttributeName: "assessmentId",
						KeyType: "HASH"
					}
				],
				Projection: {
					ProjectionType: "ALL"
				},
//				BillingMode: PAY_PER_REQUEST, //use for on-demand billing
				ProvisionedThroughput: { //use for provisioned billing
					ReadCapacityUnits: 5,
					WriteCapacityUnits: 5
				}
			},
		]
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

exports.importTableDataFromJSONFile = (ddbdc, tablePrefix, importDir) => {
	const tableName = this.getUserAssessmentsTableNameFor(tablePrefix);
	const fileNameWithPath = `${importDir}/${tableName}.json`;

	try {
		const data = fs.readFileSync(fileNameWithPath, 'utf8');
		const assessmentsDetails = JSON.parse(data);

		assessmentsDetails.forEach((assessmentDetail, index) => {
			console.log("Assessment " + index + ": ", assessmentDetail);
			const params = {
				Item: assessmentDetail,
				TableName: tableName,
			};

			ddbdc.put(params, function(err, data) {
				if (err) {
					console.error("Error adding assessment " + assessmentDetail.assessmentId + " to table " + tableName, err);
				} else {
					console.log("Added assessment " + assessmentDetail.assessmentId + " to table " + tableName);
				}
			});
		});
	} catch (err) {
		console.error("Error reading and parsing data from " + fileNameWithPath, err)
	}
}
