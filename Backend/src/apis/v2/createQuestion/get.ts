/*tslint:disable*/
import { API, Handler } from '@apis/index';
import { Question } from '@models/index';
import {
  appLogger,
  responseBuilder,
  getQuestionsForQuestionnaire,
  getAllQuestions,
  // getSimilarQuestionSearchResults,
} from '@utils/index';
import { Response } from 'express';
// import uuidv1 from 'uuid/v1';

interface GetQuestions {
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
  query: {
    type: string;
    question: string;
  };
}

async function handler(request: GetQuestions, response: Response) {
  appLogger.info({ GetQuestions: request }, 'Inside Handler');

  const { headers, query } = request;
  if (
    headers.user['cognito:groups'][0] !== 'Manager' &&
    headers.user['cognito:groups'][0] !== 'Admin'
  ) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Forbidden');
    return responseBuilder.forbidden(err, response);
  }

  // if (query.type === 'keyword') {
  //   const searchResult = await getSimilarQuestionSearchResults(query.question);
  //   return responseBuilder.ok(searchResult, response);
  // }
  const questionList: Question[] = query.type
    ? await getQuestionsForQuestionnaire(query.type)
    : await getAllQuestions();
  appLogger.info({ getQuestions: questionList });
  questionList.sort((a: Question, b: Question) => {
    return b.lastModifiedOn - a.lastModifiedOn;
  });
  return responseBuilder.ok(questionList, response);
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route: '/api/v2/admin/createquestion',
};
/*tslint:enable*/
