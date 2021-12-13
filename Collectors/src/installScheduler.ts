//import * as fs from 'fs';
import { config, getTableNameForOrg, installLogger } from './utils';
import { CollectorConfigDetails, ConfigItem } from './models';
import { getCollectorsConfig, setCollectorsConfig } from './dynamoDB';
import { createIndex } from './elasticsearch';

install().catch((err) => installLogger.error(err));

async function install() {
  //create a blank CollectorConfig document in DynamoDB if it is not already there
  installLogger.info('Checking CollectorConfig entry');
  getCollectorsConfig()
    .then((data: ConfigItem) => {
      //console.log('Received: ', data);
      installLogger.info({ ConfigItem: data }, 'Received collector config');
	  if(typeof data === 'undefined') {
	    //console.log('Writing: ', {});
    	installLogger.info('Writing empty collector config');
      	setCollectorsConfig(<CollectorConfigDetails>{});
	  }
    })
    .catch((err: any) => installLogger.error(err));

  //initialise the mappings for different indexes in elasticsearch if it is not already there
  installLogger.info('Creating mappings for elasticsearch indices');
  await createIndex(getTableNameForOrg(config.buildIndex), getCICDIndexProperties());
  installLogger.info('CICD index created');
  await createIndex(getTableNameForOrg(config.repoIndex), getRepoIndexProperties());
  installLogger.info('Repo index created');
  await createIndex(getTableNameForOrg(config.reqIndex), getReqIndexProperties());
  installLogger.info('Req index created');
  await createIndex(getTableNameForOrg(config.qualityIndex), getQualityIndexProperties());
  installLogger.info('Quality index created');
  await createIndex(getTableNameForOrg(config.incidentIndex), getIncidentIndexProperties());
  installLogger.info('Incident index created');
  await createIndex(getTableNameForOrg(config.stateIndex), getStateIndexProperties());
  installLogger.info('State index created');
  await createIndex(getTableNameForOrg(config.gitlabCommitIndex), getGitLabCommitIndexProperties());
  installLogger.info('GitlabCommit index created');

  //write(copy and modify) the doitright.service file in the appropriate location
}

function getCICDIndexProperties() {
	return {
		teamId: { type: 'keyword' },
		servicePath: { type: 'keyword' },
		projectName: { type: 'keyword' },
		failureWindow: { type: 'integer' },
		buildNum: { type: 'integer' },
		stages: {
			type: 'nested',
			properties: {
				stageName: { type: 'keyword'},
				stageId: { type: 'integer' },
				status: { type: 'keyword' },
				startTimestamp: { type: 'date', format: 'epoch_second' },
				endTimestamp: { type: 'date', format: 'epoch_second' },
				duration: { type: 'integer' },
				pauseDuration: { type: 'integer' },	
			}
		},
		startTimestamp: { type: 'date', format: 'epoch_second' },
		endTimestamp: { type: 'date', format: 'epoch_second' },
		duration: { type: 'integer' },
		pauseDuration: { type: 'integer' },
		status: { type: 'keyword' },
		url: { type: 'text' },
	};
}

function getRepoIndexProperties() {
	return {
		teamId: { type: 'keyword' },
		servicePath: { type: 'keyword' },
		projectName: { type: 'keyword' },
		repoName: { type: 'keyword' },
		raisedBy: { type: 'keyword' },
		pullId: { type: 'integer' }, //keyword
		status: { type: 'keyword' },
		acceptState: { type: 'keyword' },
		raisedOn: { type: 'date', format: 'epoch_second' },
		reviewedOn: { type: 'date', format: 'epoch_second' },
		url: { type: 'text' }
	};
}

function getGitLabCommitIndexProperties() {
	return {
		teamId: { type: 'keyword' },
		servicePath: { type: 'keyword' },
		projectName: { type: 'keyword' },
		repoName: { type: 'keyword' },
		ref: {type: 'keyword' },
		commitId: { type: 'keyword' },
		committedBy: { type: 'keyword' },
		pipelineId: { type: 'keyword' },
		pipelineStatus: { type: 'keyword' },
		commitDate: { type: 'date', format: 'epoch_second' },
		pipelineStartDate: { type: 'date', format: 'epoch_second' },
		pipelineEndDate: { type: 'date', format: 'epoch_second' },
		url: { type: 'text' }
	};
}

function getReqIndexProperties() {
	return {
		teamId: { type: 'keyword' },
		servicePath: { type: 'keyword' },
		projectName: { type: 'keyword' },
		itemId: { type: 'keyword' },
		itemPriority: { type: 'keyword' },
		itemType: { type: 'keyword' },
		status: { type: 'keyword' },
		closedOn: { type: 'date', format: 'epoch_second' },
		createdOn: { type: 'date', format: 'epoch_second' },
		startedOn: { type: 'date', format: 'epoch_second' },
		url: { type: 'text' }
	};
}

function getQualityIndexProperties() {
	return {
		teamId: { type: 'keyword' },
		servicePath: { type: 'keyword' },
		projectName: { type: 'keyword' },
//		buildNum: { type: 'integer' },
		timestamp: { type: 'date', format: 'epoch_second' },
		coverage: { type: 'short' },
		duplications: { type: 'short' },
		maintainability: { type: 'short' },
		reliability: { type: 'short' },
		security: { type: 'short' },
		url: { type: 'text' }
	};
}

function getIncidentIndexProperties() {
	return {
		teamId: { type: 'keyword' },
		servicePath: { type: 'keyword' },
		projectName: { type: 'keyword' },
		itemId: { type: 'keyword' },
		itemPriority: { type: 'keyword' },
		itemType: { type: 'keyword' },
		status: { type: 'keyword' },
		startTime: { type: 'date', format: 'epoch_second' },
		endTime: { type: 'date', format: 'epoch_second' },
		url: { type: 'text' }
	};
}

function getStateIndexProperties() {
	return {
		toolName: { type: 'keyword' },
		teamId: { type: 'keyword' },
		servicePath: { type: 'keyword' },
		project:{ type: 'keyword' },
	};
}
