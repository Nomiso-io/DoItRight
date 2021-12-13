import { API, Handler } from '@apis/index';
import { MetricsTool, ServiceInfo } from '@models/index';
import { updateTeamMetrics } from '@root/utils/dynamoDb/createTeams';
import { appLogger, responseBuilder } from '@utils/index';
import { Response } from 'express';

interface SetMetricsTool {
  body: {
    metrics: MetricsTool[];
    orgId: string;
    services?: ServiceInfo[];
    teamId: string;
  };
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
}

async function handler(request: SetMetricsTool, response: Response) {
  appLogger.info({ SetMetricsTool: request }, 'Inside Handler');

  const { headers, body } = request;
  if (
    headers.user['cognito:groups'][0] !== 'Manager' &&
    headers.user['cognito:groups'][0] !== 'Admin'
  ) {
    const err = new Error('Forbidden Access, Unauthorized user');
    appLogger.error(err, 'Forbidden');
    return responseBuilder.forbidden(err, response);
  }

  const ok: any = await updateTeamMetrics(body.teamId, body.metrics, body.services || []).catch(
    (e) => {
      appLogger.error({ err: e }, 'updateTeamMetrics');
      return {
        error: e.message
          ? e.message
          : 'Error encountered while saving metrics tools',
      };
    }
  );
  appLogger.info({ updateTeamMetrics: ok });
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
  route: '/api/metrics/team',
};
