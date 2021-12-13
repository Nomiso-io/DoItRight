import { CollectorConfig, MetricsTool } from '@models/index';
import * as HttpRequest from '@utils/httpRequest';
import { appLogger } from '@utils/index';

export async function connectAndFetchFromJIRAIncidents(
  tool: MetricsTool,
  toolConfig: CollectorConfig
): Promise<MetricsTool> {
  return new Promise((resolve: (item: any) => void, reject: (err: any) => any): any => {
    const auth = `${tool.email.value}:${tool.appToken.value}`;

    const fieldsURL = `${tool.url.value}/rest/api/latest/field`;
    HttpRequest.httpRequest('GET', fieldsURL, undefined, auth, {Accept: 'application/json'})
    .then((resFields: any) => {
//              appLogger.info({connectAndFetchFromJIRA: {fieldsURL, resStatus}});
      if (resFields.statusCode < 200 || resFields.statusCode >= 300) {
        const err = new Error('Error connecting to JIRA');
        appLogger.error(err, 'Code: ' + resFields.statusCode);
        reject(err);
      } else {
        const fieldsData = JSON.parse(resFields.body);
        appLogger.info({fieldsData});
        const options = {};
        fieldsData.forEach((elm: any) => {
          appLogger.info({elm});
          options[elm.id] = elm.name;
        });
        appLogger.info({options});
        appLogger.info('before setting service mapping key');

        tool.serviceMappingKey.options = options;
        if(toolConfig.attributes.serviceMappingKey.defaultValue) {
          if((toolConfig.attributes.serviceMappingKey.defaultValue !== '') &&
            (! Object.keys(tool.serviceMappingKey.options).includes(toolConfig.attributes.serviceMappingKey.defaultValue))) {
            tool.serviceMappingKey.options[toolConfig.attributes.serviceMappingKey.defaultValue] = toolConfig.attributes.serviceMappingKey.defaultValue;
          }
          tool.serviceMappingKey.value = toolConfig.attributes.serviceMappingKey.defaultValue;
        }

        tool.incidentStartKey.options = options;
        if(toolConfig.attributes.incidentStartKey.defaultValue) {
          if((toolConfig.attributes.incidentStartKey.defaultValue!== '') &&
            (! Object.keys(tool.incidentStartKey.options).includes(toolConfig.attributes.incidentStartKey.defaultValue))) {
            tool.incidentStartKey.options[toolConfig.attributes.incidentStartKey.defaultValue] = toolConfig.attributes.incidentStartKey.defaultValue;
          }
          tool.incidentStartKey.value = toolConfig.attributes.incidentStartKey.defaultValue;
        }

        tool.incidentEndKey.options = options;
        if(toolConfig.attributes.incidentEndKey.defaultValue) {
          if((toolConfig.attributes.incidentEndKey.defaultValue !== '') &&
            (! Object.keys(tool.incidentEndKey.options).includes(toolConfig.attributes.incidentEndKey.defaultValue))) {
            tool.incidentEndKey.options[toolConfig.attributes.incidentEndKey.defaultValue] = toolConfig.attributes.incidentEndKey.defaultValue;
          }
          tool.incidentEndKey.value = toolConfig.attributes.incidentEndKey.defaultValue;
        }

        const projsURL = `${tool.url.value}/rest/api/latest/project`;
        HttpRequest.httpRequest('GET', projsURL, undefined, auth, {Accept: 'application/json'})
        .then((resProj: any) => {
    //      appLogger.info({connectAndFetchFromJIRA: {projsURL, resProj}});
          if (resProj.statusCode < 200 || resProj.statusCode >= 300) {
            const err = new Error('Error connecting to JIRA');
            appLogger.error(err, 'Code: ' + resProj.statusCode);
            reject(err);
          } else {
            const projData = JSON.parse(resProj.body);
            appLogger.info({projData});
            tool.projectName.options = {};
            projData.forEach((elm: any) => {
              tool.projectName.options[elm.name] = elm.name; //TODO: Check is we can store key here
            });
            if(toolConfig.attributes.projectName.defaultValue) {
              if(! Object.keys(tool.projectName.options).includes(toolConfig.attributes.projectName.defaultValue)) {
                tool.projectName.options[toolConfig.attributes.projectName.defaultValue] = toolConfig.attributes.projectName.defaultValue;
              }
            tool.projectName.value = [toolConfig.attributes.projectName.defaultValue];
            }

            appLogger.info({tool});
            resolve(tool);
          }
        })
        .catch((err) => {
          appLogger.error({ JIRAGetError: err });
          reject(err);
        });
      }
    })
    .catch((err) => {
      appLogger.error({ JIRAGetError: err });
      reject(err);
    });
  });
}
