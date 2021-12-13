import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import { update } from './sdk';

interface Details {
  comment: string;
  rating: number;
}

export const updateAssessmentFeedback = async ({
  userId,
  assessmentId,
  details,
}: {
  assessmentId: string;
  details: Details;
  userId: string;
}) => {
  const { rating, comment } = details;

  const params: DynamoDB.UpdateItemInput = <DynamoDB.UpdateItemInput>(<unknown>{
    ConditionExpression:
      'attribute_exists(userId) AND attribute_exists(assessmentId)',
    ExpressionAttributeNames: {
      '#feedback': 'feedback',
    },
    ExpressionAttributeValues: {
      ':feedback': {
        comment: comment || undefined,
        rating,
      },
    },
    Key: {
      assessmentId,
      userId,
    },
    TableName: TableNames.getAssessmentsTableName(),
    UpdateExpression: 'SET #feedback = :feedback',
  });

  appLogger.info({ updateAssessmentFeedback_update_params: params });
  return update(params);
};
