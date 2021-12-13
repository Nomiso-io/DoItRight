import { Questionnaire } from '@models/index';
import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import { QuestionnaireCreate } from './questionnaireManagement';
import { get, scan } from './sdk';

//FETCH active questionnaire and fetchAll of flag TRUE
export const getQuestionnaire = async (
  fetchAll?: boolean
): Promise<Questionnaire[]> => {
  let params = <DynamoDB.ScanInput>{
    Limit: Number.MAX_SAFE_INTEGER,
    TableName: TableNames.getQuestionnairesTableName(),
  };
  if (fetchAll) {
    appLogger.info({ getQuestionnaire_fetchAll_scan_params: params });
    return scan<Questionnaire[]>(params);
  }
  params = <DynamoDB.ScanInput>{
    ExpressionAttributeNames: {
      '#active': 'active',
    },
    ExpressionAttributeValues: {
      ':active': true,
    },
    FilterExpression: '#active = :active',
    Limit: Number.MAX_SAFE_INTEGER,
    TableName: TableNames.getQuestionnairesTableName(),
  };
  appLogger.info({ getQuestionnaire_scan_params: params });
  return scan<Questionnaire[]>(params);
};

export const getQuestionIds = async (
  id: string,
  version?: string
): Promise<string[]> => {
  const params: DynamoDB.GetItemInput = <DynamoDB.GetItemInput>(<unknown>{
    Key: {
      questionnaireId: id,
      version: version ? version : '1',
    },
    TableName: TableNames.getQuestionnairesTableName(),
  });
  appLogger.info({ getQuestionIds_get_params: params });
  return get<Questionnaire>(params).then((item) => item.questions);
};

export const getQuestionnaireId = async (
  id: string,
  version?: string
): Promise<Questionnaire> => {
  const params: DynamoDB.GetItemInput = <DynamoDB.GetItemInput>(<unknown>{
    Key: {
      questionnaireId: id,
      version: version ? version : '1',
    },
    TableName: TableNames.getQuestionnairesTableName(),
  });
  appLogger.info({ getQuestionnaireId_get_params: params });
  return get<Questionnaire>(params);
};

export const getNewQuestionnaireId = async (data: QuestionnaireCreate) => {
  const allQuestionnaire = await getQuestionnaire(true);
  let questionnaireId = '';
  allQuestionnaire.forEach((element) => {
    if (element.name === data.name) {
      const date = Date.now();
      //tslint:disable-next-line:strict-comparisons
      if (date - element.createdOn < 5000 && element.createdBy === data.createdBy) {
        questionnaireId = element.questionnaireId;
      }
    }
  });
  return questionnaireId;
};

export const getTheLatestQuestionnaireVersion = async (
  questionnaireId: string
): Promise<any> => {
  const allQuestionnaire = await getQuestionnaire(true);
  let latestVersion = '1';
  allQuestionnaire.forEach((element) => {
    if (element.questionnaireId === questionnaireId) {
      if (
        parseInt(element.version ? element.version : '0', 10) >
        parseInt(latestVersion, 10)
      ) {
        latestVersion = element.version ? element.version : '1';
      }
    }
  });
  return latestVersion;
};

export const checkQuestionnaireNameExist = async (
  name: string
): Promise<any> => {
  const allQuestionnaire = await getQuestionnaire(true);
  let nameExist = false;
  allQuestionnaire.forEach((element) => {
    if (element.name === name) {
      nameExist = true;
    }
  });
  return nameExist;
};

export const getRandomize = async (
  questionnaireType: string,
  questionnaireVersion: string
) => {
  const questionnaire = await getQuestionnaireId(
    questionnaireType,
    questionnaireVersion
  );
  return questionnaire.randomize ? questionnaire.randomize : false;
};
