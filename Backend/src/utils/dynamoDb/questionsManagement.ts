//This file carries Questionnaire Upload from JSON & XLSX
//Questionnaire Download to JSON & XLSX
//Questions UPDATE EDIT and Soft Delete
//This is currently a Backend only operation

import { Answer } from '@models/index';
import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import { readFileSync, writeFileSync } from 'fs';
import { zeroFill } from '../common/paddingZeroes';
import { getCategoryList } from './getCategoryRecommendations';
import { getQuestionDetails, getQuestionsList } from './index';
import { update } from './sdk';

export const addQuestions = async (
  questions: any,
  questionnaireId: string,
  newQuestionnaire: boolean
): Promise<any> => {
  const questionsToAdd: any[] = [];
  Object.keys(questions).forEach((val: any) => {
    questionsToAdd.push(questions[val]);
  });
  const putRequestList: any[] = [];
  const questionIds: any = {};
  for (const val of questionsToAdd) {
    const i = questionsToAdd.indexOf(val);
    const answers: {
      [answerId: string]: Answer;
    } = {};

    let id = '';
    const getAnswersResult = await getAnswersQues(val.id);
    const { QuesAnswers, quesIdExists } = getAnswersResult;
    let quesChange: boolean = false;
    QuesAnswers.forEach((qid: string) => {
      if (!Object.keys(val.answers).includes(qid)) {
        quesChange = true;
      }
    });
    if (newQuestionnaire || !quesIdExists) {
      id = `ques${questionnaireId}` + zeroFill(i, 3);
    } else if (quesChange) {
      id = `${val.id}` + zeroFill(i, 1);
    } else {
      id = val.id;
    }
    if (questionIds[val.category]) {
      questionIds[val.category].push(id);
    } else {
      questionIds[val.category] = [];
      questionIds[val.category].push(id);
    }
    Object.keys(val.answers).forEach((ans, j) => {
      const ansKey =
        newQuestionnaire || !QuesAnswers.includes(ans) || !quesIdExists
          ? `ans${id}` + zeroFill(j, 2)
          : ans;
      answers[ansKey] = val.answers[ans];
    });
    const params: DynamoDB.UpdateItemInput = <DynamoDB.UpdateItemInput>(<
      unknown
    >{
      //ConditionExpression: 'attribute_exists(emailId)',
      ExpressionAttributeNames: {
        '#NA': 'NA',
        '#answers': 'answers',
        '#category': 'category',
        '#comments': 'comments',
        '#createdOn': 'createdOn',
        '#level': 'level',
        '#numberOfAnswers': 'numberOfAnswers',
        '#question': 'question',
        '#randomize': 'randomize',
        '#thresholdScore': 'thresholdScore',
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':NA': val.NA ? val.NA : false,
        ':answers': answers,
        ':category': val.category,
        ':comments': val.comments,
        ':createdOn': new Date().getTime(),
        ':level': val.level,
        ':numberOfAnswers': val.numberOfAnswers,
        ':question': val.question,
        ':randomize': val.randomize ? val.randomize : false,
        ':thresholdScore': val.thresholdScore ? val.thresholdScore : 20,
        ':type': val.type,
      },
      Key: {
        id,
      },
      TableName: TableNames.getQuestionsTableName(),
      UpdateExpression:
        'SET #answers = :answers, #category = :category, #comments = :comments, #createdOn = :createdOn, #level = :level, #numberOfAnswers = :numberOfAnswers, #question = :question, #thresholdScore = :thresholdScore, #type = :type, #NA = :NA, #randomize = :randomize',
    });

    putRequestList.push(params);
  }
  for (const params of putRequestList) {
    appLogger.info({ addQuestions_update_params: params });
    await update(params);
  }
  return questionIds;
};

export const xlsxToQuestionJSON = async (filename: string) => {
  const regex = /A[0-9]-ID/g;
  const regAns = /A[0-9]-Answer/g;
  const regWeight = /A[0-9]-Weightage/g;
  const result: any = [];
  const parser = new (require('simple-excel-to-json').XlsParser)();
  const doc = parser.parseXls2Json(`./${filename}`);
  //print the data of the first sheet
  doc[0].forEach((val: any) => {
    const question: any = {};
    let id = '';
    /* tslint:disable:no-string-literal */
    Object.keys(val).forEach((keys: string) => {
      if (keys.match(regex) || keys.match(regAns) || keys.match(regWeight)) {
        if (val[keys]) {
          if (keys.match(regex)) {
            if (!question['answers']) {
              question['answers'] = {};
            }
            question['answers'][val[keys]] = {};
            id = val[keys];
          } else if (keys.match(regAns)) {
            question['answers'][id]['answer'] = val[keys];
          } else if (keys.match(regWeight)) {
            question['answers'][id]['weightage'] = val[keys];
          }
        }
      } else {
        question[keys] = val[keys];
      }
    });
    /* tslint:enable:no-string-literal */
    if (question.id.length > 0) {
      result.push(question);
    }
  });
  return result;
};

export const uploadQuestionnaire = async (
  filename: string,
  questionnaireDetails: any,
  userId: string,
  xlsx: boolean,
  newFlag: boolean
) => {
  const questionnaireId: string = questionnaireDetails.questionnaireId;
  let questions: any;
  questions = xlsx
    ? await xlsxToQuestionJSON(filename)
    : JSON.parse(readFileSync(`./${filename}`, 'utf-8').trim());
  const questionIds: any = await addQuestions(
    questions,
    questionnaireId,
    newFlag
  );
  const categories: string[] = await getCategoryList();
  const newCategories: string[] = new Array();
  Object.keys(questionIds).forEach((id: string) => {
    if (!categories.includes(id)) {
      newCategories.push(id);
    }
  });
  const questionnaireQuestionsList = concatLists(questionIds);
  const params: DynamoDB.UpdateItemInput = <DynamoDB.UpdateItemInput>(<unknown>{
    ExpressionAttributeNames: {
      '#active': 'active',
      '#createdBy': 'createdBy',
      '#createdOn': 'createdOn',
      '#name': 'name',
      '#questions': 'questions',
    },
    ExpressionAttributeValues: {
      ':active': true,
      ':createdBy': userId,
      ':createdOn': new Date().getTime(),
      ':name': questionnaireDetails.name,
      ':questions': questionnaireQuestionsList,
    },
    Key: {
      questionnaireId,
    },
    TableName: TableNames.getQuestionnairesTableName(),
    UpdateExpression:
      'SET #active = :active, #createdBy = :createdBy, #createdOn = :createdOn, #name = :name, #questions = :questions',
  });

  return update(params);
};

export const getQuestions = async (questionnaireId: string): Promise<any> => {
  const quesDetails = [];
  const res = await getQuestionsList({
    quesType: questionnaireId,
  });
  for (const val of res) {
    const ques = await getQuestionDetails(val);
    quesDetails.push(ques);
    if (quesDetails.length === res.length) {
      // resolve(quesDetails);
      return quesDetails;
    }
  }
};

function removeLinebreaks(str: string) {
  return str.toString().replace(/[\r\n"]+/gm, '');
}

export const questionnaireToxlsx = async (questionnaireId: string) => {
  const result: any = await getQuestions(questionnaireId);
  let maxAnswersCount = 0;
  for (const question of result) {
    if (Object.keys(question.answers).length > maxAnswersCount) {
      maxAnswersCount = Object.keys(question.answers).length;
    }
  }
  result.forEach((ques: any, i: number) => {
    result[i][`question`] = removeLinebreaks(result[i][`question`]);
    Object.keys(ques.answers).forEach((ans: any, j: number) => {
      const ansNo = `A${j}`;
      result[i][`${ansNo}-ID`] = ans;
      result[i][`${ansNo}-Answer`] = ques.answers[ans].answer;
      result[i][`${ansNo}-Weightage`] = ques.answers[ans].weightageFactor;
    });
    const numberOfAnswers = Object.keys(ques.answers).length;
    if (Object.keys(ques.answers).length < maxAnswersCount) {
      for (let k = numberOfAnswers; k < maxAnswersCount; k += 1) {
        const ansNo = `A${k}`;
        result[i][`${ansNo}-ID`] = ' ';
        result[i][`${ansNo}-Answer`] = ' ';
        result[i][`${ansNo}-Weightage`] = ' ';
      }
    }
    delete result[i].answers;
  });
  const json2xls = require('json2xls');
  const xls = json2xls(result);
  writeFileSync(`${questionnaireId}.xlsx`, xls, 'binary');
};

function concatLists(x: any) {
  let list = new Array();
  Object.keys(x).forEach((val) => {
    list = list.concat(x[val]);
  });
  return list;
}

async function getAnswersQues(id: string) {
  const error = new Array();
  const quesDetails: any = await getQuestionDetails(id).catch((e: any) => {
    error.push(e.message);
  });
  if (error.length > 0 || !quesDetails) {
    return { QuesAnswers: [], quesIdExists: false };
  }
  return { QuesAnswers: Object.keys(quesDetails.answers), quesIdExists: true };
}
