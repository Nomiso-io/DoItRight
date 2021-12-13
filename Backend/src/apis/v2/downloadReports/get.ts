import { API, Handler } from '@apis/index';
import { appLogger, responseBuilder } from '@root/utils';
import { Response } from 'express';
// import { writeFileSync } from 'fs';
import { downloadAssessmentReports } from './downloadAssessmentReport';

type REPORT_TYPE = 'assessments-data-csv';

interface DownloadReportsRequest {
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
  params: {
    reportType: REPORT_TYPE;
  };
  query: {
    type: string;
    version: string;
  };
}

const handler = async (request: DownloadReportsRequest, response: Response) => {
  appLogger.info({ DownloadReportRequest: request }, 'Inside Handler');
  const { headers, query } = request;
  if (!headers.user) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Unauthorized');
    return responseBuilder.unauthorized(err, response);
  }
  const { user } = headers;
  const { type, version } = query;
  const { 'cognito:username': cognitoUserId } = user;

  try {
    if (user['cognito:groups'].includes('Admin')) {
      const assessmentReports = await downloadAssessmentReports(
        user.email,
        type,
        true,
        cognitoUserId,
        version
      );
      appLogger.info(
        'Sending Ok with Admin assessmentReports:',
        assessmentReports
      );
      /* const file = 'opsai.csv';
            const path = require('path');
            const fileLocation = path.join('apis/v2/downloadReports',file);
            return response.download(fileLocation, file); */
      return responseBuilder.ok(assessmentReports, response);
    }
    if (user['cognito:groups'].includes('Manager')) {
      const assessmentReports = await downloadAssessmentReports(
        user.email,
        type,
        false,
        cognitoUserId,
        version
      );
      appLogger.info(
        'Sending Ok with Manager assessmentReports:',
        assessmentReports
      );
      return responseBuilder.ok(assessmentReports, response);
    }
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Unauthorized');
    return responseBuilder.unauthorized(err, response);
  } catch (err) {
    appLogger.error(err, 'Internal Server Error');
    return responseBuilder.internalServerError(err, response);
  }
};

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route: '/api/v2/downloadReports/:reportType',
};
