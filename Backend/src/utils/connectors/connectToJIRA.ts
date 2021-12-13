import { CollectorConfig, MetricsTool } from '@models/index';
import * as HttpRequest from '@utils/httpRequest';
import { appLogger } from '@utils/index';

export async function connectAndFetchFromJIRA(
  tool: MetricsTool,
  toolConfig: CollectorConfig
): Promise<MetricsTool> {
  return new Promise((resolve: (item: any) => void, reject: (err: any) => any): any => {
    const auth = `${tool.email.value}:${tool.appToken.value}`;
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
//        tool.projectName.options = projData.map((elm: any) => elm.name);
        tool.projectName.options = {};
        projData.forEach((elm: any) => {
          tool.projectName.options[elm.name] = elm.name; //TODO: Check is we can store key here
        });
        if(toolConfig.attributes.projectName.defaultValue) {
//          if(! tool.projectName.options.includes(toolConfig.attributes.projectName.defaultValue)) {
//            tool.projectName.options.push(toolConfig.attributes.projectName.defaultValue);
//          }
          if(! Object.keys(tool.projectName.options).includes(toolConfig.attributes.projectName.defaultValue)) {
            tool.projectName.options[toolConfig.attributes.projectName.defaultValue] = toolConfig.attributes.projectName.defaultValue;
          }
        tool.projectName.value = [toolConfig.attributes.projectName.defaultValue];
        }

        const issueTypesURL = `${tool.url.value}/rest/api/latest/issuetype`;
        HttpRequest.httpRequest('GET', issueTypesURL, undefined, auth, {Accept: 'application/json'})
        .then((resItems: any) => {
//          appLogger.info({connectAndFetchFromJIRA: {issueTypesURL, resItems}});
          if (resItems.statusCode < 200 || resItems.statusCode >= 300) {
            const err = new Error('Error connecting to JIRA');
            appLogger.error(err, 'Code: ' + resItems.statusCode);
            reject(err);
          } else {
            const itemsData = JSON.parse(resItems.body);
            appLogger.info({itemsData});
//            tool.items.options = itemsData.map((elm: any) => elm.name);
            tool.items.options = {};
            itemsData.forEach((elm: any) => {
              tool.items.options[elm.name] = elm.name;
            });
            if(toolConfig.attributes.items.defaultValue) {
//              if(! tool.items.options.includes(toolConfig.attributes.items.defaultValue)) {
//                tool.items.options.push(toolConfig.attributes.items.defaultValue);
//              }
              if(! Object.keys(tool.items.options).includes(toolConfig.attributes.items.defaultValue)) {
                tool.items.options[toolConfig.attributes.items.defaultValue] = toolConfig.attributes.items.defaultValue;
              }
            tool.items.value = [toolConfig.attributes.items.defaultValue];
            }

            const statusesURL = `${tool.url.value}/rest/api/latest/status`;
            HttpRequest.httpRequest('GET', statusesURL, undefined, auth, {Accept: 'application/json'})
            .then((resStatus: any) => {
//              appLogger.info({connectAndFetchFromJIRA: {statusesURL, resStatus}});
              if (resStatus.statusCode < 200 || resStatus.statusCode >= 300) {
                const err = new Error('Error connecting to JIRA');
                appLogger.error(err, 'Code: ' + resStatus.statusCode);
                reject(err);
              } else {
                const statusData = JSON.parse(resStatus.body);
                appLogger.info({statusData});
//                const options = statusData.map((elm: any) => elm.name);
                const options = {};
                statusData.forEach((elm: any) => {
                  options[elm.name] = elm.name;
                });
                tool.closeState.options = options;
                if(toolConfig.attributes.closeState.defaultValue) {
//                  if(! tool.closeState.options.includes(toolConfig.attributes.closeState.defaultValue)) {
//                    tool.closeState.options.push(toolConfig.attributes.closeState.defaultValue);
//                  }
                  if(! Object.keys(tool.closeState.options).includes(toolConfig.attributes.closeState.defaultValue)) {
                    tool.closeState.options[toolConfig.attributes.closeState.defaultValue] = toolConfig.attributes.closeState.defaultValue;
                  }
                  tool.closeState.value = toolConfig.attributes.closeState.defaultValue;
                }
                tool.startState.options = options;
                if(toolConfig.attributes.startState.defaultValue) {
//                  if(! tool.startState.options.includes(toolConfig.attributes.startState.defaultValue)) {
//                    tool.startState.options.push(toolConfig.attributes.startState.defaultValue);
//                  }
                  if(! Object.keys(tool.startState.options).includes(toolConfig.attributes.startState.defaultValue)) {
                    tool.startState.options[toolConfig.attributes.startState.defaultValue] = toolConfig.attributes.startState.defaultValue;
                  }
                  tool.startState.value = toolConfig.attributes.startState.defaultValue;
                }
                tool.newState.options = options;
                if(toolConfig.attributes.newState.defaultValue) {
//                  if(! tool.newState.options.includes(toolConfig.attributes.newState.defaultValue)) {
//                    tool.newState.options.push(toolConfig.attributes.newState.defaultValue);
//                  }
                  if(! Object.keys(tool.newState.options).includes(toolConfig.attributes.newState.defaultValue)) {
                    tool.newState.options[toolConfig.attributes.newState.defaultValue] = toolConfig.attributes.newState.defaultValue;
                  }
                  tool.newState.value = toolConfig.attributes.newState.defaultValue;
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
      }
    })
    .catch((err) => {
      appLogger.error({ JIRAGetError: err });
      reject(err);
    });
  });
}
