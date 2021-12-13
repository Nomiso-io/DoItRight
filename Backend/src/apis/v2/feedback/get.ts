import { API, Handler } from '@apis/index';
import {
  appLogger,
  AssessmentDocument,
  getAssessmentHistory,
  responseBuilder,
} from '@utils/index';
import { Response } from 'express';

interface FeedbackRequest {
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
}

async function handler(
  request: FeedbackRequest,
  response: Response
): Promise<any> {
  appLogger.info({ FeedbackRequest: request }, 'Inside Handler');
  const { headers } = request;
  const {
    user: { email: userId },
  } = headers;
  if (!headers.user) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Unauthorized');
    return responseBuilder.unauthorized(err, response);
  }
  if (
    headers.user['cognito:groups'][0] !== 'Manager' &&
    headers.user['cognito:groups'][0] !== 'Admin'
  ) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Forbidden');
    return responseBuilder.forbidden(err, response);
  }
  try {
    const assessmentHistory: AssessmentDocument[] = await getAssessmentHistory({
      type: 'feedback',
      userId,
    });
    return responseBuilder.ok({ assessmentHistory }, response);
  } catch (err) {
    appLogger.error(err, 'Internal Server Error');
    responseBuilder.internalServerError(err, response);
  }
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route: '/api/v2/feedback',
};
