import * as fs from 'fs';
import { installLogger } from './utils';
import { CollectorConfig, ConfigItem } from './models';
import { getCollectorsConfig, setCollectorsConfig } from './dynamoDB';

install().catch((err) => installLogger.error(err));

async function install() {
  // console.log('started');
  //process runtime arguments
  var myArgs = process.argv.slice(2);
  if (myArgs.length > 0) {
    installLogger.info(`Installing ${myArgs[0]} collector....`);
    const collectorDetailsFile = `./conf/${myArgs[0]}.json`;
    // Read the configuration file, and write configuration to DynamoDB
    installLogger.info(`Reading configuration file.`);
    const data: string = fs.readFileSync(collectorDetailsFile, {
      encoding: 'utf8',
      flag: 'r',
    });
    const collectorDetails = JSON.parse(data);
    installLogger.info({ collectorDetails });
    execute(collectorDetails);
  } else {
    // console.log('collector name as argument required');
    installLogger.info(
      'No collector name mentioned. Please provide the collector name as argument.'
    );
  }
}

async function execute(collectorDetails: CollectorConfig) {
  getCollectorsConfig()
    .then((data: ConfigItem) => {
      // console.log('Received: ', data);
      installLogger.info({ ConfigItem: data }, 'Received collector config');
      let nextCollectorRun = Date.now();
      let nextProcessorRun = Date.now();
      Object.keys(data.config).forEach((key: string) => {
        if (key === collectorDetails.type) {
          data.config[key].forEach(
            (colDetails: CollectorConfig, index: number) => {
              //remove the collector configuration if it already exists
              if (colDetails.name === collectorDetails.name) {
                nextCollectorRun = colDetails.nextCollectorRunTimestamp;
                nextProcessorRun = colDetails.nextProcessorRunTimestamp;
                data.config[key].splice(index, 1);
              }
            }
          );
        }
      });
      //now add the configuration of the collector we are installing
      collectorDetails.nextCollectorRunTimestamp = nextCollectorRun;
      collectorDetails.nextProcessorRunTimestamp = nextProcessorRun;
      if (!Object.keys(data.config).includes(collectorDetails.type)) {
        data.config[collectorDetails.type] = [];
      }
      data.config[collectorDetails.type].push(collectorDetails);
      // console.log('Writing: ', data);
      installLogger.info({ ConfigItem: data }, 'Writing collector config');
      setCollectorsConfig(data.config);
    })
    .catch((err: any) => installLogger.error(err));
}
