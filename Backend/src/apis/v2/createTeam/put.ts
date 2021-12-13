import { API, Handler } from '@apis/index';
import { /*CreateTeamConfig,*/ TeamInfo } from '@models/index';
import { updateTeam } from '@root/utils/dynamoDb/createTeams';
import { appLogger, responseBuilder } from '@utils/index';
import { Response } from 'express';

interface AddTeams {
  body: {
//    config: CreateTeamConfig;
    orgId: string;
    values: TeamInfo;
  };
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
}

async function handler(request: AddTeams, response: Response) {
  appLogger.info({ AddTeams: request }, 'Inside Handler');

  const { headers, body } = request;
  if (
    headers.user['cognito:groups'][0] !== 'Manager' &&
    headers.user['cognito:groups'][0] !== 'Admin'
  ) {
    const err = new Error('Forbidden Access, Unauthorized user');
    appLogger.error(err, 'Forbidden');
    return responseBuilder.forbidden(err, response);
  }
  const updateData: TeamInfo = body.values;
  // updateData.orgId = body.orgId;
  if (
    headers.user['cognito:groups'][0] === 'Manager' ||
    (headers.user['cognito:groups'][0] === 'Admin' && !updateData.manager)
  ) {
    updateData.manager = headers.user.email;
  }
  const ok: any = await updateTeam(updateData, headers.user.email).catch(
    (e) => {
      appLogger.error({ err: e }, 'updateTeam');
      return { error: e.message ? e.message : 'Invalid or Illegal inputs' };
    }
  );
  appLogger.info({ updateTeam: ok });
  if (ok) {
    const err = new Error(ok.error);
    appLogger.error(err, 'Bad Request');
    return responseBuilder.badRequest(err, response);
  }
  return responseBuilder.ok({ message: ok }, response);
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'put',
  route: '/api/v2/admin/createteam',
};
