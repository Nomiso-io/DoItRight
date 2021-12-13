import { API, Handler } from '@apis/index';
import { addUserToTeam } from '@root/utils/dynamoDb/addUserToTeam';
// import { addUserToCognitoGroup } from '@root/utils/dynamoDb/cognitoUserFunctions';
import { appLogger, responseBuilder } from '@utils/index';
import { Response } from 'express';

interface UpdateUserTeams {
  body: {
    teams: string[];
    userId: string;
  };
  headers: {
    user: {
      email: string;
    };
  };
}

async function handler(request: UpdateUserTeams, response: Response) {
  appLogger.info({ UpdateUserTeams: request }, 'Inside Handler');

  const { headers, body } = request;
  if (!headers.user) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Unauthorized');
    return responseBuilder.unauthorized(err, response);
  }
  //const { user: { email } }  = headers;
  const teamAr: string[] = body.teams;
  const userId: string = body.userId;
  const ack = await addUserToTeam(userId, teamAr[0]);
  appLogger.info({ addUserToTeam: ack });
  if (!ack) {
    return responseBuilder.ok({ message: 'Updated Successfully' }, response);
  }
  return responseBuilder.ok({ message: 'done' }, response);
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'post',
  route: '/api/v2/teamlist',
};
//addUserToCognitoGroup('557fc8d9-6142-44b4-b360-7ad4b98a83b8','Clients').then(ok=>{
//	console.log(ok);
//})
