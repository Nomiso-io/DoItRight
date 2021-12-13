import { API, Handler } from '@apis/index';
import { /*CreateTeamConfig,*/ TeamInfo } from '@models/index';
import { createTeam } from '@root/utils/dynamoDb/createTeams';
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
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Forbidden');
    return responseBuilder.forbidden(err, response);
  }

  const createData: TeamInfo = body.values;
  createData.orgId = body.orgId;
  if (
    headers.user['cognito:groups'][0] === 'Manager' ||
    (headers.user['cognito:groups'][0] === 'Admin' && !createData.manager)
  ) {
    createData.manager = headers.user.email;
  }
  const ok: any = await createTeam(createData, headers.user.email).catch(
    (e) => {
      appLogger.error({ err: e }, 'createTeam');
      return { error: e.message ? e.message : 'Team already exists' };
    }
  );
  appLogger.info({ createTeam: ok });

  if (ok) {
    const err = new Error(ok.error);
    appLogger.error(err, 'Bad Request');
    return responseBuilder.badRequest(err, response);
  }
  return responseBuilder.ok({ message: ok }, response);
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'post',
  route: '/api/v2/admin/createteam',
};

// async function x(createData: any){
//     const ok = await createTeam(createData, 'rachitjobs7@gmail.com').catch(e => {
//         // console.log({e});
//         return ({error : 'Team already exists'});
//     });
//     return ok;
// }
// var t = {
//     teamId: 'TechnoBrad',
//     teamName: 'TechnoBrad'
// }
// x(t).then(res=>{
//   console.log(typeof(res),Object.keys(res), {res})
// //   if(res.Error){

// //   }
// }).catch(e=>{
//     console.log(e);
// })
