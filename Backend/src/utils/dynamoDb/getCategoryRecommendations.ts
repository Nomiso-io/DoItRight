import { CategoriesMap, Questionnaire } from '@models/index';
import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import { getQuestionnaireId } from './getQuestionnaire';
import { get, scan } from './sdk';

//Fetch all Categories
export const getCategoryList = async (): Promise<any> => {
  const params = <DynamoDB.ScanInput>{
    Limit: Number.MAX_SAFE_INTEGER,
    TableName: 'Categories',
  };
  appLogger.info({ getCategoryList_scan_params: params });
  let categoryList = await scan<any>(params);
  categoryList = categoryList.sort((a: any, b: any) =>
    a.name.localeCompare(b.name)
  );
  return categoryList;
};

export const sortCategoriesMapByCategories = async (
  categoriesMap: CategoriesMap
): Promise<CategoriesMap> => {
  const sortedCategoriesMap: CategoriesMap = {};
  const keys = Object.keys(categoriesMap);
  //tslint:disable-next-line:strict-comparisons
  keys.sort((a, b) => (categoriesMap[a] > categoriesMap[b] ? 1 : -1));
  keys.forEach((el: string) => (sortedCategoriesMap[el] = categoriesMap[el]));
  return sortedCategoriesMap;
};

// FETCH category list for a questionnaire from the questionnaire
export const getCategoryListFromQuestionnaire = async (
  quesType: string,
  version: string
): Promise<any> => {
  const questionnaire: Questionnaire = await getQuestionnaireId(
    quesType,
    version
  );
  let { categoriesMap, questions } = questionnaire;
  const numberOfQuestions = Object.keys(questions).length;
  const categoryList = {};

  if (
    categoriesMap &&
    Object.keys(categoriesMap).length === numberOfQuestions
  ) {
    // We are using questions here to maintain the order of the questions
    categoriesMap = await sortCategoriesMapByCategories(categoriesMap);
    questions = Object.keys(categoriesMap);
    questions.forEach((el: string) => {
      if (categoriesMap && categoriesMap[el]) {
        if (categoryList[categoriesMap[el]]) {
          categoryList[categoriesMap[el]] += 1;
        } else {
          categoryList[categoriesMap[el]] = 1;
        }
      }
    });
  } else {
    // categoryList = await getCategoryListFromQuestions(quesType, version);
  }
  return categoryList;
};

//get Description of a questionnairre
export const getDescription = async (
  quesType: string,
  version: string
): Promise<string> => {
  const params: DynamoDB.GetItemInput = <DynamoDB.GetItemInput>(<unknown>{
    Key: {
      questionnaireId: quesType,
      version,
    },
    TableName: TableNames.getQuestionnairesTableName(),
  });
  appLogger.info({ getDescription_get_params: params });
  return get<Questionnaire>(params).then((item) =>
    item.description ? item.description : 'false'
  );
};

// Gets the category of the question from the questionnaire
export const getQuestionCategoryFromQuestionnaire = async (
  questionId: string,
  quesType: string,
  version?: string
): Promise<string> => {
  const questionnaire: Questionnaire = await getQuestionnaireId(
    quesType,
    version ? version : '1'
  );

  if (questionnaire.categoriesMap) {
    return questionnaire.categoriesMap[questionId]
      ? questionnaire.categoriesMap[questionId]
      : '';
  }
  return '';
};
