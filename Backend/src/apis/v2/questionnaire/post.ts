import { API, Handler } from '@apis/index';
import {
  createQuestionnaire,
  QuestionnaireCreate,
} from '@root/utils/dynamoDb/questionnaireManagement';
import {
  appLogger,
  checkQuestionnaireNameExist,
  getNewQuestionnaireId,
  responseBuilder,
} from '@utils/index';
import { Response } from 'express';

interface PostQuestionnaire {
  body: {
    questionnaire?: QuestionnaireCreate;
    type: string;
  };
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
}

async function handler(request: PostQuestionnaire, response: Response) {
  const { body, headers } = request;
  try {
    if (body.type === 'create' && body.questionnaire) {
      let questionnaireId = '';
      body.questionnaire.createdBy = headers.user.email;
      const isNameExist = await checkQuestionnaireNameExist(
        body.questionnaire.name
      );
      if (isNameExist) {
        const error = new Error(
          'Questionnaire already exist. Please use a different name.'
        );
        appLogger.error(
          error,
          'Questionnaire already exist. Please use a different name.'
        );
        return responseBuilder.badRequest(error, response);
      }
      const done = await createQuestionnaire(body.questionnaire);
      if (!done) {
        questionnaireId = await getNewQuestionnaireId(body.questionnaire);
      }
      return responseBuilder.ok({ questionnaireId }, response);
    }

    const err = new Error('Internal error.');
    appLogger.error(err, 'Bad Request');
    return responseBuilder.internalServerError(err, response);
  } catch (err) {
    appLogger.error(err, 'Internal Server Error');
    responseBuilder.internalServerError(err, response);
  }
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'post',
  route: '/api/v2/questionnaire',
};
