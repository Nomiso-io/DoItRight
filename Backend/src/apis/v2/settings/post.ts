import { API, Handler } from '@apis/index';
import {
  CollectorAttributesDetails,
  CollectorConfig,
  CollectorConfigDetails,
  FieldConfigAttributes,
  GeneralConfigDetails,
  ServiceConfigDetails,
  SystemConfigDetails,
  TeamConfigDetails,
  UserConfigDetails,
} from '@models/index';
import { config } from '@root/config';
import { generate } from '@utils/common';
import {
  appLogger,
  responseBuilder,
  setCollectorConfig,
  setGeneralConfig,
  setServiceConfig,
  setTeamConfig,
  setUserConfig,
} from '@utils/index';
import { Response } from 'express';

const NEW_ATTR_KEY_PREFIX = 'newAttr';

interface PostSettings {
  body:
    | SystemConfigDetails
    | UserConfigDetails
    | TeamConfigDetails
    | ServiceConfigDetails
    | GeneralConfigDetails
    | CollectorConfigDetails;
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

async function handler(request: PostSettings, response: Response) {
  const { params, headers, body } = request;

  if (!params.type) {
    const err = new Error('Settings type missing');
    appLogger.error(err);
    responseBuilder.notFound(err, response);
  }

  switch (params.type) {
    case 'UserConfig': {
      const configDetails: UserConfigDetails = convertNewKeys(body);
      await setUserConfig(
        headers.user.orgId ? headers.user.orgId : config.defaults.orgId,
        configDetails
      );
      break;
    }
    case 'TeamConfig': {
      const configDetails: TeamConfigDetails = convertNewKeys(body);
      await setTeamConfig(
        headers.user.orgId ? headers.user.orgId : config.defaults.orgId,
        configDetails
      );
      break;
    }
    case 'ServiceConfig': {
      const configDetails: ServiceConfigDetails = convertNewKeys(body);
      await setServiceConfig(
        headers.user.orgId ? headers.user.orgId : config.defaults.orgId,
        configDetails
      );
      break;
    }
    case 'GeneralConfig': {
      const configDetails: GeneralConfigDetails = <GeneralConfigDetails>body;
      await setGeneralConfig(
        headers.user.orgId ? headers.user.orgId : config.defaults.orgId,
        configDetails
      );
      break;
    }
    case 'CollectorConfig': {
      const configDetails: CollectorConfigDetails = <CollectorConfigDetails>(
        body
      );
      Object.keys(configDetails).forEach((key: string) => {
        const collectors: CollectorConfig[] = configDetails[key];
        for (const col of collectors) {
          col.attributes = convertNewKeys(col.attributes);
        }
      });
      await setCollectorConfig(
        headers.user.orgId ? headers.user.orgId : config.defaults.orgId,
        configDetails
      );
      break;
    }
    default: {
      const err = new Error('Invalid settings type');
      appLogger.error(err);
      responseBuilder.notFound(err, response);
    }
  }
  return responseBuilder.ok({ message: 'ok' }, response);
}

//creates a key for the custom attributes added.
//The pattern for the created key is <first 4 letters of the field name after removing all white spaces>_<generated unique id>
function convertNewKeys(fieldMap: any) {
  const configDetails:
    | UserConfigDetails
    | TeamConfigDetails
    | ServiceConfigDetails
    | CollectorAttributesDetails = {};
  Object.keys(fieldMap).forEach((key: string) => {
    const attr: FieldConfigAttributes = fieldMap[key];
    let newKey = key;
    if (key.startsWith(NEW_ATTR_KEY_PREFIX)) {
      const partialName = attr.displayName.replace(/\s/g, '').substring(0, 4);
      const rand = generate(10);
      newKey = `${partialName}_${rand}`;
    }
    configDetails[newKey] = attr;
  });
  return configDetails;
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'post',
  route: '/api/v2/settings/:type?',
};
