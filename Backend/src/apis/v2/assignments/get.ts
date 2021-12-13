import { API, Handler } from '@apis/index';
import { appLogger, getAssignments, responseBuilder } from '@utils/index';
import { Response } from 'express';

export interface GetAssignment {
  headers: {
    user: {
      'cognito:groups': string[];
      email: string;
    };
  };
  query: {
    dashboard: boolean;
    manage: boolean;
    teamId: string;
  };
}

async function handler(request: GetAssignment, response: Response) {
  appLogger.info({ GetAssignment: request }, 'Inside Handler');

  // const { user: { email: userId } } = request.headers;
  const { query, headers } = request;

  //const userName = userId ? userId : request.headers.testemail;
  // const userName = userId;
  try {
    const assignmentDetails: any = query.manage
      ? await getAssignments(query.teamId, false)
      : query.dashboard
        ? await getAssignments('admin', true)
        : await getAssignments(
          headers.user['cognito:groups'][0] === 'Admin'
            ? 'admin'
            : query.teamId,
          false
        );
/*
    const assignmentDetails: any = query.manage
      ? await getAssignments(query.teamId, query.dashboard)
      : await getAssignments(
          headers.user['cognito:groups'][0] === 'Admin'
            ? 'admin'
            : query.teamId,
          query.dashboard
        );
*/
    appLogger.info({ getAssignments: assignmentDetails });
    return responseBuilder.ok(assignmentDetails, response);
  } catch (err) {
    appLogger.error(err, 'Internal Server Error');
    responseBuilder.internalServerError(err, response);
  }
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route: '/api/v2/assignment',
};
