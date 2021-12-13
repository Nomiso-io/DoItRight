import { CollectorConfig, MetricsTool } from '@models/index';
import { appLogger } from '@utils/index';
import AWS from 'aws-sdk';

export async function connectAndFetchFromCodeCommit(
  tool: MetricsTool,
  toolConfig: CollectorConfig
): Promise<MetricsTool> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: any) => any): any => {
      //    tool.repoName.options = ['opsai', 'opmetrics'];
      const options = {
        accessKeyId: tool.userName.value,
        apiVersion: '2015-04-13',
        endpoint: tool.url.value,
        region: tool.region.value,
        secretAccessKey: tool.password.value,
      };
      const codecommit: AWS.CodeCommit = new AWS.CodeCommit(options);

      const params = {
        order: 'ascending',
        sortBy: 'repositoryName',
      };
      codecommit.listRepositories(params, function (err: any, data: any) {
        if (err) {
          appLogger.error({ AWSCodeCommitGetError: err });
          reject(err);
        } else {
          appLogger.info({connectAndFetchFromCodeCommit: data});
//          tool.repoName.options = data.repositories;
          tool.repoName.options = {};
          data.repositories.forEach((elm: any) => {
            tool.repoName.options[elm] = elm;
          });
          if(toolConfig.attributes.repoName.defaultValue) {
//            if(! tool.repoName.options.includes(toolConfig.attributes.repoName.defaultValue)) {
//              tool.repoName.options.push(toolConfig.attributes.repoName.defaultValue);
//            }
            if(! Object.keys(tool.repoName.options).includes(toolConfig.attributes.repoName.defaultValue)) {
              tool.repoName.options[toolConfig.attributes.repoName.defaultValue] = toolConfig.attributes.repoName.defaultValue;
            }
            tool.repoName.value = [toolConfig.attributes.repoName.defaultValue];
          }
          appLogger.info({tool});
          resolve(tool);
        }
      });
    }
  );
}
