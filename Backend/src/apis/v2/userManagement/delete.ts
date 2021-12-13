import { API, Handler } from '@apis/index';
//import { addUserToTeam } from '@root/utils/dynamoDb/addUserToTeam';
// import { addUserToCognitoGroup } from '@root/utils/dynamoDb/cognitoUserFunctions';
import {
  appLogger,
  deactivateDynamoUser,
  disableCognitoUser,
  getUserDocument,
  responseBuilder,
} from '@utils/index';
import { Response } from 'express';

interface AddTeams {
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
  params: {
    id: string;
  };
}

async function handler(request: AddTeams, response: Response) {
  appLogger.info({ AddTeams: request }, 'Inside Handler');

  const { headers, params } = request;
  if (
    headers.user['cognito:groups'][0] !== 'Manager' &&
    headers.user['cognito:groups'][0] !== 'Admin'
  ) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Unauthorized');
    return responseBuilder.unauthorized(err, response);
  }
  // const managerDetails: any = await getUserDocument({cognitoUserId: headers.user['cognito:username']});
  const userDetails: any = await getUserDocument({ cognitoUserId: params.id });
  appLogger.info({ getUserDocument: userDetails });
  if (
    !(headers.user['cognito:groups'][0] === 'Admin') &&
    !userDetails.order.includes(headers.user.email)
  ) {
    const err = new Error('Forbidden Access, Unauthorized user');
    appLogger.error(err, 'Forbidden');
    return responseBuilder.forbidden(err, response);
  }
  await disableCognitoUser(params.id);
  await deactivateDynamoUser(params.id);
  // await addUserToCognitoGroup(userDetails.Us  er.Username, body.roles);
  // await addDynamoUser(userDetails.User.Username, managerDetails, body);
  return responseBuilder.ok({ message: 'ok' }, response);
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'delete',
  route: '/api/v2/admin/users/:id',
};
