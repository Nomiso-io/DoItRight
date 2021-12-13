import { CollectorConfig, MetricsTool } from '@models/index';
import * as HttpRequest from '@utils/httpRequest';
import { appLogger } from '@utils/index';

export async function connectAndFetchFromBitBucket(
  tool: MetricsTool,
  toolConfig: CollectorConfig
): Promise<MetricsTool> {
  return new Promise((resolve: (item: any) => void, reject: (err: any) => any): any => {
    fetchAllFromStart(tool, 0)
    .then((projData: any) => {
//     tool.projectName.options = projData.values.map((elm: any) => elm.key);
      tool.projectName.options = {};
      projData.forEach((elm: any) => {
        tool.projectName.options[elm.key] = elm.name;
      });
      if(toolConfig.attributes.projectName.defaultValue) {
//        if(! tool.projectName.options.includes(toolConfig.attributes.projectName.defaultValue)) {
//          tool.projectName.options.push(toolConfig.attributes.projectName.defaultValue);
//        }
        if(! Object.keys(tool.projectName.options).includes(toolConfig.attributes.projectName.defaultValue)) {
          tool.projectName.options[toolConfig.attributes.projectName.defaultValue] = toolConfig.attributes.projectName.defaultValue;
        }
        tool.projectName.value = [toolConfig.attributes.projectName.defaultValue];
      }

      appLogger.info({tool});
      resolve(tool);
    })
    .catch((err) => {
      appLogger.error({ BitBucketGetError: err });
      reject(err);
    });
  });
}

export async function fetchAllFromStart(
  tool: MetricsTool,
  startNum: number
): Promise<MetricsTool> {
  return new Promise((resolve: (item: any) => void, reject: (err: any) => any): any => {
    const auth = `${tool.email.value}:${tool.appToken.value}`;
    const projsURL = `${tool.url.value}/rest/api/latest/projects?start=${startNum}&limit=1000`;

    HttpRequest.httpRequest('GET', projsURL, undefined, auth, {Accept: 'application/json'})
    .then((resProj: any) => {
      if (resProj.statusCode < 200 || resProj.statusCode >= 300) {
        const err = new Error('Error connecting to BitBucket');
        appLogger.error(err, 'Code: ' + resProj.statusCode);
        reject(err);
      } else {
        const projData = JSON.parse(resProj.body);
        appLogger.info({projData});
        if(! projData.isLastPage) {
          fetchAllFromStart(tool, projData.nextPageStart)
          .then((data: any) => {
            resolve(projData.values.concat(data));
          })
          .catch((err) => {
            appLogger.error({ BitBucketGetError: err });
            reject(err);
          });
         } else {
          resolve(projData.values);
        }
      }
    })
    .catch((err) => {
      appLogger.error({ BitBucketGetError: err });
      reject(err);
    });
  });
}
