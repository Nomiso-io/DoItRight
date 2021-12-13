import { API, Handler } from '@apis/index';
import { CollectorConfig, ConfigItem, MetricsTool } from '@models/index';
import { config } from '@root/config';
import {
  appLogger,
  connectAndFetchFromBitBucket,
  connectAndFetchFromCodeCommit,
  connectAndFetchFromGitLab,
//  connectAndFetchFromGitLabCICD,
  connectAndFetchFromJenkins,
  connectAndFetchFromJIRA,
  connectAndFetchFromJIRAIncidents,
  connectAndFetchFromSonarQube,
  getCollectorConfig,
  responseBuilder } from '@utils/index';
import { Response } from 'express';

interface ToolsConnect {
  body: {
    tool: MetricsTool;
  };
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
}

async function handler(request: ToolsConnect, response: Response) {
    appLogger.info({ToolConnect: request}, 'Inside Handler');

  const { headers, body } = request;
  if (
    headers.user['cognito:groups'][0] !== 'Manager' &&
    headers.user['cognito:groups'][0] !== 'Admin'
  ) {
    const err = new Error('Forbidden Access, Unauthorized user');
    appLogger.error(err, 'Forbidden');
    return responseBuilder.forbidden(err, response);
  }

    try {
      const configMap: ConfigItem = await getCollectorConfig(config.defaults.orgId);
      appLogger.info({ getCollectorConfig: configMap });
      const toolConfig: CollectorConfig = configMap.config[body.tool.toolType].find((elm: CollectorConfig) => elm.name === body.tool.toolName);

      switch (body.tool.toolName) {
        case 'Jenkins': {
            const tool: MetricsTool = await connectAndFetchFromJenkins(body.tool, toolConfig);
            appLogger.info({connectToTool: tool});
            return responseBuilder.ok({ connect: true, tool }, response);
        }
        case 'AWSCodeCommit': {
            const tool: MetricsTool = await connectAndFetchFromCodeCommit(body.tool, toolConfig);
            appLogger.info({connectToTool: tool});
            return responseBuilder.ok({ connect: true, tool }, response);
        }
        case 'JIRA': {
            const tool: MetricsTool = await connectAndFetchFromJIRA(body.tool, toolConfig);
            appLogger.info({connectToTool: tool});
            return responseBuilder.ok({ connect: true, tool }, response);
        }
        case 'JIRAIncidents': {
          const tool: MetricsTool = await connectAndFetchFromJIRAIncidents(body.tool, toolConfig);
          appLogger.info({connectToTool: tool});
          return responseBuilder.ok({ connect: true, tool }, response);
      }
        case 'BitBucket': {
            const tool: MetricsTool = await connectAndFetchFromBitBucket(body.tool, toolConfig);
            appLogger.info({connectToTool: tool});
            return responseBuilder.ok({ connect: true, tool }, response);
        }
        case 'SonarQube': {
            const tool: MetricsTool = await connectAndFetchFromSonarQube(body.tool, toolConfig);
            appLogger.info({connectToTool: tool});
            return responseBuilder.ok({ connect: true, tool }, response);
        }
        case 'GitLab': {
          const tool: MetricsTool = await connectAndFetchFromGitLab(body.tool, toolConfig);
          appLogger.info({connectToTool: tool});
          return responseBuilder.ok({ connect: true, tool }, response);
        }
        case 'GitLabCICD': {
          const tool: MetricsTool = await connectAndFetchFromGitLab(body.tool, toolConfig);
//        const tool: MetricsTool = await connectAndFetchFromGitLabCICD(body.tool, toolConfig);
          appLogger.info({connectToTool: tool});
          return responseBuilder.ok({ connect: true, tool }, response);
        }
        default: {
            appLogger.error(`Invalid tool name ${body.tool.toolName}`);
            return responseBuilder.ok({ connect: false, tool: body.tool }, response);
        }
      }
    } catch(e) {
        appLogger.error({err: e}, 'testToolConnection');
        return responseBuilder.ok({ connect: false, tool: body.tool }, response);
    }
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'post',
  route: '/api/metrics/connect',
};
