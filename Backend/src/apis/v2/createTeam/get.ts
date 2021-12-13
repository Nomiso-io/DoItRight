import { API, Handler } from '@apis/index';
import { /*CreateTeamConfig*/ConfigItem, TeamInfo } from '@models/index';
import {
  getCreateServiceConfig,
  getCreateTeamConfig,
  getTeamDetails,
} from '@root/utils/dynamoDb/createTeams';
import { appLogger, getUserOrgId, responseBuilder } from '@utils/index';
import { Response } from 'express';

interface GetTeam {
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

async function handler(request: GetTeam, response: Response) {
  appLogger.info({ GetTeamConfig: request }, 'Inside Handler');

  const { headers } = request;
  const { params } = request;
  const cognitoUserId = headers.user['cognito:username'];

  if (!cognitoUserId) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Unauthorized');
    return responseBuilder.unauthorized(err, response);
  }
  //returns the teams details, config details of a team and the organization id if the team id is sent - edit team
  //returns the config details of a team and the organization id if the team id is not sent - create team
  let result: any;
  if (params.teamId) {
    const teamDetails: TeamInfo = await getTeamDetails(params.teamId);
    appLogger.info({ getTeamDetails: teamDetails });
    const teamConfig: ConfigItem = await getCreateTeamConfig(teamDetails.orgId);
    appLogger.info({ getCreateTeamConfig: teamConfig });
    const serviceConfig: ConfigItem = await getCreateServiceConfig(teamDetails.orgId);
    appLogger.info({ getCreateServiceConfig: serviceConfig });
    result = {
      orgId: teamConfig.orgId,
      serviceConfig: serviceConfig.config,
      teamConfig: teamConfig.config,
      values: teamDetails,
    };
  } else {
    const orgId: string = await getUserOrgId(cognitoUserId);
    appLogger.info({ getUserOrgId: orgId });
    const teamConfig: ConfigItem = await getCreateTeamConfig(orgId);
    appLogger.info({ getCreateTeamConfig: teamConfig });
    const serviceConfig: ConfigItem = await getCreateServiceConfig(orgId);
    appLogger.info({ getCreateServiceConfig: serviceConfig });
    result = {
      orgId,
      serviceConfig: serviceConfig.config,
      teamConfig: teamConfig.config,
    };
  }
  return responseBuilder.ok(result, response);
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route: '/api/v2/admin/createteam/:teamId?',
};
