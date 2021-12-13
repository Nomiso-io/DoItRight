const fs = require('fs');

//const mainTableName = 'Questions';
const QUESTIONS_TABLE_NAME = 'Questions';

exports.getQuestionsTableNameFor = (tablePrefix) => {
//	return tablePrefix + '_' + mainTableName;
	return tablePrefix + '_' + QUESTIONS_TABLE_NAME;
}

//exports.createQuestionsTable = (ddb, tableName) => {
exports.createQuestionsTable = (ddb, tablePrefix) => {
	const tableName = this.getQuestionsTableNameFor(tablePrefix);
	let params = {
	    AttributeDefinitions: [
	        {
	            AttributeName: "id",
	            AttributeType: "S",
	        },
	        {
	            AttributeName: "version",
	            AttributeType: "N",
	        },
	    ],
	    KeySchema: [
	        {
	            AttributeName: "id",
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
	const tableName = this.getQuestionsTableNameFor(tablePrefix);
	const fileNameWithPath = `${importDir}/${tableName}.json`;

	try {
		const data = fs.readFileSync(fileNameWithPath, 'utf8');
		const questionsDetails = JSON.parse(data);

		questionsDetails.forEach((questionDetail, index) => {
			console.log("Question " + index + ": ", questionDetail);
			const params = {
				Item: questionDetail,
				TableName: tableName,
			};

			ddbdc.put(params, function(err, data) {
				if (err) {
					console.error("Error adding question " + questionDetail.id + " to table " + tableName, err);
				} else {
					console.log("Added question " + questionDetail.id + " to table " + tableName);
				}
			});
		});
	} catch (err) {
		console.error("Error reading and parsing data from " + fileNameWithPath, err)
	}
}
