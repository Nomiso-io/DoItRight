import { CollectorConfig, MetricsTool } from '@models/index';
import * as HttpRequest from '@utils/httpRequest';
import { appLogger } from '@utils/index';

export async function connectAndFetchFromSonarQube(
  tool: MetricsTool,
  toolConfig: CollectorConfig
): Promise<MetricsTool> {
  return new Promise((resolve: (item: any) => void, reject: (err: any) => any): any => {
      const auth = tool.appToken.value;

      const projsURL = `${tool.url.value}/api/projects/search`;
      HttpRequest.httpRequest('GET', projsURL, undefined, auth)
      .then((resProj: any) => {
//        appLogger.info({connectAndFetchFromSonarQube_projects: resProj});
        if (resProj.statusCode < 200 || resProj.statusCode >= 300) {
          const err = new Error('Error connecting to SonarQube');
          appLogger.error(err, 'Code: ' + resProj.statusCode);
          reject(err);
        } else {
          const projData = JSON.parse(resProj.body);
          appLogger.info({connectAndFetchFromSonarQube_projects: projData});
//          tool.projectName.options = projData.map((elm: any) => elm.name);
          tool.projectName.options = {};
          projData.forEach((elm: any) => {
            tool.projectName.options[elm.name] = elm.name;
          });
          if(toolConfig.attributes.projectName.defaultValue) {
//            if(! tool.projectName.options.includes(toolConfig.attributes.projectName.defaultValue)) {
//              tool.projectName.options.push(toolConfig.attributes.projectName.defaultValue);
//            }
            if(! Object.keys(tool.projectName.options).includes(toolConfig.attributes.projectName.defaultValue)) {
              tool.projectName.options[toolConfig.attributes.projectName.defaultValue] = toolConfig.attributes.projectName.defaultValue;
            }
            tool.projectName.value = [toolConfig.attributes.projectName.defaultValue];
          }

          const metricsURL = `${tool.url.value}/api/metrics/search`;
          HttpRequest.httpRequest('GET', metricsURL, undefined, auth)
          .then((resMetrics: any) => {
//            appLogger.info({connectAndFetchFromSonarQube_metrics: resMetrics});
            if (resMetrics.statusCode < 200 || resMetrics.statusCode >= 300) {
              const err = new Error('Error connecting to SonarQube');
              appLogger.error(err, 'Code: ' + resMetrics.statusCode);
              reject(err);
            } else {
              const metricsData = JSON.parse(resMetrics.body);
              appLogger.info({connectAndFetchFromSonarQube_metrics: metricsData});
//              tool.metrics.options = metricsData.map((elm: any) => elm.name);
              tool.metrics.options = {};
              metricsData.forEach((elm: any) => {
                tool.metrics.options[elm.name] = elm.name;
              });
              if(toolConfig.attributes.metrics.defaultValue) {
//                if(! tool.metrics.options.includes(toolConfig.attributes.metrics.defaultValue)) {
//                  tool.metrics.options.push(toolConfig.attributes.metrics.defaultValue);
//                }
                if(! Object.keys(tool.metrics.options).includes(toolConfig.attributes.metrics.defaultValue)) {
                  tool.metrics.options[toolConfig.attributes.metrics.defaultValue] = toolConfig.attributes.metrics.defaultValue;
                }
                tool.metrics.value = [toolConfig.attributes.metrics.defaultValue];
              }

              appLogger.info({tool});
              resolve(tool);
              }
          })
          .catch((err) => {
            appLogger.error({ SonarQubeGetError: err });
            reject(err);
          });
        }
      })
      .catch((err) => {
        appLogger.error({ SonarQubeGetError: err });
        reject(err);
      });
    }
  );
}
