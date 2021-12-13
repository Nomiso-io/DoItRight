import { UserDocument } from '@models/index';
import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import { scan } from './sdk';

export interface TeamMembers {
  createdOn?: number;
  emailId: string;
  orgId?: string;
  roles?: string[];
  teams: any;
}

export const getTeamMembers = (teamId: string): Promise<string[]> => {
  if (!teamId) {
    const err = new Error('Invalid user or User does not belong to a team');
    appLogger.error(err);
    throw err;
  }

  const params = <DynamoDB.ScanInput>{
    ExpressionAttributeNames: {
      '#teams': 'teams',
    },
    ExpressionAttributeValues: {
      ':team': {
        isLead: false,
        name: teamId,
      },
    },
    FilterExpression: 'contains (#teams, :team)',
    TableName: TableNames.getCognitoUsersTableName(),
  };

  appLogger.info({ getTeamMembers_scan_params: params });
  return scan<UserDocument[]>(params).then((userDocuments: UserDocument[]) =>
    userDocuments.map((userDocument) => {
      appLogger.info({ userDocument });
      return userDocument.emailId;
    })
  );
};

export const getTeamMembersDetails2 = (
  teamId: string
): Promise<UserDocument[]> => {
  if (!teamId) {
    const err = new Error('Invalid user or User does not belong to a team');
    appLogger.error(err);
    throw err;
  }

  const params = <DynamoDB.ScanInput>{
    ExpressionAttributeNames: {
      '#teams': 'teams',
    },
    ExpressionAttributeValues: {
      ':team': {
        isLead: false,
        name: teamId,
      },
    },
    FilterExpression: 'contains (#teams, :team)',
    TableName: TableNames.getCognitoUsersTableName(),
  };

  appLogger.info({ getTeamMembers_get_params: params });
  return scan<UserDocument[]>(params);
};

//Get NON Manager Team Members ONLY NOT TO BE USED
export const getTeamMembersDetails = (
  teamId: string
): Promise<TeamMembers[]> => {
  if (!teamId) {
    const err = new Error('Invalid user or User does not belong to a team');
    appLogger.error(err);
    throw err;
  }

  const params = <DynamoDB.ScanInput>{
    ExpressionAttributeNames: {
      '#active': 'active',
      '#teams': 'teams',
    },
    ExpressionAttributeValues: {
      ':active': false,
      ':team': {
        isLead: false,
        name: teamId,
      },
    },
    FilterExpression: 'contains (#teams, :team) AND #active <> :active',
    TableName: TableNames.getCognitoUsersTableName(),
  };

  appLogger.info({ getTeamMembersDetails_scan_params: params });
  return scan<UserDocument[]>(params).then((userDocuments: UserDocument[]) =>
    userDocuments.map((userDocument) => {
      const teamMembers: TeamMembers = {
        createdOn: userDocument.createdOn,
        emailId: userDocument.emailId,
        orgId: userDocument.orgId,
        roles: userDocument.roles,
        teams: userDocument.teams.map((team: any) => team.name),
      };
      return teamMembers;
    })
  );
};
