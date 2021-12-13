import workerFarm from 'worker-farm'; //alternatives: cluster, worker_threads, Web Worker
import { isDebuggingEnabled, appLogger, setLogLevelToDebug } from './utils';
import { getCollectorsConfig, getTeamsMetricsInfo, setCollectorsConfig } from './dynamoDB';
import { CollectorConfig, ConfigItem, IMetricsTool } from './models';

const schedulerInterval = 1000*600; //10 min in milliseconds

start().catch((err) => appLogger.error(err));

async function start() {
	await initialize();
	execute();
}

async function initialize() {
	appLogger.info("Initializing scheduler");
	//check if debug is enabled
	if(isDebuggingEnabled()) {
		setLogLevelToDebug();
	}
}

async function execute() {
	appLogger.info("Executing scheduler");
	getCollectorsConfig()
	.then((data: ConfigItem) => {
		appLogger.info("Received collector config");
//		appLogger.trace({data}, "Received collector config");
		const scheduledCollectors: string[] = [];
		Object.keys(data.config).forEach( (key: string) => {
			data.config[key].forEach( (colDetails: CollectorConfig, index: number) => {
				const now = Date.now();
				if ((! colDetails.nextCollectorRunTimestamp) || (colDetails.nextCollectorRunTimestamp < now)) {
					scheduledCollectors.push(colDetails.name);
					data.config[key][index].nextCollectorRunTimestamp = getNextRun(now, colDetails.collectorSchedule);
				}
			});
		});
		setCollectorsConfig(data.config);

		appLogger.info({scheduledCollectors}, "Scheduled collectors");
		runCollectors(scheduledCollectors);
	})
	.catch( (err: any) => appLogger.error({err}, "Error receiving collector config") );
	
	setTimeout(execute, schedulerInterval);
}

/**
 * @abstract Returns the next timestamp after adding the gap converted to millisecs to current
 *
 * @param current, the current timestamp in milliseconds
 * @param gap, the number of hours gap
 *
 * @returns the next timestamp in milliseconds
 */
function getNextRun(current: number, gap: number) {
	return (current + (gap * 3600 * 1000)); //converts hours to milliseconds and add to now
}

//Exit cleanly on ctrl+c pressing 
process.on('SIGINT', async function() {
	//TODO: confirm shutdown and then close
	appLogger.info("Received SIGINT. Stopping scheduler.");
	await shutDown();
	process.exit();
});

async function shutDown() {
}

/*
async function runProcessors() {
	//start the processors
	Object.keys(Collectors).forEach( (name) => {
//		const processorFileName = './' + processorName + 'Processor';
		appLogger.info("Starting " + Collectors[name].processorFile);
//		const service = workerFarm(require.resolve(Collectors[name].processorFile));
//		service('', workerEnded);
	});

//	setTimeout(runProcessors, processorInterval);
}
*/

async function runCollectors(scheduledCollectors: string[]) {
	const teamsMetricsInfo: any  = await getTeamsMetricsInfo();
	appLogger.info({teamsMetricsInfo}, "Received team metrics details");
	teamsMetricsInfo.forEach(async (team: any) => {
//		let fetchedForService: boolean = false;
		if(team.services && team.services.length > 0) {
			appLogger.info({teamServices: team.services}, "processing services");
			/*fetchedForService = */await fetchForServices(scheduledCollectors, team.teamId, '', team.services);
		}

		if(/*!fetchedForService && */team.metrics && (team.metrics.length > 0)) {
			team.metrics.forEach((metricTool: IMetricsTool) => {
				fetchMetricsFor(scheduledCollectors, team.teamId, '', metricTool);
			});
		}

/*
		if(team.metrics) {
			appLogger.info("Collectors attached for team " + team.teamId);
			team.metrics.forEach((metricTool: IMetricsTool) => {
				appLogger.info({teamName: team.teamId, metricToolName: metricTool.toolName, toolEnabled: metricTool.enabled}, "Collector of a team");
				if(metricTool.enabled && scheduledCollectors.includes(metricTool.toolName)) {
					const servicePaths: string[] = createServicePaths(team.services || ['']);
					servicePaths.forEach((servicePath: string) => {
						var collectorData = { ...metricTool, teamId: team.teamId, servicePath: servicePath };
//						appLogger.trace(collectorData);
						const collectorFile = `./${collectorData.toolName}/Collector`;
						appLogger.info("Starting collector worker " + collectorFile);
						const service = workerFarm(require.resolve(collectorFile));
						service(collectorData, workerEnded);
					});
				} else {
					appLogger.info("Not starting collector");
				}
			});
		} else {
			appLogger.info("No collectors attached for team " + team.teamId);
		}
*/
	})
}

async function fetchForServices(scheduledCollectors: string[], teamId: string, parentServicePath: string, services: any[]): Promise<boolean> {
	return new Promise((resolve: any, reject: any) => {
//		let fetchedForService: boolean = false;
		services.forEach(async (service: any) => {
//			let fetchedForThisService: boolean = false;
			let newServicePath: string = (parentServicePath === '') ? service.id : `${parentServicePath}/${service.id}`
			if(service.services && service.services.length > 0) {
				appLogger.info({serviceServices: service.services}, "processing services");
				/*fetchedForThisService = */await fetchForServices(scheduledCollectors, teamId, newServicePath, service.services);
			}
//			if(fetchedForThisService) {
//				fetchedForService = true;
//			}
			if(/*!fetchedForThisService && */service.metrics && (service.metrics.length > 0)) {
//				fetchedForService = true;
				service.metrics.forEach(async (metricTool: IMetricsTool) => {
					await fetchMetricsFor(scheduledCollectors, teamId, newServicePath, metricTool);
				});
			}
		});
		resolve(/*fetchedForService*/true);
	});
}

async function fetchMetricsFor(scheduledCollectors: string[], teamId: string, servicePath: string, metricTool: IMetricsTool) {
	appLogger.info({teamName: teamId, servicePath: servicePath, metricToolName: metricTool.toolName, toolEnabled: metricTool.enabled}, "Collector of a team");
	if(metricTool.enabled && scheduledCollectors.includes(metricTool.toolName)) {
		var collectorData = { ...metricTool, teamId: teamId, servicePath: servicePath };
//						appLogger.trace(collectorData);
		const collectorFile = `./${collectorData.toolName}/Collector`;
		appLogger.info("Starting collector worker " + collectorFile);
		const service = workerFarm(require.resolve(collectorFile));
		service(collectorData, workerEnded);
	} else {
		appLogger.info({tool: metricTool.toolName, enabled: metricTool.enabled, scheduled: scheduledCollectors.includes(metricTool.toolName)}, "Not starting collector");
	}
}

function workerEnded(err: any, data: any) {
	if(err) {
		appLogger.error({err}, "Worker ended with error");
	}
	if(data) {
		appLogger.info({data}, "Worker ended");
	}
}

//https://webpack.js.org/guides/getting-started/
//https://nodejs.org/en/knowledge/getting-started/the-process-module/
/*
// Show how to handle Ctrl+C in Node.js
var zmq = require('zmq')
  , socket = zmq.createSocket('rep');

socket.on('message', function(buf) {
  // echo request back
  socket.send(buf);
});

process.on('SIGINT', function() {
  socket.close();
  process.exit();
});

socket.bindSync('tcp://*:5555');
*/