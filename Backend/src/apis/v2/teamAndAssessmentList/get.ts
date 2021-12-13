import { API, Handler } from '@apis/index';
import {
  appLogger,
  getAssessments,
  getTeams2,
  responseBuilder,
} from '@utils/index';
import { Response } from 'express';

export interface GetAssessmentAndTeamDetails {
  headers: {
    user: {
      'cognito:groups': string[];
      email: string;
    };
  };
  query: {
    teamId: string;
  };
}

async function handler(
  request: GetAssessmentAndTeamDetails,
  response: Response
) {
  appLogger.info({ GetAssessmentAndTeamDetails: request }, 'Inside Handler');

  const { query, headers } = request;
  const strLiteral = 'teams';

  try {
    const assessmentDetails: any = await getAssessments(
      headers.user['cognito:groups']
        ? headers.user['cognito:groups'][0]
        : query.teamId
    );

    assessmentDetails[strLiteral] = await getTeams2(
      headers.user['cognito:groups']
        ? headers.user['cognito:groups'][0] === 'Admin'
          ? 'admin'
          : headers.user.email
        : headers.user.email
    );
    return responseBuilder.ok(assessmentDetails, response);
  } catch (err) {
    appLogger.error(err, 'Internal Server Error');
    responseBuilder.internalServerError(err, response);
  }
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route: '/api/v2/assessmentAndTeam',
};
