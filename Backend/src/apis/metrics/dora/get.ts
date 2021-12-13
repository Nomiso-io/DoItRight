import { API, Handler } from '@apis/index';
import {
  ChangeFailureRateDataItem,
  DeploymentDataItem,
  DORA_LEVEL_ELITE,
  DORA_LEVEL_HIGH,
  DORA_LEVEL_LOW,
  DORA_LEVEL_MEDIUM,
  DORA_LEVEL_NA,
  DORADataItem,
  LeadTimeDataItem,
  MeanTimeToRestoreDataItem,
} from '@models/index';
import {
  appLogger,
  getChangeFailureRateGraphData,
  getDeploymentGraphData,
  getLeadTimeGraphData,
  getMeanTimeToRestoreGraphData,
  responseBuilder,
} from '@utils/index';
import { Response } from 'express';
import { calculateTrend } from './trendData';

interface DORADataRequest {
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
    service?: string;
    teamId?: string;
    toDate?: string;
  };
}

async function handler(
  request: DORADataRequest,
  response: Response
): Promise<any> {
  appLogger.info('API handler: DORADataRequest GET');

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

    if (query.teamId) {
      const key: string = 'teamIds';
      data[key] = query.teamId.split(',');
    }
    if (query.service) {
      const key: string = 'services';
      data[key] = query.service.split(',');
    }
    if (query.fromDate) {
      const key: string = 'fromDate';
      data[key] = new Date(parseInt(query.fromDate, 10));
    }
    if (query.toDate) {
      const key: string = 'toDate';
      data[key] = new Date(parseInt(query.toDate, 10));
    }

    if (params.type === 'deployment') {
      const result: DeploymentDataItem[] = await getDeploymentGraphData(data);
      appLogger.info({ getDeploymentGraphData: result });
      return responseBuilder.ok(
        getDORADeploymentResp(result, data.fromDate, data.toDate),
        response
      );
    }
    if (params.type === 'leadTime') {
      const result: LeadTimeDataItem[] = await getLeadTimeGraphData(data);
      appLogger.info({ getLeadTimeGraphData: result });
      return responseBuilder.ok(getDORALeadTimeResp(result), response);
    }
    if (params.type === 'mttr') {
      const result: MeanTimeToRestoreDataItem[] = await getMeanTimeToRestoreGraphData(
        data
      );
      appLogger.info({ getMeanTimeToRestoreGraphData: result });
      return responseBuilder.ok(getDORAMeanTimeToRestoreResp(result), response);
    }
    if (params.type === 'changeFailureRate') {
      const result: ChangeFailureRateDataItem[] = await getChangeFailureRateGraphData(
        data
      );
      appLogger.info({ getChangeFailureRateGraphData: result });
      return responseBuilder.ok(getDORAChangeFailureRateResp(result), response);
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
  route: '/api/metrics/dora/:type',
};

function getDORADeploymentResp(data: DeploymentDataItem[], fromDate: Date, toDate: Date): DORADataItem {
  const resp: DORADataItem = {
    aggregateValue: 0,
    graphData: data,
    level: DORA_LEVEL_LOW,
//    trendData: calculateDeploymentTrend(data)
    trendData: calculateTrend(data, (elm) => elm.timestamp, (elm) => elm.countBuilds)
  };
  let totalDeployments = 0;
  data.forEach(
    (item: DeploymentDataItem) =>
      (totalDeployments += item.countBuilds)
  );
  const numDays: number = Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  resp.aggregateValue = numDays > 0 ? totalDeployments / numDays : 0;
  if (resp.aggregateValue === 0) {
    //zero per day
    resp.level = DORA_LEVEL_NA;
  } else if (resp.aggregateValue > 1) {
    //more than one per day
    resp.level = DORA_LEVEL_ELITE;
  } else if (resp.aggregateValue > 1 / 7) {
    //one per day to one per week
    resp.level = DORA_LEVEL_HIGH;
    resp.aggregateValue = resp.aggregateValue * 7;
  } else if (resp.aggregateValue > 1 / 30) {
    //one per week to one per month
    resp.level = DORA_LEVEL_MEDIUM;
    resp.aggregateValue = resp.aggregateValue * 30;
  } else {
    //less than one per month
    resp.level = DORA_LEVEL_LOW;
    resp.aggregateValue = resp.aggregateValue * 30;
  }

  return resp;
}

function getDORALeadTimeResp(data: LeadTimeDataItem[]): DORADataItem {
  const resp: DORADataItem = {
    aggregateValue: 0,
    graphData: data,
    level: DORA_LEVEL_LOW,
    trendData: calculateTrend(
      data,
      (elm) => elm.timestamp,
      (elm) => (elm.issueCount > 0) ? Math.round(elm.totalLeadTime/elm.issueCount) : 0
    )
  };
  let totalLeadTime = 0;
  let issueCount = 0;
  data.forEach((item: LeadTimeDataItem) => {
    totalLeadTime += item.totalLeadTime;
    issueCount += item.issueCount;
  });
  resp.aggregateValue =
    issueCount > 0 ? Math.round(totalLeadTime / issueCount) : 0; // this is in minutes as the lead time of each time interval is in minutes

  //  const numDays: number = (toDate.getTime() - fromDate.getTime())/(1000*60*60*24);
  //  const avgPerDay: number = resp.aggregateValue / numDays;
  if (resp.aggregateValue === 0) {
    //no value
    resp.level = DORA_LEVEL_NA;
  } else if (resp.aggregateValue < 60 * 24) {
    //less than one day in minutes
    resp.level = DORA_LEVEL_ELITE;
  } else if (resp.aggregateValue < 60 * 24 * 7) {
    //one day to one week in minutes
    resp.level = DORA_LEVEL_HIGH;
  } else if (resp.aggregateValue < 60 * 24 * 30) {
    //one week to one month in minutes
    resp.level = DORA_LEVEL_MEDIUM;
  } else {
    resp.level = DORA_LEVEL_LOW;
  }

  return resp;
}

function getDORAMeanTimeToRestoreResp(
  data: MeanTimeToRestoreDataItem[]
): DORADataItem {
  const resp: DORADataItem = {
    aggregateValue: 0,
    graphData: data,
    level: DORA_LEVEL_LOW,
    trendData: calculateTrend(
      data,
      (elm) => elm.timestamp,
      (elm) => (elm.issueCount > 0) ? Math.round(elm.totalRestoreTime/elm.issueCount) : 0
    )
  };
  let totalRestoreTime = 0;
  let issueCount = 0;
  data.forEach((item: MeanTimeToRestoreDataItem) => {
    totalRestoreTime += item.totalRestoreTime;
    issueCount += item.issueCount;
  });
  resp.aggregateValue =
    issueCount > 0 ? Math.round(totalRestoreTime / issueCount) : 0; // this is in minutes as the lead time of each time interval is in minutes

  //  const numDays: number = (toDate.getTime() - fromDate.getTime())/(1000*60*60*24);
  //  const avgPerDay: number = resp.aggregateValue / numDays;
  if (resp.aggregateValue === 0) {
    //no value
    resp.level = DORA_LEVEL_NA;
  } else if (resp.aggregateValue < 60) {
    //less than one hour in minutes
    resp.level = DORA_LEVEL_ELITE;
  } else if (resp.aggregateValue < 60 * 24) {
    //one hour to one day in minutes
    resp.level = DORA_LEVEL_HIGH;
  } else if (resp.aggregateValue < 60 * 24 * 7) {
    //one day to one week in minutes
    resp.level = DORA_LEVEL_MEDIUM;
  } else {
    resp.level = DORA_LEVEL_LOW;
  }

  return resp;
}

function getDORAChangeFailureRateResp(
  data: ChangeFailureRateDataItem[]
): DORADataItem {
  const resp: DORADataItem = {
    aggregateValue: 0,
    graphData: data,
    level: DORA_LEVEL_LOW,
    trendData: calculateTrend(
      data,
      (elm) => elm.timestamp,
      (elm) => (elm.totalBuilds > 0) ? Math.round((elm.countFailBuilds/elm.totalBuilds) * 100) : 0
    )
  };
  let totalFailBuilds = 0;
  let totalBuilds = 0;
  data.forEach((item: ChangeFailureRateDataItem) => {
    totalFailBuilds += item.countFailBuilds;
    totalBuilds += item.totalBuilds;
  });
  resp.aggregateValue =
    totalBuilds > 0 ? Math.round((totalFailBuilds / totalBuilds) * 100) : 0;

  //  const numDays: number = (toDate.getTime() - fromDate.getTime())/(1000*60*60*24);
  //  const avgPerDay: number = resp.aggregateValue / numDays;
  if (resp.aggregateValue === 0) {
    //equal to 0
    resp.level = DORA_LEVEL_NA;
  } else if (resp.aggregateValue <= 15) {
    //less than or equal to 15%
    resp.level = DORA_LEVEL_ELITE;
  } else if (resp.aggregateValue <= 30) {
    //more than 15% but less than or equal to 30%
    resp.level = DORA_LEVEL_HIGH;
  } else if (resp.aggregateValue <= 45) {
    //more than 30% but less than or equal to 45%
    resp.level = DORA_LEVEL_MEDIUM;
  } else {
    //more than 45%
    resp.level = DORA_LEVEL_LOW;
  }

  return resp;
}
