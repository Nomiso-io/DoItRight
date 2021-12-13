const fs = require('fs');

//const mainTableName = 'Questionnaires';
const QUESTIONNAIRES_TABLE_NAME = 'Questionnaires';

exports.getQuestionnairesTableNameFor = (tablePrefix) => {
//	return tablePrefix + '_' + mainTableName;
	return tablePrefix + '_' + QUESTIONNAIRES_TABLE_NAME;
}

//exports.createQuestionnairesTable = (ddb, tableName) => {
exports.createQuestionnairesTable = (ddb, tablePrefix) => {
	const tableName = this.getQuestionnairesTableNameFor(tablePrefix);
	let params = {
	    AttributeDefinitions: [
	        {
	            AttributeName: "questionnaireId",
	            AttributeType: "S",
	        },
	        {
	            AttributeName: "version",
	            AttributeType: "S",
	        },
	    ],
	    KeySchema: [
	        {
	            AttributeName: "questionnaireId",
	            KeyType: "HASH",
	        },
	        {
	            AttributeName: "version",
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

exports.importTableDataFromJSONFile = (ddbdc, tablePrefix, importDir) => {
	const tableName = this.getQuestionnairesTableNameFor(tablePrefix);
	const fileNameWithPath = `${importDir}/${tableName}.json`;

	try {
		const data = fs.readFileSync(fileNameWithPath, 'utf8');
		const questionnairesDetails = JSON.parse(data);

		questionnairesDetails.forEach((questionnaireDetail, index) => {
			console.log("Questionnaire " + index + ": ", questionnaireDetail);
			const params = {
				Item: questionnaireDetail,
				TableName: tableName,
			};

			ddbdc.put(params, function(err, data) {
				if (err) {
					console.error("Error adding questionnaire " + questionnaireDetail.questionnaireId + " to table " + tableName, err);
				} else {
					console.log("Added questionnaire " + questionnaireDetail.questionnaireId + " to table " + tableName);
				}
			});
		});
	} catch (err) {
		console.error("Error reading and parsing data from " + fileNameWithPath, err)
	}
}
