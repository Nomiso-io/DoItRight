import { Question } from '@models/index';
import {
  getQuestionIdFromCompositeQuestionId,
  getVersionFromCompositeQuestionId,
} from '@utils/common';
import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import { get, getMulti } from './sdk';

interface Questions {
  Questions: Question[];
}

//BatchGetOperations fetch questions details, splits ids into id and version before fetching.
export const getQuestionDetailsMulti = async ({
  questionIds,
}: {
  questionIds: string[];
}): Promise<Question[]> => {
  const tableName = TableNames.getQuestionsTableName();

  //received questionIds are of the form <actual question id>_<question version>
  if (!questionIds) {
    const err = new Error('Missing questionIds');
    appLogger.error(err);
    throw err;
  }

  if (questionIds.length < 1) {
    const err = new Error('Invalid assessmentId or Assessment not completed');
    appLogger.error(err);
    throw err;
  }
  const params: DynamoDB.BatchGetItemInput = <DynamoDB.BatchGetItemInput>(<
    unknown
  >{
    RequestItems: {
      [tableName]: {
        AttributesToGet: [
          'answers',
          'id',
          'version',
          'question',
          'level',
          'thresholdScore',
          'comments',
          'type',
          'numberOfAnswers',
        ],
        ConsistentRead: false, // Cached values are okay
        Keys: questionIds.map((key: string) => {
          const id = getQuestionIdFromCompositeQuestionId(key);
          const version = getVersionFromCompositeQuestionId(key);
          return {
            id,
            version,
          };
        }),
      },
    },
  });
  appLogger.info({ getQuestionDetailsMulti_getMulti_params: params });

  return getMulti<Questions>(params).then((item) => item[tableName]);
};

//BatchGetOperations fetch questions details, splits ids into id and version before fetching.
export const getQuestionDetailsBySplitingId = async (
  questionId: string
): Promise<Question> => {
  //received questionIds are of the form <actual question id>_<question version>
  if (!questionId) {
    const err = new Error('Missing questionId');
    appLogger.error(err);
    throw err;
  }

  const id = getQuestionIdFromCompositeQuestionId(questionId);
  const version = getVersionFromCompositeQuestionId(questionId);

  const params: DynamoDB.GetItemInput = <DynamoDB.GetItemInput>(<unknown>{
    Key: {
      id,
      version,
    },
    TableName: TableNames.getQuestionsTableName(),
  });

  appLogger.info({ getQuestionDetails_get_params: params });
  return get<Question>(params);
};
