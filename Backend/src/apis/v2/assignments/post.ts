import { API, Handler } from '@apis/index';
import { appLogger, createAssignment, responseBuilder } from '@utils/index';
import { Response } from 'express';
// import uuidv1 from 'uuid/v1';

interface CreateAssignment {
  body: {
    endDate?: number;
    questionnaireId: string[];
    teamId: string[];
    type?: string;
  };
  headers: {
    user: {
      email: string;
    };
  };
}

async function handler(request: CreateAssignment, response: Response) {
  appLogger.info({ CreateAssignment: request }, 'Inside Handler');

  const { headers, body } = request;
  if (!headers.user) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Unauthorized');
    return responseBuilder.unauthorized(err, response);
  }
  const {
    user: { email },
  } = headers;
  // const { assignee, type } = body;
  try {
    await createAssignment(email, body);
    return responseBuilder.ok({ message: 'Created' }, response);
  } catch (err) {
    appLogger.error(err, 'Internal Server Error');
    responseBuilder.internalServerError(err, response);
  }
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'post',
  route: '/api/v2/assignment',
};
