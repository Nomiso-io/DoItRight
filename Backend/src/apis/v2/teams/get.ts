import { API, Handler } from '@apis/index';
// import { config } from '@root/config';
import {
  appLogger,
  getTeams2,
//  getUserDocument,
  responseBuilder,
} from '@utils/index';
import { Response } from 'express';

interface GetTeamsRequest {
  headers: {
    user?: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
  params: {
    selectTeam?: string;
  };
}

//interface Teams {
//    teamList: [];
//}

async function handler(request: GetTeamsRequest, response: Response) {
  appLogger.info({ GetTeamsRequest: request }, 'Inside Handler');

  const { user } = request.headers;
  const { selectTeam } = request.params;
  let teams: any;
  if (!user) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Unauthorized');
    return responseBuilder.unauthorized(err, response);
  }
  if (selectTeam && selectTeam === 'myteams') {
    teams = await getTeams2(user.email);
    return responseBuilder.ok(teams, response);
/*    teams = await getTeams2('admin');
    const userDocument = await getUserDocument({
      cognitoUserId: user['cognito:username'],
    });
    const userTeams = userDocument.teams.map((team: any) => team.name);
    const filterTeams = teams.filter((team: any) =>
      userTeams.includes(team.teamId)
    );
    return responseBuilder.ok(filterTeams, response);
  */
  }
  if (selectTeam && selectTeam === 'selectTeam') {
    teams = await getTeams2('admin');
    appLogger.info({ getTeams2: teams });
    return responseBuilder.ok(teams, response);
  }
  teams = await getTeams2(
    user['cognito:groups']
      ? user['cognito:groups'][0] === 'Admin'
        ? 'admin'
        : user.email
      : user.email
  );
  appLogger.info({ getTeams2: teams });
  return responseBuilder.ok(teams, response);
}

export const api: API = {
  handler: <Handler>handler,
  method: 'get',
  route: '/api/v2/teamlist/:selectTeam?',
};
