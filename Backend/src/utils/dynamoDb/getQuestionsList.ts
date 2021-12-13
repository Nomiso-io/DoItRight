import { Questionnaire } from '@models/index';
import { getQuestionDetails, sortCategoriesMapByCategories } from '@utils/dynamoDb';
import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import { get } from './sdk';

interface QuestionsList {
  orgName: string;
  questions: [string];
  teamName: string;
}

//Fetch questionsList for a particular questionnaire
export const getQuestionsList = async ({
  quesType,
  version,
}: {
  quesType: string;
  version?: string;
}): Promise<any> => {
  if (!quesType) {
    const err = new Error('Missing quesType');
    appLogger.error(err);
    throw err;
  }

  const params: DynamoDB.GetItemInput = <DynamoDB.GetItemInput>(<unknown>{
    Key: {
      questionnaireId: quesType,
      version: version ? version : '1',
    },
    TableName: TableNames.getQuestionnairesTableName(),
  });

  appLogger.info({ getQuestionsList_get_params: params });
  return get<QuestionsList>(params).then(
    (item: QuestionsList) => item.questions
  );
};

//Fetch categoriesMap for a particular questionnaire
export const getCategoriesMap = async ({
  quesType,
  version,
}: {
  quesType: string;
  version?: string;
}): Promise<any> => {
  if (!quesType) {
    const err = new Error('Missing quesType');
    appLogger.error(err);
    throw err;
  }

  const params: DynamoDB.GetItemInput = <DynamoDB.GetItemInput>(<unknown>{
    Key: {
      questionnaireId: quesType,
      version: version ? version : '1',
    },
    TableName: TableNames.getQuestionnairesTableName(),
  });

  appLogger.info({ getQuestionsList_get_params: params });
  return get<Questionnaire>(params).then(
    (item: Questionnaire) => item.categoriesMap
  );
};

// Gets the list of questions sorted according to the categories.
export const getQuestionsListSorted = async ({
  quesType,
  version,
}: {
  quesType: string;
  version?: string;
}): Promise<any> => {
  if (!quesType) {
    const err = new Error('Missing quesType');
    appLogger.error(err);
    throw err;
  }

  let categoriesMap = await getCategoriesMap({ quesType, version });
  categoriesMap = await sortCategoriesMapByCategories(categoriesMap);
  const questions = Object.keys(categoriesMap);
  return questions;
};

//FETCH a questionnaire with Questions and Answers
export const getQuestions = async (questionnaireId: string): Promise<any> => {
  const quesDetails = {};
  const res = await getQuestionsList({
    quesType: questionnaireId,
  });
  appLogger.info({ getQuestionsList: res });
  for (const val of res) {
    const ques = await getQuestionDetails(val);
    appLogger.info({ getQuestionDetails: ques });
    quesDetails[ques.id] = ques;
    if (Object.keys(quesDetails).length === res.length) {
      // resolve(quesDetails);
      return JSON.stringify(quesDetails);
    }
  }
};
