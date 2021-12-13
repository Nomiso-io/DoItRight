const AWS = require("aws-sdk");
const fs = require('fs');

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

const exportDir = './TableData';

const questionnaireId = '7777';
const questionnaireVersion = '1';

/*********************************************************************
* Main script calls

* Run the file as
*   node <path-to-this-file>/<this-file-name>.js <subdomain-prefix>
* e.g. node ./exportQuestionnaireAsCSV.js dev
*
***********************************************************************/
exportQuestionnaireAsCSV();


/*********** Main scripts end **************/

function exportQuestionnaireAsCSV() {
	const questionnaireTable = `${subdomainPrefix}_Questionnaires`;
	const questionTable = `${subdomainPrefix}_Questions`;

	//read the questionnaire and process it
	const params = {
		Key: {
			questionnaireId: questionnaireId,
			version: questionnaireVersion,
		},
		TableName: questionnaireTable
	};

	ddbdc.get(params, (err, data) => {
		if (err) {
		  console.error("Error reading table " + params.TableName, err);
		}
		if(data) {
//			console.log(data);
			processQuestionnaire(data.Item, questionnaireTable, questionTable);
		} else {
			console.log(`No questionnaire for [id:${questionnaireId}, version:${questionnaireVersion}]`);
		}
	});
}

function processQuestionnaire(questionnaire, questionnaireTable, questionTable) {
	const fileNameWithPath = `${exportDir}/${questionnaire.name}.csv`;
	const firstLine = `\"name(name of the questionnaire)\",\"description\",\"benchmarkScore(value between 0 and 100)\"`;
	firstLine = `${firstLine},\"randomize(shuffle the answers while taking the questionnaire. Yes/No)\",\"categories[comma seperated list of categories in this questionnaire]\"\n`;

	fs.appendFileSync(
		fileNameWithPath,
		firstLine,
		err => {
			console.error("Error writing to file " + fileNameWithPath, err);
		}
	);

	questionnaire.description = questionnaire.description ? questionnaire.description.replace(/\n/g, ' ').replace(/"/g, '""') : '';
    const categories = questionnaire.categories.join(',');

	const line = `\"${questionnaire.name}\",\"${questionnaire.description}\"`;
	line = questionnaire.benchmarkScore ? `${line},\"${questionnaire.benchmarkScore}\"` : `${line},\"\"`;
	line = questionnaire.randomize ? `${line},\"Yes\"` : `${line},\"No\"`;
	line = `${line},\"${categories}\"\n`;
	fs.appendFileSync(
		fileNameWithPath,
		line,
		err => {
			console.error("Error writing to file " + fileNameWithPath, err);
		}
	);

	processQuestions(questionnaire.questions, questionnaire.categoriesMap, questionTable, `${questionnaire.name}_questions`);
}

function processQuestions(questionsList, categoriesMap, questionTable, questionsFileName) {
	const fileNameWithPath = `${exportDir}/${questionsFileName}.csv`;
	let firstLine = `\"question(question text)\",\"category(category of the question)\",\"totalAnswers(total number of answers available. value between 2 and 7)\"`;
	firstLine = `${firstLine},\"answer-1(answer with least weightage)\",\"answer-2(answer with second least weightage)\",\"answer-3(answer with next higher weightage)\",\"answer-4(answer with next higher weightage)\"`;
	firstLine = `${firstLine},\"answer-5(answer with next higher weightage)\",\"answer-6(answer with next higher weightage)\",\"answer-7(answer with highest weightage)\",\"type(select/multi-select)\"`;
	firstLine = `${firstLine},\"numberOfAnswers(number of answers to select for multi-select type)\",\"thresholdScore(the score teams are expected to perform at. A value between 10 and 10 times the number of available answers)\"`;
	firstLine = `${firstLine},\"comments(any recomendation comment if score is below threshold)\",\"hint(Any reference to help make a choice)\",\"hintURL(URL to place for hint)\"`;
	firstLine = `${firstLine},\"level(low/med/hard)\",\"NA(show Not Applicable option or not. Yes/No)\",\"reason(Show box to provide reasoning for choice. Yes/No)\"\n`;

	fs.appendFileSync(
		fileNameWithPath,
		firstLine,
		err => {
			console.error("Error writing to file " + fileNameWithPath, err);
		}
	);

	questionsList.forEach((questionId)=> {
		//read the question and process it
		const params = {
			Key: {
				id: questionId,
				version: 0,
			},
			TableName: questionTable
		};
	
		ddbdc.get(params, (err, data) => {
			if (err) {
			  console.error("Error reading table " + params.TableName, err);
			}
			if(data) {
//				console.log(data);
				processQuestion(data.Item, categoriesMap[questionId], fileNameWithPath);
			} else {
				console.log(`No question for [id:${questionId}, version:0]`);
			}
		});
	});
}

function processQuestion(question, category, fileNameWithPath) {
	const ansIds = Object.keys(question.answers);
	const ansIdsSorted = ansIds.sort((ans1, ans2) => {
		return question.answers[ans1].weightageFactor - question.answers[ans2].weightageFactor;
	})

	const ansList = [];
	for(let i = 0; i < 7; i++) {
		if(ansIds.length > i) {
			ansList.push(question.answers[ansIds[i]].answer.replace(/\n/g, ' ').replace(/"/g, '""'));
		} else {
			ansList.push("");
		}
	}

	question.question = question.question.replace(/\n/g, ' ').replace(/"/g, '""');
	if(question.comments) {
		question.comments = question.comments.replace(/\n/g, ' ').replace(/"/g, '""');
	}
	if(question.hint) {
		question.hint = question.hint.replace(/\n/g, ' ').replace(/"/g, '""');
	}

	let line = `\"${question.question}\",\"${category}\",\"${ansIds.length}\",\"${ansList[0]}\",\"${ansList[1]}\",\"${ansList[2]}\",\"${ansList[3]}\",\"${ansList[4]}\",\"${ansList[5]}\",\"${ansList[6]}\",\"${question.type}\"`;
	line = question.numberOfAnswers ? `${line},\"${question.numberOfAnswers}\"` : `${line},\"1\"`;
	line = question.thresholdScore ? `${line},\"${question.thresholdScore}\"` : `${line},\"20\"`;
	line = question.comments ? `${line},\"${question.comments}\"` : `${line},\"\"`;
	line = question.hint ? `${line},\"${question.hint}\"` : `${line},\"\"`;
	line = question.hintURL ? `${line},\"${question.hintURL}\"` : `${line},\"\"`;
	line = question.level ? `${line},\"${question.level}\"` : `${line},\"low\"`;
	line = question.NA ? `${line},\"Yes\"` : `${line},\"No\"`;
	line = question.reason ? `${line},\"Yes\"` : `${line},\"No\"\n`;
	
	fs.appendFileSync(
		fileNameWithPath,
		line,
		err => {
			console.error("Error writing to file " + fileNameWithPath, err);
		}
	);
}
