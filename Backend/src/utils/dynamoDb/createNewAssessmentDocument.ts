import { Questionnaire } from '@models/index';
import { config } from '@root/config';
import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import { getQuestionIds, getQuestionnaireId } from './getQuestionnaire';
import { put } from './sdk';

export interface AssessmentDetails {
  [assessmentId: string]: {
    answers: [string];
    comment: string;
    index?: number;
  };
}

export interface CategoryWiseResults {
  [key: string]: {
    maxScore: number;
    percentage: number;
    score: number;
  };
}

export interface Result {
  categoryWiseResults: CategoryWiseResults;
  level: string;
  maxScore: number;
  percentage: number;
  recommendations?: any;
  score: number;
  showRecommendations?: boolean;
}

interface QuestionnaireDetails {
  hideResult?: boolean;
  timeOut?: boolean;
}

export interface AssessmentDocument {
  assessmentDetails?: AssessmentDetails;
  assessmentId: string;
  assessmentName?: string;
  date: number; // Date is the start time of the assessment
  dateSubmit?: number; // Date submit is the assessment end time
  feedback?: string;
  quesOrder?: string[];
  questionnaireDetails?: QuestionnaireDetails;
  questionnaireVersion?: string;
  result?: Result;
  team: string;
  type: string; // This is the questionnaireId
  userId: string;
}

//CREATE a fresh assessment using UUID generated assessmentId and questionnaire Type
export const createNewAssessmentDocument = async (
  userId: string,
  assessmentId: string,
  team: string,
  assessmentType?: string,
  version?: string
) => {
  if (!userId || !assessmentId) {
    const err = new Error('Missing userId or assessmentId');
    appLogger.error(err);
    throw err;
  }
  const type = assessmentType ? assessmentType : config.defaults.quesType;
  const quesId: string[] = await getQuestionIds(type, version);
  appLogger.info({ getQuestionIds: quesId });
  let timeOut = false;
  let hideResult = false;
  if (assessmentType && version) {
    const questionnaireDetails: Questionnaire = await getQuestionnaireId(
      assessmentType,
      version
    );
    timeOut = questionnaireDetails.timeOut
      ? questionnaireDetails.timeOut
      : false;
    hideResult = questionnaireDetails.hideResult
      ? questionnaireDetails.hideResult
      : false;
  }
  const item: AssessmentDocument = {
    assessmentDetails: {},
    assessmentId,
    date: new Date().getTime(),
    quesOrder: quesId, //question id without version
    questionnaireDetails: {
      hideResult,
      timeOut,
    },
    questionnaireVersion: version ? version : '1',
    team,
    type,
    userId,
  };

  const params: DynamoDB.PutItemInput = <DynamoDB.PutItemInput>(<unknown>{
    TableName: TableNames.getAssessmentsTableName(),
    // tslint:disable-next-line: object-literal-sort-keys
    Item: item,
    ConditionExpression:
      'attribute_not_exists(userId) AND attribute_not_exists(assessmentId)',
  });

  appLogger.info({ createNewAssessmentDocument_put_params: params });
  return put<DynamoDB.PutItemOutput>(params);
};
