import { API, Handler } from '@apis/index';
import { config } from '@root/config';
import {
  appLogger,
  getAllConfigTypes,
  getCollectorConfig,
  getGeneralConfig,
  getServiceConfig,
  getTeamConfig,
  getUserConfig,
  responseBuilder,
} from '@utils/index';
import { Response } from 'express';

interface GetSettings {
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
      orgId?: string;
    };
  };
  params: {
    type: string;
  };
}

async function handler(request: GetSettings, response: Response) {
  const { params, headers } = request;

  if (!params.type) {
    const result = await getAllConfigTypes(
      headers.user.orgId ? headers.user.orgId : config.defaults.orgId
    );
    return responseBuilder.ok(result, response);
  }

  let configMap: any = {};
  switch (params.type) {
    case 'cognito': {
      configMap = {
        appClientId: config.cognito.appClientId,
        appClientURL: config.cognito.appClientURL,
        userpoolId: config.cognito.userPoolId,
      };
      break;
    }
    case 'UserConfig': {
      configMap = await getUserConfig(
        headers.user.orgId ? headers.user.orgId : config.defaults.orgId
      );
      break;
    }
    case 'TeamConfig': {
      configMap = await getTeamConfig(
        headers.user.orgId ? headers.user.orgId : config.defaults.orgId
      );
      break;
    }
    case 'ServiceConfig': {
      configMap = await getServiceConfig(
        headers.user.orgId ? headers.user.orgId : config.defaults.orgId
      );
      break;
    }
    case 'GeneralConfig': {
      configMap = await getGeneralConfig(
        headers.user.orgId ? headers.user.orgId : config.defaults.orgId
      );
      break;
    }
    case 'CollectorConfig': {
      configMap = await getCollectorConfig(
        headers.user.orgId ? headers.user.orgId : config.defaults.orgId
      );
      break;
    }
    default: {
      const err = new Error('Requested Settings Not Found');
      appLogger.error(err);
      responseBuilder.notFound(err, response);
    }
  }
  appLogger.info({
    getSettingsResult: configMap,
    getSettingsType: params.type,
  });
  return responseBuilder.ok(configMap, response);
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route: '/api/v2/settings/:type?',
};
