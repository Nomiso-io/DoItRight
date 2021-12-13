//import { config } from '@root/config';
import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger, Result } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import { transactWrite, update } from './sdk';

//const DB_ENV = <string>process.env.DB_ENV;

//Add result to dynamoDB after user hits 'Submit'
export const addResultToAssessmentDocument = async ({
  assessmentId,
  dateSubmit,
  result,
  userId,
}: {
  assessmentId: string;
  dateSubmit: number;
  result: Result;
  userId: string;
}) => {
  const params: DynamoDB.UpdateItemInput = <DynamoDB.UpdateItemInput>(<unknown>{
    ConditionExpression:
      'attribute_exists(userId) AND attribute_exists(assessmentId)',
    ExpressionAttributeNames: {
      '#dateSubmit': 'dateSubmit',
      '#result': 'result',
    },
    ExpressionAttributeValues: {
      ':dateSubmit': dateSubmit,
      ':result': result,
    },
    Key: {
      assessmentId,
      userId,
    },
    TableName: TableNames.getAssessmentsTableName(),
    UpdateExpression: 'SET #result = :result, #dateSubmit = :dateSubmit',
  });

  appLogger.info({ addResultToAssessmentDocument_update_params: params });
  return update(params);
};

// transaction for adding Result to dynamoDB NOT IN USE
export const transact = async ({
  assessmentId,
  dateSubmit,
  result,
  userId,
}: {
  assessmentId: string;
  dateSubmit: number;
  result: Result;
  userId: string;
}) => {
  const updates = {
    ConditionExpression:
      'attribute_exists(userId) AND attribute_exists(assessmentId)',
    ExpressionAttributeNames: {
      '#dateSubmit': 'dateSubmit',
      '#result': 'result',
    },
    ExpressionAttributeValues: {
      ':dateSubmit': dateSubmit,
      ':result': result,
    },
    Key: {
      assessmentId,
      userId,
    },
    TableName: TableNames.getAssessmentsTableName(),
    UpdateExpression: 'SET #result = :result, #dateSubmit = :dateSubmit',
  };
  const params: DynamoDB.TransactWriteItemsInput = <
    DynamoDB.TransactWriteItemsInput
  >(<unknown>{
    TransactItems: [
      {
        Update: updates,
      },
    ],
  });

  appLogger.info({ transact_updates_params: params });
  return transactWrite(params);
};
