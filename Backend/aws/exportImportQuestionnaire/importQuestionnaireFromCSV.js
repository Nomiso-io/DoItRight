const AWS = require("aws-sdk");
const fs = require('fs');
const csv = require("csv-parser");

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
let ddbdc = new AWS.DynamoDB.DocumentClient(config);

const importDir = './TableData';

const questionnaireId = '8000';
const questionnaireVersion = '1';


/*********************************************************************
* Main script calls

* Run the file as
*   node <path-to-this-file>/<this-file-name>.js <subdomain-prefix>
* e.g. node ./importQuestionnaireFromCSV.js dev
*
***********************************************************************/
importQuestionnaireFromCSV();


/*********** Main scripts end **************/

function importQuestionnaireFromCSV() {
//	const importFileWithPath = `${importDir}/IC Assessment.csv`;
	const importFileWithPath = `${importDir}/IC Assessment_questions.csv`;

	var results = [];
	fs.createReadStream(importFileWithPath)
	.pipe(csv())
	.on("data", (data) => results.push(data))
	.on("end", () => {
	  console.log(results);
	  processQuestions(results, 'IC Assessment');
	});
}

function processQuestions(questionEntryList, assessmentName) {
	const error = false;
	const questionsList = [];
	const categoryMap = {};
	if(questionEntryList.length > 0) {
		const keys = Object.keys(questionEntryList[0]);

		questionEntryList.forEach(questionEntry => {
			const question = {};
			const questionId = `ques_${generateId(8)}-${generateId(4)}-${generateId(4)}-${generateId(4)}-${generateId(12)}`;
			question['id'] = questionId;
			question['answers'] = {};
			let ansIndex = 1;
			keys.forEach(key => {
				if(key.startsWith('question')) {
					if(questionEntry[key] && (questionEntry[key] != '')) {
						question['question'] = questionEntry[key];
					} else {
						console.log('Missing required field "question". Cannot proceed further.');
						error = true;
					}
				}
				if(key.startsWith('category')) {
					if(questionEntry[key] && (questionEntry[key] != '')) {
						categoryMap[questionId] = questionEntry[key];
					} else {
						console.log('Missing required field "category". Cannot proceed further.');
						error = true;
					}
				}
				if(key.startsWith('totalAnswers')) {
					if(questionEntry[key] && (questionEntry[key] != '')) {
						const ansCount = parseInt(questionEntry[key], 10);
						if(ansCount === NaN || ansCount < 2 || ansCount > 7) {
							console.log('Wrong value for field "totalAnswers". Must be a number between 2 and 7. Cannot proceed further.');
							error = true;
						}
					} else {
						console.log('Missing required field "totalAnswers". Cannot proceed further.');
						error = true;
					}
				}
				if(key.startsWith('answer-1')) {
					if(questionEntry[key] && (questionEntry[key] != '')) {
						question.answers[`ans${ansIndex}`] = {'answer': questionEntry[key], 'weightageFactor': 1};
						ansIndex += 1;
					} else {
						console.log('Missing required field "answer-1". Cannot proceed further.');
						error = true;
					}
				}
				if(key.startsWith('answer-2')) {
					if(questionEntry[key] && (questionEntry[key] != '')) {
						question.answers[`ans${ansIndex}`] = {'answer': questionEntry[key], 'weightageFactor': 2};
						ansIndex += 1;
					} else {
						console.log('Missing required field "answer-2". Cannot proceed further.');
						error = true;
					}
				}
				if(key.startsWith('answer-3')) {
					if(questionEntry[key] && (questionEntry[key] != '')) {
						question.answers[`ans${ansIndex}`] = {'answer': questionEntry[key], 'weightageFactor': 3};
						ansIndex += 1;
					}
				}
				if(key.startsWith('answer-4')) {
					if(questionEntry[key] && (questionEntry[key] != '')) {
						question.answers[`ans${ansIndex}`] = {'answer': questionEntry[key], 'weightageFactor': 4};
						ansIndex += 1;
					}
				}
				if(key.startsWith('answer-5')) {
					if(questionEntry[key] && (questionEntry[key] != '')) {
						question.answers[`ans${ansIndex}`] = {'answer': questionEntry[key], 'weightageFactor': 5};
						ansIndex += 1;
					}
				}
				if(key.startsWith('answer-6')) {
					if(questionEntry[key] && (questionEntry[key] != '')) {
						question.answers[`ans${ansIndex}`] = {'answer': questionEntry[key], 'weightageFactor': 6};
						ansIndex += 1;
					}
				}
				if(key.startsWith('answer-7')) {
					if(questionEntry[key] && (questionEntry[key] != '')) {
						question.answers[`ans${ansIndex}`] = {'answer': questionEntry[key], 'weightageFactor': 7};
						ansIndex += 1;
					}
				}
				if(key.startsWith('type')) {
					question['type'] = (questionEntry[key] && (questionEntry[key] != '')) ? questionEntry[key] : 'select';
				}
				if(key.startsWith('numberOfAnswers')) {
					question['numberOfAnswers'] = (questionEntry[key] && (questionEntry[key] != '')) ? parseInt(questionEntry[key], 10) : 1;
				}
				if(key.startsWith('thresholdScore')) {
					question['thresholdScore'] = (questionEntry[key] && (questionEntry[key] != '')) ? parseInt(questionEntry[key], 10) : 20;
				}
				if(key.startsWith('comments')) {
					if(questionEntry[key] && (questionEntry[key] != '')) {
						question['comments'] = questionEntry[key];
					} else {
						console.log('Missing required field "comments". Cannot proceed further.');
						error = true;
					}
				}
				if(key.startsWith('hint')) {
					if(questionEntry[key] && (questionEntry[key] != '')) {
						question['hint'] = questionEntry[key];
					}
				}
				if(key.startsWith('hintURL')) {
					if(questionEntry[key] && (questionEntry[key] != '')) {
						question['hintURL'] = questionEntry[key];
					}
				}
				if(key.startsWith('level')) {
					question['level'] = (questionEntry[key] && (questionEntry[key] != '')) ? questionEntry[key] : 'low';
				}
				if(key.startsWith('NA')) {
					question['NA'] = (questionEntry[key] && (questionEntry[key] === 'Yes')) ? true : false;
				}
				if(key.startsWith('reason')) {
					question['reason'] = (questionEntry[key] && (questionEntry[key] === 'Yes')) ? true : false;
				}
			});
			questionsList.push(question);
		});

		if(error) {
			console.log('Completed with error. Please correct them and try again.');
		} else {
			saveQuestionsInDB(questionsList);
			saveQuestionnaireInDB(assessmentName, categoryMap);
		}
	}
}

function saveQuestionsInDB(questionsList) {
	const questionTable = `${subdomainPrefix}_Questions`;

	console.log('Saving list of questions.');
	questionsList.forEach(question => {
		question['active'] = true;
		question['version'] = 0;
		question['lastVersion'] = 1;
		question['createdOn'] = new Date().getTime();
		question['createdByUser'] = 'gargi.basak@pinimbus.com';
		question['lastModifiedOn'] = new Date().getTime();
		question['modifiedBy'] = 'gargi.basak@pinimbus.com';

		const params1 = {
			Item: question,
			TableName: questionTable,
		};
		console.log(params1);
		
		ddbdc.put(params1, function(err, data) {
			if (err) {
				console.error("Error adding question " + question.id + " to table " + questionTable, err);
			} else {
				console.log("Added question " + question.id + " to table " + questionTable);
			}
		});

		question['version'] = 1;
		const params2 = {
			Item: question,
			TableName: questionTable,
		};
		console.log(params2);
		
		ddbdc.put(params2, function(err, data) {
			if (err) {
				console.error("Error adding question " + question.id + " to table " + questionTable, err);
			} else {
				console.log("Added question " + question.id + " to table " + questionTable);
			}
		});
	});
}

function saveQuestionnaireInDB(assessmentName, categoryMap) {
	const questionnaireTable = `${subdomainPrefix}_Questionnaires`;

	console.log('Saving questionnaire.');
	const categoryList = [];
	const questionsList = Object.keys(categoryMap);
	questionsList.forEach(qId => {
		if(!categoryList.includes(categoryMap[qId])) {
			categoryList.push(categoryMap[qId]);
		}
	})

	const questionnaire = {
		questionnaireId: `${generateId(4)}`,
		version: '1',
		name: assessmentName,
		active: true,
		questions: questionsList,
		categoriesMap: categoryMap,
		categories: categoryList,
		randomize: false,
		createdBy: 'gargi.basak@pinimbus.com',
		createdOn: new Date().getTime(),
	}

	const params = {
		Item: questionnaire,
		TableName: questionnaireTable,
	};
	console.log(params);
	
	ddbdc.put(params, function(err, data) {
		if (err) {
			console.error("Error adding questionnaire " + questionnaire.questionnaireId + " to table " + questionnaireTable, err);
		} else {
			console.log("Added questionnaire " + questionnaire.questionnaireId + " to table " + questionnaireTable);
		}
	});

}

function generateId(power) {
	return Math.trunc(Math.random() * Math.pow(10, power));
}
