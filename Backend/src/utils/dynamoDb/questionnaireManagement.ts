import { CategoriesMap, Questionnaire } from '@models/index';
import { generate } from '@utils/common';
import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import uuidv1 from 'uuid/v1';
import { put, update } from './sdk';

export interface QuestionnaireCreate {
  benchmarkScore?: number;
  categories: string[];
  categoriesMap: CategoriesMap;
  createdBy?: string;
  description?: string;
  hideResult?: boolean;
  name: string;
  questionBankList?: string[];
  questions?: string[];
  randomization?: boolean;
  showRecommendations: boolean;
  timeOut?: boolean;
  timeOutTime?: number;
  version?: string;
  warningTimePercentage?: number;
}

export interface QuestionnaireUpdate {
  active: boolean;
  benchmarkScore?: number;
  categories: string[];
  categoriesMap: CategoriesMap;
  createdBy?: string;
  description?: string;
  hideResult?: boolean;
  modifiedBy?: string;
  modifiedOn?: number;
  name: string;
  publishedBy?: string;
  publishedOn?: number;
  questionBankList?: string[];
  questionnaireId: string;
  questions?: string[];
  randomization?: boolean;
  showRecommendations: boolean;
  timeOut?: boolean;
  timeOutTime?: number;
  version?: string;
  warningTimePercentage?: number;
}

export const createQuestionnaire = async (
  data: QuestionnaireCreate
): Promise<any> => {
  const newQuestionnaire: Questionnaire = {
    active: false,
    benchmarkScore: data.benchmarkScore,
    categories: data.categories,
    categoriesMap: data.categoriesMap,
    createdBy: data.createdBy,
    createdOn: Date.now(),
    description: data.description || 'default',
    hideResult: data.hideResult,
    name: data.name,
    questionnaireId: generate(4),
    questions: data.questions || [],
    randomize: data.randomization,
    showRecommendations: data.showRecommendations,
    timeOut: data.timeOut,
    timeOutTime: data.timeOutTime,
    version: '1',
    warningTimePercentage: data.warningTimePercentage,
  };
  // console.log(newQuestionnaire);
  const params: DynamoDB.PutItemInput = <DynamoDB.PutItemInput>(<unknown>{
    Item: newQuestionnaire,
    TableName: TableNames.getQuestionnairesTableName(),
  });

  appLogger.info({ createQuestionnaire_put_params: params });
  return put<DynamoDB.PutItemOutput>(params);
};

export const updateQuestionnaire = async (
  data: QuestionnaireUpdate
): Promise<any> => {
  let SET = 'SET ';
  const EAN: any = {};
  const EAV: any = {};
  Object.keys(data).forEach((val: any, i: number) => {
    if (
      val !== 'questionnaireId' &&
      val !== 'modifiedOn' &&
      val !== 'version'
    ) {
      EAN[`#${val}`] = val;
      EAV[`:${val}`] = data[val];
      SET =
        SET.length === 4
          ? SET + `#${val} = :${val}`
          : SET + `, #${val} = :${val}`;
    }
  });
  EAN[`#modifiedOn`] = 'modifiedOn';
  EAV[`:modifiedOn`] = Date.now();
  SET = SET + `, #modifiedOn = :modifiedOn`;

  const params: DynamoDB.UpdateItemInput = <DynamoDB.UpdateItemInput>(<unknown>{
    ExpressionAttributeNames: EAN,
    ExpressionAttributeValues: EAV,
    Key: {
      questionnaireId: data.questionnaireId,
      version: data.version,
    },
    TableName: TableNames.getQuestionnairesTableName(),
    UpdateExpression: SET,
  });
  appLogger.info({ updateQuestionnaire_update_params: params });
  return update(params);
};

export const archiveQuestionnaire = async (data: any): Promise<any> => {
  const item: any = data;
  item.archiveQuestionnaireId = item.questionnaireId;
  item.questionnaireId = `arch_${uuidv1()}`;
  item.archiveCreatedOn = Date.now();
  const params: DynamoDB.PutItemInput = <DynamoDB.PutItemInput>(<unknown>{
    Item: item,
    TableName: TableNames.getQuestionnairesTableName(),
  });

  appLogger.info({ archiveQuestionnaire_put_params: params });
  await put<DynamoDB.PutItemOutput>(params);
  return item.questionnaireId;
};
