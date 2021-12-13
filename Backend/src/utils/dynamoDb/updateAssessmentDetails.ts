import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import { update } from './sdk';

interface Details {
  answers: string[];
  comment: string;
  questionId: string;
  version: number;
}

//Update assessment for every answer corresponding to questionId -- answers API
export const updateAssessmentDetails = async ({
  userId,
  assessmentId,
  details,
}: {
  assessmentId: string;
  details: Details;
  userId: string;
}) => {
  const { questionId, version, answers, comment } = details;

  const params: DynamoDB.UpdateItemInput = <DynamoDB.UpdateItemInput>(<unknown>{
    ConditionExpression:
      'attribute_exists(userId) AND attribute_exists(assessmentId)',
    ExpressionAttributeNames: {
      '#questionId': `${questionId}_${version ? version : 1}`,
    },
    ExpressionAttributeValues: {
      ':value': {
        answers,
        comment: comment || undefined,
      },
    },
    Key: {
      assessmentId,
      userId,
    },
    TableName: TableNames.getAssessmentsTableName(),
    UpdateExpression: 'SET assessmentDetails.#questionId = :value',
  });

  appLogger.info({ updateAssessmentDetails_update_params: params });
  return update(params);
};
