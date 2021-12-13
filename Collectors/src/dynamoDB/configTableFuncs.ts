import { DynamoDB } from 'aws-sdk';
import { config, getTableNameForOrg, getOrgId } from '../utils';
import * as dynamoDBFuncs from './dynamoDBFuncs';
import { CollectorConfigDetails, ConfigItem } from '../models';

export async function getCollectorsConfig(): Promise<ConfigItem> {
	const params: DynamoDB.GetItemInput = <DynamoDB.GetItemInput>(<unknown>{
		Key: {
			orgId: getOrgId(),
			type: 'CollectorConfig',
		},
		TableName: getTableNameForOrg(config.configTable),
	});

	return dynamoDBFuncs.get<ConfigItem>(params);
};

export async function setCollectorsConfig ( data: CollectorConfigDetails ) {
	const params: DynamoDB.UpdateItemInput = <DynamoDB.UpdateItemInput>(<unknown>{
		ExpressionAttributeNames: { '#config': 'config' },
		ExpressionAttributeValues: { ':config': data },
		Key: {
			orgId: getOrgId(),
			type: 'CollectorConfig',
		},
		TableName: getTableNameForOrg(config.configTable),
		UpdateExpression: `SET #config = :config`,
	});

	return dynamoDBFuncs.update<ConfigItem>(params);
};
