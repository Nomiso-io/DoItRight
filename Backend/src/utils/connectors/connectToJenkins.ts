import { CollectorConfig, MetricsTool } from '@models/index';
import * as HttpRequest from '@utils/httpRequest';
import { appLogger } from '@utils/index';

export async function connectAndFetchFromJenkins(
  tool: MetricsTool,
  toolConfig: CollectorConfig
): Promise<MetricsTool> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: any) => any): any => {
      const getJobsURL = `${tool.url.value}/api/json?tree=jobs[name]`;
      const auth = `${tool.userName.value}:${tool.password.value}`;
      HttpRequest.httpRequest('GET', getJobsURL, undefined, auth)
        .then((res: any) => {
//          appLogger.info({connectAndFetchFromJenkins: res});
          if (res.statusCode < 200 || res.statusCode >= 300) {
            const err = new Error('Error connecting to Jenkins');
            appLogger.error(err, 'Code: ' + res.statusCode);
            reject(err);
          } else {
            const data = JSON.parse(res.body);
            appLogger.info({connectAndFetchFromJenkins: data});
//            tool.job.options = data.jobs.map((elm: any) => elm.name);
            tool.job.options = {};
            data.jobs.forEach((elm: any) => {
              tool.job.options[elm.name] = elm.name;
            });
            appLogger.info({tool});
            if(toolConfig.attributes.job.defaultValue) {
//              if(! tool.job.options.includes(toolConfig.attributes.job.defaultValue)) {
//                tool.job.options.push(toolConfig.attributes.job.defaultValue);
//              }
              if(! Object.keys(tool.job.options).includes(toolConfig.attributes.job.defaultValue)) {
                tool.job.options[toolConfig.attributes.job.defaultValue] = toolConfig.attributes.job.defaultValue;
              }
              tool.job.value = [toolConfig.attributes.job.defaultValue];
            }
            appLogger.info({tool});
            resolve(tool);
          }
        })
        .catch((err) => {
          appLogger.error({ JenkinsGetError: err });
          reject(err);
        });
    }
  );
}
