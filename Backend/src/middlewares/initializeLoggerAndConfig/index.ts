import { SystemConfigDetails } from '@models/index';
import { config } from '@root/config';
import { appLogger, getSystemConfig, reinitLogger } from '@utils/index';
import { NextFunction, Request, Response } from 'express';

export const initializeLoggerAndConfig = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const orgId = config.defaults.orgId;
  appLogger.info('Initializing logger and config for orgId=%s', orgId);

  await getSystemConfig(orgId)
    .then((res) => {
      const configDetails: SystemConfigDetails = <SystemConfigDetails>(
        res.config
      );
      if (configDetails.logLevel) {
        reinitLogger(configDetails.logLevel);
      }
      appLogger.info({ getSystemConfig: res });
      config.cognito.appClientId = configDetails.appClientId;
      config.cognito.appClientURL = configDetails.appClientURL;
      config.cognito.userPoolId = configDetails.userpoolId;
      next();
    })
    .catch((err) => {
      appLogger.error(
        err,
        'Failed to get System Config from database for orgId=%s',
        orgId
      );
      next(err);
    });
};
