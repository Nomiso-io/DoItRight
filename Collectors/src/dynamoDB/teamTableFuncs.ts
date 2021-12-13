import { config, getTableNameForOrg } from '../utils';
import * as dynamoDBFuncs from './dynamoDBFuncs';


export async function getTeamsMetricsInfo() {
	const params = {
		TableName: getTableNameForOrg(config.teamTable)
	};
	return dynamoDBFuncs.scan(params);
}
