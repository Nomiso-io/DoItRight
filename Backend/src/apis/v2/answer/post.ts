import { API, Handler } from '@apis/index';
import {
  appLogger,
  responseBuilder,
  updateAssessmentDetails,
} from '@utils/index';
import { Response } from 'express';

interface AnswerRequest {
  body: {
    answers: string[];
    comment: string;
    questionId: string;
    version: number;
  };
  headers: {
    user: {
      email: string;
    };
  };
  params: {
    assessmentId: string;
  };
}

async function handler(request: AnswerRequest, response: Response) {
  appLogger.info({ AnswerRequest: request }, 'Inside Handler');

  const { headers, body, params } = request;
  if (!headers.user) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Unauthorized');
    return responseBuilder.unauthorized(err, response);
  }
  const {
    user: { email },
  } = headers;
  const { assessmentId } = params;
  const { questionId, version, answers, comment } = body;

  if (!questionId || !answers) {
    const err = new Error('Missing questionId or answers');
    appLogger.error(err, 'Bad Request');
    return responseBuilder.badRequest(err, response);
  }

  try {
    await updateAssessmentDetails({
      assessmentId,
      details: { questionId, version, answers, comment },
      userId: email,
    });
    return responseBuilder.ok({ message: 'Created' }, response);
  } catch (err) {
    appLogger.error(err, 'Internal Server Error');
    responseBuilder.internalServerError(err, response);
  }
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'post',
  route: '/api/v2/assessment/:assessmentId/answer',
};
