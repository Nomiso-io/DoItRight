import { API, Handler } from '@apis/index';
import {
  appLogger,
  responseBuilder,
  updateAssessmentFeedback,
} from '@utils/index';
import { Response } from 'express';

interface FeedbackRequest {
  body: {
    comment: string;
    rating: number;
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

async function handler(request: FeedbackRequest, response: Response) {
  appLogger.info({ FeedbackRequest: request }, 'Inside Handler');

  const { headers, params, body } = request;
  if (!headers.user) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Unauthorized');
    return responseBuilder.unauthorized(err, response);
  }
  const {
    user: { email },
  } = headers;
  const { assessmentId } = params;
  const { comment, rating } = body;

  try {
    await updateAssessmentFeedback({
      assessmentId,
      details: { rating, comment },
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
  route: '/api/v2/:assessmentId/feedback',
};
