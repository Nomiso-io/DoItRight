import { API, Handler } from '@apis/index';
import { deactivateTeam } from '@root/utils/dynamoDb/createTeams';
import { appLogger, responseBuilder } from '@utils/index';
import { Response } from 'express';

interface GetTeamConfig {
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
  params: {
    teamId: string;
  };
}

async function handler(request: GetTeamConfig, response: Response) {
  appLogger.info({ GetTeamConfig: request }, 'Inside Handler');

  const { headers } = request;
  const { params } = request;
  const cognitoUserId = headers.user['cognito:username'];
  if (!cognitoUserId || !params.teamId) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Unauthorized');
    return responseBuilder.unauthorized(err, response);
  }
  const resp: any = await deactivateTeam(params.teamId);
  appLogger.info({ deactivateTeam_Resp: resp });
  return responseBuilder.ok(resp, response);
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'delete',
  route: '/api/v2/admin/createteam/:teamId',
};
