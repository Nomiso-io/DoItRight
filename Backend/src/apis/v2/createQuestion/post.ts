/*tslint:disable*/
import { API, Handler } from '@apis/index';
import { Question } from '@models/index';
import { createQuestion, appLogger, responseBuilder } from '@utils/index';
import { Response } from 'express';
//import uuidv1 from 'uuid/v1';

interface CreateQuestion {
  body: Question;
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
}

async function handler(request: CreateQuestion, response: Response) {
  appLogger.info({ CreateQuestion: request }, 'Inside Handler');

  const { headers, body } = request;
  if (
    headers.user['cognito:groups'][0] !== 'Manager' &&
    headers.user['cognito:groups'][0] !== 'Admin'
  ) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Forbidden');
    return responseBuilder.forbidden(err, response);
  }

  const createData: Question = <Question>body;
  // createData.id = `ques_${uuidv1()}`;
  // createData.questionnaireAttached = '0000';

  // appLogger.info({ QuestionsId: createData.id });
  const ok: any = await createQuestion(createData, headers.user.email).catch(
    (e) => {
      appLogger.error({ err: e }, 'addQuestion');
      return { error: e.message ? e.message : 'Question already exists' };
    }
  );
  appLogger.info({ createQuestion: ok });

  if (ok && ok.error) {
    const err = new Error(ok.error);
    appLogger.error(err, 'Bad Request');
    return responseBuilder.badRequest(err, response);
  }
  return responseBuilder.ok({ message: ok }, response);
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'post',
  route: '/api/v2/admin/createquestion',
};
/*tslint:enable*/
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
