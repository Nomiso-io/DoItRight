import { API, Handler } from '@apis/index';
import {
  RepoDataItemLists,
  RepoPullRaiserDataItem,
  RepoPullReqLifeDataItem,
  RepoPullReqsDataItem,
} from '@models/index';
import {
  appLogger,
  getRepoDataItemLists,
  getRepoPullRaiserData,
  getRepoPullReqLifeData,
  getRepoPullReqsData,
  responseBuilder,
} from '@utils/index';
import { Response } from 'express';

interface ReposDataRequest {
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
  params: {
    type: string;
  };
  query: {
    committer?: string;
    fromDate?: string;
    service?: string;
    teamId?: string;
    toDate?: string;
  };
}

async function handler(
  request: ReposDataRequest,
  response: Response
): Promise<any> {
  appLogger.info('API handler: RepositoryDataRequest GET');

  const { headers, params, query } = request;
  const cognitoUserId = headers.user['cognito:username'];

  if (!cognitoUserId) {
    const err = new Error('Unauthorized');
    appLogger.error(err);
    return responseBuilder.unauthorized(err, response);
  }

  try {
    const data = {
      fromDate: new Date(),
      toDate: new Date(), //default is today
    };
    data.fromDate.setDate(data.fromDate.getDate() - 1); //default is yesterday
    const fields = ['raisedBy'];

    if (query.teamId) {
      const key: string = 'teamIds';
      data[key] = query.teamId.split(',');
    }
    if (query.service) {
      const key: string = 'services';
      data[key] = query.service.split(',');
    }
    if (query.committer) {
      const key: string = 'committers';
      data[key] = query.committer.split(',');
    }
    if (query.fromDate) {
      const key: string = 'fromDate';
      data[key] = new Date(parseInt(query.fromDate, 10));
    }
    if (query.toDate) {
      const key: string = 'toDate';
      data[key] = new Date(parseInt(query.toDate, 10));
    }

    if (params.type === 'committersList') {
      const result: RepoDataItemLists = await getRepoDataItemLists(fields);
      appLogger.debug({ result });
      return responseBuilder.ok(result, response);
    }
    if (params.type === 'pullRequestsGraph') {
      const result: RepoPullReqsDataItem[] = await getRepoPullReqsData(data);
      appLogger.debug({ result });
      return responseBuilder.ok(result, response);
    }
    if (params.type === 'delayGraph') {
      const result: RepoPullReqLifeDataItem[] = await getRepoPullReqLifeData(
        data
      );
      appLogger.debug({ result });
      return responseBuilder.ok(result, response);
    }
    if (params.type === 'repositoryList') {
      const result: RepoPullRaiserDataItem[] = await getRepoPullRaiserData(
        data
      );
      appLogger.debug({ result });
      return responseBuilder.ok(result, response);
    }
    const err = new Error('Invalid Request');
    appLogger.error(err);
    return responseBuilder.badRequest(err, response);
  } catch (err) {
    appLogger.error(err);
    return responseBuilder.internalServerError(err, response);
  }
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route: '/api/metrics/repos/:type',
};
