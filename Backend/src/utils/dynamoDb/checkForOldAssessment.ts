import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger, getArchiveTime } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import { AssessmentDocument } from './createNewAssessmentDocument';

import { scan } from './sdk';

function getUserTypeParams(userId: string): DynamoDB.ScanInput {
  if (!userId) {
    const err = new Error('userId missing');
    appLogger.error(err);
    throw err;
  }

  return <DynamoDB.ScanInput>{
    Limit: Number.MAX_SAFE_INTEGER,
    ScanFilter: {
      userId: {
        AttributeValueList: [userId],
        ComparisonOperator: 'EQ',
      },
    },
    TableName: TableNames.getAssessmentsTableName(),
  };
}

async function getTeamTypeParams(teamMembers: string[] | undefined): Promise<DynamoDB.ScanInput> {
  if (!teamMembers) {
    const err = new Error('teamMembers missing');
    appLogger.error(err);
    throw err;
  }

  const archiveTime: number = await getArchiveTime();
  if(archiveTime > 0) {
    return <DynamoDB.ScanInput>{
      Limit: Number.MAX_SAFE_INTEGER,
      ScanFilter: {
        date: {
          AttributeValueList: [archiveTime],
          ComparisonOperator: 'GE',
        },
        result: {
          ComparisonOperator: 'NOT_NULL',
        },
        userId: {
          AttributeValueList: teamMembers,
          ComparisonOperator: 'IN',
        },
      },
      TableName: TableNames.getAssessmentsTableName(),
    };
  }
  return <DynamoDB.ScanInput>{
    Limit: Number.MAX_SAFE_INTEGER,
    ScanFilter: {
      result: {
        ComparisonOperator: 'NOT_NULL',
      },
      userId: {
        AttributeValueList: teamMembers,
        ComparisonOperator: 'IN',
      },
    },
    TableName: TableNames.getAssessmentsTableName(),
  };
}

const getAssessmentHistory = async ({
  userId,
  type,
  teamMembers,
}: {
  teamMembers?: string[];
  type: string;
  userId: string;
}): Promise<any> => {
  if (!type) {
    const err = new Error('type missing');
    appLogger.error(err);
    throw err;
  }

  let params: DynamoDB.ScanInput;

  switch (type) {
    case 'user':
      params = getUserTypeParams(userId);
      break;
    case 'manager':
      // params = await getManagerTypeParams();
      params = await getTeamTypeParams(teamMembers);
      break;
    case 'team':
      params = await getTeamTypeParams(teamMembers);
      break;
    default:
      throw new Error('Invalid type');
  }

  appLogger.info({ getAssessmentHistory_scan_params: params });
  return scan<AssessmentDocument[]>(params);
};

//TODO: CHECK for an incomplete/pending assessment for a partcular questionnaire
export const checkForOldAssessment = async ({
  userId,
  type,
  teamMembers,
  quesType,
  team,
}: {
  quesType?: string;
  team: string;
  teamMembers?: string[];
  type: string;
  userId: string;
}): Promise<any> => {
  if (!type) {
    const err = new Error('type missing');
    appLogger.error(err);
    throw err;
  }
  const assessments = await getAssessmentHistory({ userId, type });
  appLogger.info({ getAssessmentHistory: assessments });
  for (const a of assessments) {
    //tslint:disable-next-line:strict-comparisons
    if (
      !a.result && quesType &&
      Object.keys(a.assessmentDetails).length >= 0 &&
      a.type === quesType &&
      team === a.team
    ) {
      return a;
    }
  }
  return false;
};
