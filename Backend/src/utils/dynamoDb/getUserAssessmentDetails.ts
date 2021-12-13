import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger, getUserTeams } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import {
  AssessmentDetails,
  AssessmentDocument,
} from './createNewAssessmentDocument';
import { getQuestionnaire } from './getQuestionnaire';
import { get, query, scan, update } from './sdk';

export const getUserAssessmentDetails = async ({
  userId,
  assessmentId,
}: {
  assessmentId: string;
  userId: string;
}): Promise<AssessmentDetails> => {
  if (!userId || !assessmentId) {
    const err = new Error('Missing userId or assessmentId');
    appLogger.error(err);
    throw err;
  }
  const params: DynamoDB.GetItemInput = <DynamoDB.GetItemInput>(<unknown>{
    TableName: TableNames.getAssessmentsTableName(),
    // tslint:disable-next-line: object-literal-sort-keys
    Key: {
      assessmentId,
      userId,
    },
  });

  appLogger.info({ getUserAssessmentDetails_get_params: params });
  return get<AssessmentDocument>(params).then(
    (item) => <AssessmentDetails>item.assessmentDetails
  );
};

export const getUserAssessment = async ({
  userId,
  assessmentId,
}: {
  assessmentId: string;
  userId: string;
}): Promise<AssessmentDocument> => {
  if (!userId || !assessmentId) {
    const err = new Error('Missing userId or assessmentId');
    appLogger.error(err);
    throw err;
  }
  const params: DynamoDB.GetItemInput = <DynamoDB.GetItemInput>(<unknown>{
    TableName: TableNames.getAssessmentsTableName(),
    // tslint:disable-next-line: object-literal-sort-keys
    Key: {
      assessmentId,
      userId,
    },
  });

  appLogger.info({ getUserAssessment_get_params: params });
  return get<AssessmentDocument>(params);
};

export const getUserAssessmentFromIndex = async ({
  assessmentId,
}: {
  assessmentId: string;
}): Promise<AssessmentDocument> => {
  const params: DynamoDB.QueryInput = <DynamoDB.QueryInput>(<unknown>{
    ExpressionAttributeValues: { ':assessmentId': assessmentId },
    IndexName: 'assessmentId-index',
    // tslint:disable-next-line: object-literal-sort-keys
    KeyConditionExpression: 'assessmentId = :assessmentId',
    TableName: TableNames.getAssessmentsTableName(),
  });

  return query<AssessmentDocument>(params).then((res: any) =>
    res.length > 0 ? res[0] : []
  );
};

export const getUserAssessmentType = async (
  userId: string,
  assessmentId: string
): Promise<string> => {
  if (!userId || !assessmentId) {
    const err = new Error('Missing userId or assessmentId');
    appLogger.error(err);
    throw err;
  }

  const params: DynamoDB.GetItemInput = <DynamoDB.GetItemInput>(<unknown>{
    TableName: TableNames.getAssessmentsTableName(),
    // tslint:disable-next-line: object-literal-sort-keys
    Key: {
      assessmentId,
      userId,
    },
  });
  appLogger.info({ getUserAssessmentType_get_params: params });
  return get<AssessmentDocument>(params)
    .then((item) => item.type)
    .catch((e) => {
      const err = new Error('Incorrect AssessmentId');
      appLogger.error(err);
      throw err;
    });
};

export const getUserAllAssessment = async ({
  userId,
}: {
  userId: string;
}): Promise<AssessmentDocument[]> => {
  const questionnaireDetails: any = await getQuestionnaire(true);
  appLogger.info({ getQuestionnaire: questionnaireDetails });
  const questionnaireMap = {};
  questionnaireDetails.forEach((questionnaire: any) => {
    questionnaireMap[questionnaire.questionnaireId] = questionnaire.name;
  });
  const params: DynamoDB.QueryInput = <DynamoDB.QueryInput>(<unknown>{
    ExpressionAttributeValues: { ':user': userId },
    // tslint:disable-next-line: object-literal-sort-keys
    KeyConditionExpression: 'userId = :user',
    TableName: TableNames.getAssessmentsTableName(),
  });
  const strLiteral = 'assessmentName';
  appLogger.info({ getUserAllAssessment_query_params: params });
  return query<AssessmentDocument[]>(params).then((assessmentDocuments: any) =>
    assessmentDocuments.map((assessmentDocument: any) => {
      assessmentDocument[strLiteral] =
        questionnaireMap[assessmentDocument.type];
      return assessmentDocument;
    })
  );
};

export const getAllAssessments = async (): Promise<AssessmentDocument[]> => {
  const params: DynamoDB.ScanInput = <DynamoDB.ScanInput>{
    TableName: TableNames.getAssessmentsTableName(),
  };
  return scan<any>(params);
};

export const getBestScoringAssessment = async (
  type: string
): Promise<AssessmentDocument | undefined> => {
  const allAssessments = await getAllAssessments();
  let bestAssessment: AssessmentDocument = allAssessments[0];
  allAssessments.forEach((assessment: AssessmentDocument, i: number) => {
    if (assessment.type === type) {
      if (bestAssessment.type === type) {
        if (
          assessment.result &&
          bestAssessment.result &&
          bestAssessment.result.percentage < assessment.result.percentage
        ) {
          bestAssessment = assessment;
        }
      } else {
        if (assessment.result) {
          bestAssessment = assessment;
        }
      }
    }
  });
  if (bestAssessment.type === type) {
    return bestAssessment;
  }
  return undefined;
};

const updateAssessment = (
  assessment: AssessmentDocument
) /* : Promise<any> */ => {
  const params: DynamoDB.UpdateItemInput = <DynamoDB.UpdateItemInput>(<unknown>{
    ExpressionAttributeNames: {
      '#team': 'team',
    },
    ExpressionAttributeValues: {
      ':team': assessment.team,
    },
    Key: {
      assessmentId: assessment.assessmentId,
      userId: assessment.userId,
    },
    TableName: TableNames.getAssessmentsTableName(),
    UpdateExpression: 'SET #team = :team',
  });
  appLogger.info({ updateAssessment_update_params: params });
  return update(params);
};

export const addTeamToAssessment = async (): Promise<any> => {
  const assessments = await getAllAssessments();
  for (const assessment of assessments) {
    const teams = await getUserTeams(assessment.userId);
    assessment.team = teams.length > 0 ? teams[0].name : 'Others';
    await updateAssessment(assessment);
  }
};
