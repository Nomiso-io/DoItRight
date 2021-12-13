import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import { AssessmentDocument } from './createNewAssessmentDocument';
import { scan } from './sdk';

export const getUserAssessmentDocument = async ({
  assessmentId,
}: {
  assessmentId: string;
}): Promise<any> => {
  if (!assessmentId) {
    const err = new Error('assessmentId missing');
    appLogger.error(err);
    throw err;
  }

  let params: DynamoDB.ScanInput;
  params = <DynamoDB.ScanInput>{
    ExpressionAttributeNames: {
      '#assessmentId': 'assessmentId',
    },
    ExpressionAttributeValues: { ':assessmentId': assessmentId },
    FilterExpression: '#assessmentId = :assessmentId',
    TableName: TableNames.getAssessmentsTableName(),
  };

  appLogger.info({ getUserAssessmentDocument_scan_params: params });
  return scan<AssessmentDocument[]>(params).then((assessmentDocuments) => {
    if (!assessmentDocuments[0]) {
      return {};
    }
    return assessmentDocuments[0];
  });
};
