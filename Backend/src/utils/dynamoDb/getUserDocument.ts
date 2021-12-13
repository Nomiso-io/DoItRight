import { AllotedTeam, CreateUserConfig, UserDocument } from '@models/index';
import { config } from '@root/config';
import * as TableNames from '@utils/dynamoDb/getTableNames';
import { appLogger, getUserConfig } from '@utils/index';
import { DynamoDB } from 'aws-sdk';
import { getTeams2 } from './getTeams';
import { get, put, scan, update } from './sdk';

const regex = /Other:[a-zA-Z0-9!-*]/g;

// GET user CognitoUsers from unique cognitoUserId
export const getUserDocument = async ({
  cognitoUserId,
}: {
  cognitoUserId: string;
}): Promise<UserDocument> => {
  if (!cognitoUserId) {
    const err = new Error('cognitoUserId missing');
    appLogger.error(err);
    throw err;
  }
  const params: DynamoDB.GetItemInput = <DynamoDB.GetItemInput>(<unknown>{
    Key: {
      id: cognitoUserId,
    },
    TableName: TableNames.getCognitoUsersTableName(),
  });

  appLogger.info({ getUserDocument_get_params: params });
  return get<UserDocument>(params);
};

//Get User orgId
export const getUserOrgId = async (userId: string): Promise<string> => {
  const params: DynamoDB.GetItemInput = <DynamoDB.GetItemInput>(<unknown>{
    Key: {
      id: userId,
    },
    TableName: TableNames.getCognitoUsersTableName(),
  });
  appLogger.info({ getUserOrgId_get_params: params });
  return get<UserDocument>(params).then((res) =>
    res.orgId ? res.orgId : config.defaults.orgId
  );
};

//Add a user to CognitoUser table
export const addDynamoUser = async (
  id: string,
  managerDetails: UserDocument,
  userDetails: any
): Promise<any> => {
  if (!managerDetails) {
    const err = new Error('Unauthorized attempt');
    appLogger.error(err);
    throw err;
  }
  const myTeams = (teams: string[]) => {
    const arr: AllotedTeam[] = new Array();
    userDetails.teams.forEach((teamId: string) => {
      const teamStruct: AllotedTeam = {
        isLead: false,
        name: teamId,
      };
      arr.push(teamStruct);
    });
    return arr;
  };
  const item: UserDocument = {
    active: true,
    createdBy: managerDetails.emailId,
    createdOn: new Date().getTime(),
    emailId: userDetails.emailId,
    emailVerified: 'true',
    id,
    orgId: managerDetails.orgId || config.defaults.orgId,
    roles: userDetails.roles,
    teams: myTeams(userDetails.teams),
  };

  Object.keys(userDetails).forEach((val, i) => {
    if (
      !(
        val === 'id' ||
        val === 'modifiedBy' ||
        val === 'modifiedOn' ||
        val === 'active' ||
        val === 'createdBy' ||
        val === 'createdOn' ||
        val === 'emailId' ||
        val === 'emailVerified' ||
        val === 'orgId' ||
        val === 'roles' ||
        val === 'teams'
      )
    ) {
      if (userDetails[val].length > 0 && typeof userDetails[val] === 'object') {
        item[val] = new Array();
        userDetails[val].forEach((ele: string, j: number) => {
          if (ele.match(regex)) {
            item[val].push(ele.split('Other:')[1]);
            // updateTeamConfig(teamData.orgId, item[val][j]);
          } else {
            item[val].push(ele);
          }
        });
      } else {
        item[val] = userDetails[val];
      }
    }
  });

  const params: DynamoDB.PutItemInput = <DynamoDB.PutItemInput>(<unknown>{
    ConditionExpression:
      'attribute_not_exists(emailId) AND #emailId <> :emailId',
    ExpressionAttributeNames: {
      '#emailId': 'emailId',
    },
    ExpressionAttributeValues: {
      ':emailId': item.emailId,
    },
    Item: item,
    TableName: TableNames.getCognitoUsersTableName(),
  });

  appLogger.info({ addDynamoUser_put_params: params });
  return put<DynamoDB.PutItemOutput>(params);
};
// UPDATE a user in CognitoUsers table
export const updateDynamoUser = async (
  id: string,
  managerDetails: UserDocument,
  userDetails: any
): Promise<any> => {
  if (!managerDetails) {
    const err = new Error('Unauthorized attempt');
    appLogger.error(err);
    throw err;
  }
  delete userDetails.emailId;
  delete userDetails.emailVerified;
  const EAN: any = {};
  const EAV: any = {};
  let SET = 'SET ';

  const myTeams = (teams: string[]) => {
    const arr: AllotedTeam[] = new Array();
    userDetails.teams.forEach((teamId: string) => {
      const teamStruct: AllotedTeam = {
        isLead: false,
        name: teamId,
      };
      arr.push(teamStruct);
    });
    return arr;
  };

  EAN['#modifiedBy'] = 'modifiedBy';
  EAV[':modifiedBy'] = managerDetails.emailId;
  EAN['#modifiedOn'] = 'modifiedOn';
  EAV[':modifiedOn'] = new Date().getTime();
  EAN['#teams'] = 'teams';
  EAV[':teams'] = myTeams(userDetails.teams);
  SET += `#modifiedBy = :modifiedBy, #modifiedOn = :modifiedOn, #teams = :teams`;
  Object.keys(userDetails).forEach((val, i) => {
    if (
      !(
        val === 'id' ||
        val === 'modifiedBy' ||
        val === 'modifiedOn' ||
        val === 'createdBy' ||
        val === 'createdOn' ||
        val === 'emailId' ||
        val === 'emailVerified' ||
        val === 'orgId' ||
        val === 'teams'
      )
    ) {
      if (userDetails[val].length > 0 && typeof userDetails[val] === 'object') {
        const item = new Array();
        userDetails[val].forEach((ele: string, j: number) => {
          if (ele.match(regex)) {
            item.push(ele.split('Other:')[1]);
            // updateUserConfig(userDetails.orgId, item[val][j]);
          } else {
            item.push(ele);
          }
        });
        EAN[`#${val}`] = val;
        EAV[`:${val}`] = item;
        SET = SET + `, #${val} = :${val}`;
      } else {
        EAN[`#${val}`] = val;
        EAV[`:${val}`] = userDetails[val];
        SET = SET + `, #${val} = :${val}`;
      }
    }
  });

  const params: DynamoDB.UpdateItemInput = <DynamoDB.UpdateItemInput>(<unknown>{
    ExpressionAttributeNames: EAN,
    ExpressionAttributeValues: EAV,
    Key: {
      id,
    },
    TableName: TableNames.getCognitoUsersTableName(),
    UpdateExpression: SET,
  });

  appLogger.info({ updateDynamoUser_update_params: params });
  return update(params);
};

// SCAN for a user based on email ID.
export const getUserDocumentFromEmail = async (
  emailId: string
): Promise<UserDocument[]> => {
  const params = <DynamoDB.ScanInput>{
    ExpressionAttributeNames: {
      '#emailId': 'emailId',
    },
    ExpressionAttributeValues: {
      ':emailId': emailId,
    },
    FilterExpression: '#emailId = :emailId',
    TableName: TableNames.getCognitoUsersTableName(),
  };
  appLogger.info({ getUserDocumentFromEmail_scan_params: params });
  return scan<UserDocument[]>(params);
};

//Fetch all Mangers in the environment
export const fetchManagers = async (): Promise<string[]> => {
  const params = <DynamoDB.ScanInput>{
    ExpressionAttributeNames: {
      '#roles': 'roles',
    },
    ExpressionAttributeValues: {
      ':manager': 'Manager',
    },
    FilterExpression: 'contains(#roles, :manager)',
    TableName: TableNames.getCognitoUsersTableName(),
  };

  appLogger.info({ fetchManagers_scan_params: params });
  return scan<UserDocument[]>(params).then((userDocs) => {
    const userList = userDocs.map((user: any) => user.emailId);
    userList.sort();
    appLogger.info({ userList });
    return userList;
  });
};

// Fetch UserConfig from configs and fills data into options
export const getCreateUserConfig = async (
  orgId: string,
  order: string
): Promise<CreateUserConfig> => {
  const userConfig = await getUserConfig(orgId);
  appLogger.info({ getUserConfig: userConfig });

  const configDetails = {};
  Object.keys(userConfig.config).forEach((val: any) => {
    configDetails[val] = {};
    configDetails[val].displayName = userConfig.config[val].displayName;
    configDetails[val].Mandatory = userConfig.config[val].mandatory;
    configDetails[val].type = userConfig.config[val].type;
    if (userConfig.config[val].options) {
      configDetails[val].options = [];
      if (
        userConfig.config[val].options.custom &&
        userConfig.config[val].options.custom !== ''
      ) {
        configDetails[val].options = userConfig.config[val].options.custom
          .split(',')
          .map((item: string) => item.trim());
      } else if (
        userConfig.config[val].options.customFixed &&
        userConfig.config[val].options.customFixed !== ''
      ) {
        configDetails[val].options = userConfig.config[val].options.customFixed
          .split(',')
          .map((item: string) => item.trim());
      }
    }
  });

  const createUserConfig: CreateUserConfig = { config: configDetails, orgId };
  appLogger.info({ createUserConfig_before: createUserConfig });
  const teamList: any = await getTeams2(order).then((teams: any) =>
    teams
      .filter((filteredTeams: any) => filteredTeams.active === 'true')
      .map((team: any) => team.teamId)
  );
  appLogger.info({ getTeams2: teamList });
  createUserConfig.config.teams.options = teamList;
  appLogger.info({ createUserConfig_after: createUserConfig });
  return createUserConfig;
};

// soft DELETE user from COgnitoUsers, switching off 'active' flag
export const deactivateDynamoUser = async (id: string): Promise<any> => {
  const params: DynamoDB.UpdateItemInput = <DynamoDB.UpdateItemInput>(<unknown>{
    //ConditionExpression: 'attribute_exists(emailId)',
    ExpressionAttributeNames: {
      '#active': 'active',
    },
    ExpressionAttributeValues: {
      ':active': false,
    },
    Key: {
      id,
    },
    TableName: TableNames.getCognitoUsersTableName(),
    UpdateExpression: 'SET #active = :active',
  });
  appLogger.info({ deactivateDynamoUser_update_params: params });
  return update(params);
  // return put<DynamoDB.PutItemOutput>(params);
};

export const getUserTeams = async (userId: string): Promise<AllotedTeam[]> => {
  const userDocument = await getUserDocumentFromEmail(userId);
  return userDocument.length > 0
    ? userDocument[0].teams
      ? userDocument[0].teams
      : []
    : [];
};

// Changes, for copy created on date from cognito user data to dynamo db user data, start here
// This function belongs to copy create date script.
export const updateDynamoUserFromCognitoUser = async (
  userDetails: UserDocument,
  roles?: string[]
): Promise<any> => {
  const item: any = {
    createdOn: userDetails.createdOn,
    modifiedOn: userDetails.modifiedOn,
    roles: userDetails.roles,
  };
  let params: DynamoDB.UpdateItemInput = <DynamoDB.UpdateItemInput>(<unknown>{
    ExpressionAttributeNames: {
      '#createdOn': 'createdOn',
      '#modifiedOn': 'modifiedOn',
    },
    ExpressionAttributeValues: {
      ':createdOn': item.createdOn,
      ':modifiedOn': item.modifiedOn,
    },
    Key: {
      id: userDetails.id,
    },
    TableName: TableNames.getCognitoUsersTableName(),
    UpdateExpression: 'SET #createdOn = :createdOn, #modifiedOn = :modifiedOn',
  });
  if (roles) {
    params = <DynamoDB.UpdateItemInput>(<unknown>{
      ExpressionAttributeNames: {
        '#createdOn': 'createdOn',
        '#modifiedOn': 'modifiedOn',
        '#roles': 'roles',
      },
      ExpressionAttributeValues: {
        ':createdOn': item.createdOn,
        ':modifiedOn': item.modifiedOn,
        ':roles': roles,
      },
      Key: {
        id: userDetails.id,
      },
      TableName: TableNames.getCognitoUsersTableName(),
      UpdateExpression:
        'SET #createdOn = :createdOn, #modifiedOn = :modifiedOn, #roles = :roles',
    });
  }
  return update(params);
};

export const getAllUsers = (): Promise<UserDocument[]> => {
  const params: DynamoDB.ScanInput = {
    TableName: TableNames.getCognitoUsersTableName(),
  };
  appLogger.info({ getAllUsers_scan_params: params });
  return scan<UserDocument[]>(params);
};

export const getAllUsersWithoutCreatedOnDate = (): Promise<UserDocument[]> => {
  const params: DynamoDB.ScanInput = {
    ScanFilter: {
      createdOn: {
        ComparisonOperator: 'NULL',
      },
    },
    TableName: TableNames.getCognitoUsersTableName(),
  };
  appLogger.info({ getAllUsersWithoutCreatedOnDate_scan_params: params });
  return scan<UserDocument[]>(params);
};
