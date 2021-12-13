import { API, Handler } from '@apis/index';
import {
  ReqDataItemLists,
  ReqListDataItem,
  ReqLTCTDataItem,
  ReqStatusDataItem,
} from '@models/index';
import {
  appLogger,
  getReqDataItemLists,
  getReqListData,
  getReqLTCTData,
  getReqStatusData,
  responseBuilder,
} from '@utils/index';
import { Response } from 'express';

interface ReqsDataRequest {
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
    fromDate?: string;
    priority?: string;
    service?: string;
    teamId?: string;
    toDate?: string;
    type?: string;
  };
}

async function handler(
  request: ReqsDataRequest,
  response: Response
): Promise<any> {
  appLogger.info('API handler: RequirementsDataRequest GET');

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
    const fields = ['itemType', 'itemPriority'];

    if (query.teamId) {
      const key: string = 'teamIds';
      data[key] = query.teamId.split(',');
    }
    if (query.service) {
      const key: string = 'services';
      data[key] = query.service.split(',');
    }
    if (query.priority) {
      const key: string = 'priorities';
      data[key] = query.priority.split(',');
    }
    if (query.type) {
      const key: string = 'types';
      data[key] = query.type.split(',');
    }
    if (query.fromDate) {
      const key: string = 'fromDate';
      data[key] = new Date(parseInt(query.fromDate, 10));
    }
    if (query.toDate) {
      const key: string = 'toDate';
      data[key] = new Date(parseInt(query.toDate, 10));
    }

    if (params.type === 'status') {
      const result: ReqStatusDataItem[] = await getReqStatusData(data);
      appLogger.info({ result });
      return responseBuilder.ok(result, response);
    }
    if (params.type === 'ltct') {
      const result: ReqLTCTDataItem[] = await getReqLTCTData(data);
      appLogger.info({ result });
      return responseBuilder.ok(result, response);
    }
    if (params.type === 'list') {
      const result: ReqListDataItem[] = await getReqListData(data);
      appLogger.info({ result });
      return responseBuilder.ok(result, response);
    }
    if (params.type === 'itip') {
      const result: ReqDataItemLists = await getReqDataItemLists(fields);
      appLogger.info({ result });
      return responseBuilder.ok(result, response);
    }
    const err = new Error('Invalid Request');
    appLogger.error(err);
    return responseBuilder.badRequest(err, response);
  } catch (err) {
    appLogger.info(err);
    return responseBuilder.internalServerError(err, response);
  }
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route: '/api/metrics/reqs/:type',
};
