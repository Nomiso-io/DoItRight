import { TeamInfo } from '@models/index';
import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger, getUserTeams } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import { scan } from './sdk';

export const getTeams2 = async (userId: string): Promise<TeamInfo[]> => {
  let params: DynamoDB.ScanInput = <DynamoDB.ScanInput>{
    TableName: TableNames.getTeamTableName(),
  };

  if (userId !== 'admin') {
    const teamIds: string[] = [];
    const userTeams = await getUserTeams(userId);
    userTeams.forEach((userTeam) => {
      if (!teamIds.includes(userTeam.name)) {
        teamIds.push(userTeam.name);
      }
    });
    appLogger.info({ getTeams2: { userId, teamIds } });

    params = <DynamoDB.ScanInput>{
      ScanFilter: {
        teamId: {
          AttributeValueList: teamIds,
          ComparisonOperator: 'IN',
        },
      },
      TableName: TableNames.getTeamTableName(),
    };
  }
  appLogger.info({ getTeams2_scan_params: params });
  return scan<TeamInfo[]>(params);
};

export const getTeamIds = async (userId: string): Promise<any> => {
  if (userId === 'admin') {
    const params: DynamoDB.ScanInput = <DynamoDB.ScanInput>{
      TableName: TableNames.getTeamTableName(),
    };

    appLogger.info({ getTeamIds_scan_params: params });
    return scan<string[]>(params).then((teams: any) =>
      teams.map((team: any) => team.teamId)
    );
  }

    const teamIds: string[] = [];
    const userTeams = await getUserTeams(userId);
    userTeams.forEach((userTeam) => {
      if (!teamIds.includes(userTeam.name)) {
        teamIds.push(userTeam.name);
      }
    });
    appLogger.info({ getTeamIds: { userId, teamIds } });
/*
    params = <DynamoDB.ScanInput>{
      ScanFilter: {
        teamId: {
          AttributeValueList: teamIds,
          ComparisonOperator: 'IN',
        },
      },
      TableName: TableNames.getTeamTableName(),
    };
*/
    return teamIds;
};

export const getTeamIdsByQuestionnaire = async (
  questionnaireId: string
): Promise<any> => {
  let params: DynamoDB.ScanInput;
  params = <DynamoDB.ScanInput>{
    ExpressionAttributeNames: {
      '#questionnaireId': 'questionnaireId',
    },
    ExpressionAttributeValues: {
      ':questionnaireId': questionnaireId,
    },
    FilterExpression: 'contains (#questionnaireId, :questionnaireId)',
    TableName: TableNames.getTeamTableName(),
  };

  appLogger.info({ getTeamListByQuestionnaire_scan_params: params });
  return scan<string[]>(params).then((teams: any) =>
    teams.map((teamDetails: any) => teamDetails.teamId)
  );
};
