import { Question, Questionnaire } from '@models/index';
import * as TableNames from '@utils/dynamoDb/getTableNames';
import {
  appLogger,
  getQuestionIds,
  getQuestionnaire,
  getQuestionsList,
} from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import uuidv1 from 'uuid/v1';
import { get, putMulti, scan, update } from './sdk';

export const getQuestionDetails = async (
  questionId: string,
  version?: number
): Promise<Question> => {
  if (!questionId) {
    const err = new Error('Missing questionId');
    appLogger.error(err);
    throw err;
  }

  const params: DynamoDB.GetItemInput = <DynamoDB.GetItemInput>(<unknown>{
    Key: {
      id: questionId,
      version: version ? version : 0,
    },
    TableName: TableNames.getQuestionsTableName(),
  });

  appLogger.info({ getQuestionDetails_get_params: params });
  return get<Question>(params).then((ques: Question) => {
    ques.version =
      ques.version === 0
        ? ques.lastVersion
          ? ques.lastVersion
          : 1
        : ques.version;
    return ques;
  });
};

export const getAllQuestions = async (): Promise<any> => {
  const params = <DynamoDB.ScanInput>{
    ExpressionAttributeNames: {
      '#version': 'version',
    },
    ExpressionAttributeValues: {
      ':version': 0,
    },
    FilterExpression: '#version = :version',
    TableName: TableNames.getQuestionsTableName(),
  };

  appLogger.info({ getAllQuestions_scan_params: params });
  return scan<Question[]>(params).then((questions: any) =>
    questions.map((ques: Question) => {
      ques.version =
        ques.version === 0
          ? ques.lastVersion
            ? ques.lastVersion
            : 1
          : ques.version;
      return ques;
    })
  );
};

export const getAllQuestionsAllVersions = async (): Promise<any> => {
  const params = <DynamoDB.ScanInput>{
    TableName: TableNames.getQuestionsTableName(),
  };

  appLogger.info({ getAllQuestionsAllVersions_scan_params: params });
  return scan<Question[]>(params);
};

export const getQuestionsForQuestionnaire = async (
  questionnaireId: string
): Promise<any> => {
  if (questionnaireId === '0000') {
    return getUnmappedQuestions();
  }
  const questions: Question[] = [];
  const res = await getQuestionsList({
    quesType: questionnaireId,
  });
  appLogger.info({ getQuestionsList: res });
  for (const val of res) {
    const ques: Question = await getQuestionDetails(val);
    appLogger.info({ getQuestionDetails: ques });
    questions.push(ques);
  }
  return questions;
};

const getUnmappedQuestions = async (): Promise<any> => {
  const unMappedQuestions: Question[] = [];
  const allQuestions: Question[] = await getAllQuestions();
  appLogger.info({ getAllQuestions: allQuestions });

  const allQuestionnaires: Questionnaire[] = await getQuestionnaire(true);
  appLogger.info({ getQuestionnaire: allQuestionnaires });

  let allUsedQuestionIds: string[] = [];
  for (const questionnaire of allQuestionnaires) {
    const qIds = await getQuestionIds(
      questionnaire.questionnaireId,
      questionnaire.version
    );
    allUsedQuestionIds = allUsedQuestionIds.concat(qIds);
  }
  appLogger.info({ allUsedQuestionIds });

  for (const question of allQuestions) {
    if (!allUsedQuestionIds.includes(question.id)) {
      unMappedQuestions.push(question);
    }
  }

  return unMappedQuestions;
};

const putQuestion = async (
  questionData: Question,
  version: number
): Promise<any> => {
  questionData.lastVersion = version;

  const tableName: string = TableNames.getQuestionsTableName();
  const reqItems: any = {};
  reqItems[tableName] = [];
  reqItems[tableName].push({
    PutRequest: { Item: { ...questionData, version: 0 } },
  });
  reqItems[tableName].push({
    PutRequest: { Item: { ...questionData, version } },
  });
  const params: DynamoDB.BatchWriteItemInput = <DynamoDB.BatchWriteItemInput>(<
    unknown
  >{
    RequestItems: reqItems,
  });

  appLogger.info({ updateQuestion_put_params: params });
  return putMulti<DynamoDB.BatchWriteItemInput>(params);
};

export const createQuestion = async (
  questionData: Question,
  createdBy: string
): Promise<any> => {
  if (!createdBy) {
    const err = new Error('Unauthorized attempt');
    appLogger.error(err);
    throw err;
  }

  questionData.id = `ques_${uuidv1()}`;
  questionData.active = false;
  questionData.createdByUser = createdBy;
  questionData.createdOn = new Date().getTime();
  questionData.modifiedBy = createdBy;
  questionData.lastModifiedOn = new Date().getTime();

  return putQuestion(questionData, 1);
};

export const updateQuestion = async (
  questionData: Question,
  modifiedBy: string
): Promise<any> => {
  if (!modifiedBy) {
    const err = new Error('Unauthorized attempt');
    appLogger.error(err);
    throw err;
  }

  const oldQuestion: Question = await getQuestionDetails(questionData.id);
  appLogger.info({ updateQuestion_previousversion: oldQuestion });

  questionData.createdByUser = oldQuestion.createdByUser;
  questionData.createdOn = oldQuestion.createdOn;
  questionData.modifiedBy = modifiedBy;
  questionData.lastModifiedOn = new Date().getTime();

  let version = 1;
  if (oldQuestion.active) {
    version = oldQuestion.lastVersion + 1;
    questionData.active = true;
  }

  return putQuestion(questionData, version);
};

export const publishQuestion = async (questionId: string): Promise<any> => {
  const params: DynamoDB.UpdateItemInput = <DynamoDB.UpdateItemInput>(<unknown>{
    ExpressionAttributeNames: { '#active': 'active' },
    ExpressionAttributeValues: { ':active': true },
    Key: {
      id: questionId,
      version: 0,
    },
    TableName: TableNames.getQuestionsTableName(),
    UpdateExpression: `SET #active = :active`,
    // ConditionExpression: 'attribute_not_exists(userId) AND attribute_not_exists(assessmentId)',
  });
  appLogger.info({ updateQuestionnaire_update_params: params });
  return update(params);
};

const keywordQualifier = (word: string) => {
  const fourLetteredKeywords = ['test'];
  const fiveLetterCommonWords = ['which', 'where'];
  if (word.length < 5 && !fourLetteredKeywords.includes(word.toLowerCase())) {
    return false;
  }
  if (fiveLetterCommonWords.includes(word)) {
    return false;
  }
  return true;
};

const getKeywords = (text: string): string[] => {
  const allWords = text.split(/[ ,?]+/);
  const filteredKeywords = allWords.filter(keywordQualifier);
  return filteredKeywords;
};

export const getQuestionsContainingTheFirstKeyword = async (
  keyword: string
): Promise<any> => {
  const params = <DynamoDB.ScanInput>{
    ExpressionAttributeNames: {
      '#question': 'question',
    },
    ExpressionAttributeValues: {
      ':keyword': keyword.toLowerCase(),
    },
    FilterExpression: 'contains (#question, :keyword)',
    TableName: TableNames.getQuestionsTableName(),
  };

  appLogger.info({ getQuestionsContainingTheFirstKeyword_scan_params: params });
  return scan<Question[]>(params).then((questions: any) =>
    questions.map((ques: Question) => {
      ques.version =
        ques.version === 0
          ? ques.lastVersion
            ? ques.lastVersion
            : 1
          : ques.version;
      return ques;
    })
  );
};

const filterQuestions = (
  searchQuestions: Question[],
  keyword: string,
  keywords: string[]
) => {
  const filteredQuestions: Question[] = [];
  for (const question of searchQuestions) {
    for (const key of keywords) {
      if (key !== keyword) {
        if (question.question.includes(key)) {
          filteredQuestions.push(question);
        }
      }
    }
  }
  return filteredQuestions;
};

const removeDuplicateQuestions = (questions: Question[]) => {
  const noDuplicates: { [question: string]: Question } = {};
  for (const question of questions) {
    if (!Object.keys(noDuplicates).includes(question.question)) {
      noDuplicates[question.question] = question;
    }
  }
  return Object.values(noDuplicates);
};

export const getSimilarQuestionSearchResults = async (
  questionText: string
): Promise<Question[]> => {
  const keywords: string[] = getKeywords(questionText);
  let searchedQuestions: Question[] = [];
  for (const keyword of keywords) {
    const searchedResults =
      keywords.length > 0
        ? await getQuestionsContainingTheFirstKeyword(keyword)
        : [];
    let searchedResultsNoDuplicates: Question[] = [];
    if (searchedResults.length > 0) {
      searchedResultsNoDuplicates = removeDuplicateQuestions(searchedResults);
    } else {
      continue;
    }
    if (keywords.length > 1) {
      const filteredResults = filterQuestions(
        searchedResultsNoDuplicates,
        keyword,
        keywords
      );
      if (filteredResults.length > searchedQuestions.length) {
        searchedQuestions = filteredResults;
      }
    } else {
      searchedQuestions = searchedResultsNoDuplicates;
    }
  }
  if (searchedQuestions.length > 5) {
    return searchedQuestions.splice(0, 5);
  }
  return searchedQuestions;
};
