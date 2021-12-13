import { CollectorConfig, MetricsTool } from '@models/index';
import * as HttpRequest from '@utils/httpRequest';
import { appLogger } from '@utils/index';

export async function connectAndFetchFromGitLab(
  tool: MetricsTool,
  toolConfig: CollectorConfig
): Promise<MetricsTool> {
  return new Promise((resolve: (item: any) => void, reject: (err: any) => any): any => {
    fetchAllFromPage(tool, '1')
    .then((projData: any) => {
//        tool.projectName.options = projData.map((elm: any) => elm.key);
      tool.projectName.options = {};
      projData.forEach((elm: any) => {
        tool.projectName.options[elm.id] = elm.name_with_namespace;
      });
      if(toolConfig.attributes.projectName.defaultValue) {
        if(! Object.keys(tool.projectName.options).includes(toolConfig.attributes.projectName.defaultValue)) {
          tool.projectName.options[toolConfig.attributes.projectName.defaultValue] = toolConfig.attributes.projectName.defaultValue;
        }
        tool.projectName.value = [toolConfig.attributes.projectName.defaultValue];
      }

      appLogger.info({tool});
      resolve(tool);
    })
    .catch((err) => {
      appLogger.error({ GitLabGetError: err });
      reject(err);
    });
  });
}

export async function fetchAllFromPage(
  tool: MetricsTool,
  pageNum: string
): Promise<MetricsTool> {
  return new Promise((resolve: (item: any) => void, reject: (err: any) => any): any => {
    const projsURL = `${tool.url.value}/api/v4/projects?simple=true&page=${pageNum}&per_page=50`;
    appLogger.info({connectAndFetchFromGitLab: projsURL});
    HttpRequest.httpRequest('GET', projsURL, undefined, undefined, { 'PRIVATE-TOKEN': tool.appToken.value })
    .then((resProj: any) => {
//      appLogger.info({connectAndFetchFromGitLab: {projsURL, resProj}});
      if (resProj.statusCode < 200 || resProj.statusCode >= 300) {
        const err = new Error('Error connecting to GitLab');
        appLogger.error(err, 'Code: ' + resProj.statusCode);
        reject(err);
      } else {
        const projData = JSON.parse(resProj.body);
        appLogger.info({projData});
        if(resProj.headers['x-next-page'] !== '') {
          fetchAllFromPage(tool, resProj.headers['x-next-page'])
          .then((data: any) => {
            resolve(projData.concat(data));
          })
          .catch((err) => {
            appLogger.error({ GitLabGetError: err });
            reject(err);
          });
        } else {
          resolve(projData);
        }
      }
    })
    .catch((err) => {
      appLogger.error({ GitLabGetError: err });
      reject(err);
    });
  });
}
