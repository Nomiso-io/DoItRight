import { getQuestionnaire, getResultLevels } from '@utils/dynamoDb';
import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import { get, /*put,*/ scan, update } from './sdk';

interface AssignmentsQuestionnaireDetails {
  displayName: string;
  questionnaireId: string;
  version: string;
}

export interface Assigning {
  assignmentId: string;
  createdBy: string;
  createdOn: number;
  displayName: string;
  endDte?: number;
  questionnaireId: string;
  status?: string;
  teamId: string;
  type?: string;
}

export interface QuestionnaireAssignment {
  createdOn: number;
  creator: string;
  endDte?: number;
  order?: string[];
  questionnaireId: string;
  status: string;
  teams: string[];
  type: string;
}

// ADD assigned questionnaires to a team
export const createAssignment = async (userId: string, data: any) => {
  const params: DynamoDB.UpdateItemInput = <DynamoDB.UpdateItemInput>(<unknown>{
    //ConditionExpression: 'attribute_exists(emailId)',
    ExpressionAttributeNames: {
      '#questionnaires': 'questionnaireId',
    },
    ExpressionAttributeValues: {
      ':questionnaireId': data.questionnaireId,
    },
    Key: {
      teamId: data.teamId[0],
    },
    TableName: TableNames.getTeamTableName(),
    UpdateExpression: 'SET #questionnaires = :questionnaireId',
  });

  appLogger.info({ createAssignment_update_params: params });
  return update(params);
};

export const getAssignments = async (
  teamId: string,
  allVersions?: boolean
): Promise<any> => {
  const questionnaires: AssignmentsQuestionnaireDetails[] = (
    await getQuestionnaire()
  ).map((aQuestionnaire: any) => ({
      displayName: aQuestionnaire.name,
      questionnaireId: aQuestionnaire.questionnaireId,
      version: aQuestionnaire.version,
    })
  );
  appLogger.info({ getQuestionnaire: questionnaires });
  let questionnaireFiltered: AssignmentsQuestionnaireDetails[] = [];
  // This condition is to provide all the questionnaire versions.
  if (allVersions) {
    questionnaireFiltered = questionnaires;
  } else {
    for (const questionnaire of questionnaires) {
      let itemExist = false;
      questionnaireFiltered.forEach((el: any, i: number) => {
        if (el.questionnaireId === questionnaire.questionnaireId) {
          itemExist = true;
          if (
            parseInt(questionnaireFiltered[i].version, 10) <
            parseInt(questionnaire.version, 10)
          ) {
            questionnaireFiltered[i].version = questionnaire.version;
          }
        }
      });
      if (!itemExist) {
        questionnaireFiltered.push(questionnaire);
      }
    }
  }
  const userLevels = await getResultLevels();
  appLogger.info({ getResultConfig: userLevels });
  if (teamId === 'admin') {
    const questionnaireSelected: string[] = questionnaireFiltered.map(
      (item: any) => item.questionnaireId
    );
    return {
      questionnaireSelected,
      questionnaires: questionnaireFiltered,
      teamId,
      userLevels,
    };
  }
  const params: DynamoDB.GetItemInput = <DynamoDB.GetItemInput>(<unknown>{
    Key: {
      teamId,
    },
    TableName: TableNames.getTeamTableName(),
  });

  appLogger.info({ getAssignments_get_params: params });
  return get<any>(params).then((res: any) => ({
    questionnaireSelected: res.questionnaireId ? res.questionnaireId : [],
    questionnaires: questionnaireFiltered,
    teamId,
    userLevels,
  }));
};

export const getAssessments = async (teamId: string): Promise<any> => {
  const questionnaires: AssignmentsQuestionnaireDetails[] = (
    await getQuestionnaire()
  ).map((questionnaireList: any) => {
    appLogger.info({ getQuestionnaire: questionnaireList });
    return {
      displayName: questionnaireList.name,
      questionnaireId: questionnaireList.questionnaireId,
      version: questionnaireList.version,
    };
  });

  let questionnaireFiltered: AssignmentsQuestionnaireDetails[] = [];

  questionnaireFiltered = questionnaires;

  const userLevels = await getResultLevels();
  appLogger.info({ getResultConfig: userLevels });
  if (teamId === 'Admin' || teamId === 'Manager') {
    const questionnaireSelected: string[] = questionnaireFiltered.map(
      (map: any) => map.questionnaireId
    );

    return {
      questionnaireSelected,
      questionnaires: questionnaireFiltered,
      teamId,
      userLevels,
    };
  }
  const params: DynamoDB.GetItemInput = <DynamoDB.GetItemInput>(<unknown>{
    Key: {
      teamId,
    },
    TableName: TableNames.getTeamTableName(),
  });

  appLogger.info({ getAssignments_get_params: params });
  return get<any>(params).then((res: any) => ({
    questionnaireSelected: res.questionnaireId ? res.questionnaireId : [],
    questionnaires: questionnaireFiltered,
    teamId,
    userLevels,
  }));
};

/*
export const getQuestionnairesAssignedPrev = async (
  teamId: string
): Promise<any> => {
  const params: DynamoDB.ScanInput = <DynamoDB.ScanInput>{
    ExpressionAttributeNames: {
      '#team': 'teamId',
    },
    ExpressionAttributeValues: { ':team': teamId },
    FilterExpression: '#team = :team',
    TableName: 'Assignments-dev',
  };

  appLogger.info({ getQuestionnairesAssignedPrev_scan_params: params });
  return scan<any>(params).then((res: any) =>
    res.map((assignments: any) => assignments.questionnaireId)
  );
};
*/

export const getQuestionnairesAssigned = async (
  teamId: string
): Promise<any> => {
  const params: DynamoDB.GetItemInput = <DynamoDB.GetItemInput>(<unknown>{
    Key: {
      teamId,
    },
    TableName: TableNames.getTeamTableName(),
  });

  appLogger.info({ getQuestionnairesAssigned_get_params: params });
  return get<any>(params).then((res: any) =>
    res.questionnaireId ? res.questionnaireId : []
  );
};

export const getQuestionnaireSelected = async (
  teamId: string
): Promise<any> => {
  const params: DynamoDB.ScanInput = <DynamoDB.ScanInput>{
    ExpressionAttributeNames: {
      '#team': 'teamId',
    },
    ExpressionAttributeValues: { ':team': teamId },
    FilterExpression: '#team = :team',
    TableName: TableNames.getAssessmentsTableName(),
  };

  appLogger.info({ getQuestionnaireSelected_scan_params: params });
  return scan<any>(params);
};

/*
export const getTeamsMappedToQuestionnaire = async (
  questionnaireId: string
): Promise<any> => {
  const params: DynamoDB.GetItemInput = <DynamoDB.GetItemInput>(<unknown>{
    ExpressionAttributeNames: {
      '#questionnaire': 'questionnaireId',
    },
    ExpressionAttributeValues: { ':questionnaire': questionnaireId },
    FilterExpression: 'contains(#questionnaire, :questionnaire)',
    TableName: TableNames.getTeamTableName(),
  });
  appLogger.info({ getTeamsMappedToQuestionnaire_get_params: params });
  return scan<any>(params).then((res: any) =>
    res.map((team: any) => team.teamId)
  );
};
*/
