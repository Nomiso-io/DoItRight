import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import { update } from './sdk';

export interface TeamField {
  isLead: boolean;
  name: string;
}
// add team into cognitoUsers teamFIeld
export const addUserToTeam = async (
  userId: string,
  teams: string,
  appendTeam?: boolean
) => {
  if (!userId || !teams) {
    throw new Error('Invaid data input');
  }
  const teamField: TeamField[] = [
    {
      isLead: false,
      name: teams,
    },
  ];
  const params: DynamoDB.UpdateItemInput = <DynamoDB.UpdateItemInput>(<unknown>{
    ConditionExpression: 'not contains (#teams, :label_comp)',
    ExpressionAttributeNames: {
      '#teams': 'teams',
    },
    ExpressionAttributeValues: {
      ':label': teamField,
      ':label_comp': teamField[0],
    },
    Key: {
      id: userId,
    },
    TableName: TableNames.getCognitoUsersTableName(),
    // UpdateExpression: 'SET #teams = list_append(if_not_exists(#teams, :empty_list), :label)'
    UpdateExpression: appendTeam
      ? 'SET #teams = list_append(#teams, :label)'
      : 'SET #teams = :label',
    // UpdateExpression: 'SET #teams = :label'
  });
  appLogger.info({ addUserToTeam_update_params: params });
  return update(params);
};
