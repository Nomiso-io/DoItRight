import { config } from '@root/config';
import { appLogger } from '@utils/index';
import aws from 'aws-sdk';

aws.config.update({ region: config.region });
const cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider();

//This file contains cognitoIdentityServices API calls
export interface CognitoAttribute {
  Name: string;
  Value: string;
}
export interface CognitoUser {
  Attributes: CognitoAttribute[];
  Enabled: boolean;
  UserCreateDate: Date;
  UserLastmodifiedDate: Date;
  Username: string;
  UserStatus: string;
}
export const addUserToCognitoGroup = async (
  cognitoUser: string,
  groupName: string
): Promise<any> =>
  new Promise<any>((resolve, reject) => {
    const params = {
      GroupName: groupName,
      UserPoolId: config.cognito.userPoolId,
      Username: cognitoUser,
    };
    appLogger.debug({ adminAddUserToGroup_params: params });
    cognitoidentityserviceprovider.adminAddUserToGroup(
      params,
      (err: any, data: any) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });

export const removeUserFromCognitoGroup = async (
  cognitoUser: string,
  groupName: string
): Promise<any> =>
  new Promise<any>((resolve, reject) => {
    const params = {
      GroupName: groupName,
      UserPoolId: config.cognito.userPoolId,
      Username: cognitoUser,
    };
    appLogger.debug({ adminRemoveUserFromGroup_params: params });
    cognitoidentityserviceprovider.adminRemoveUserFromGroup(
      params,
      (err: any, data: any) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });

export const addCognitoUser = async (
  email: string,
  team?: any[]
): Promise<any> =>
  new Promise<any>((resolve, reject) => {
    const params = {
      DesiredDeliveryMediums: ['EMAIL'],
      TemporaryPassword: generatePassword(),
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'email_verified',
          Value: 'true',
        },
        {
          Name: 'custom:teamName',
          Value: team ? team[0] : 'default',
        },
      ],
      UserPoolId: config.cognito.userPoolId /* required */,
      Username: email /* required */,
    };
    appLogger.debug({ adminCreateUser_params: params });
    cognitoidentityserviceprovider.adminCreateUser(
      params,
      (err: any, data: any) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });

export const deleteCognitoUser = async (cognitoUser: string): Promise<any> =>
  new Promise<any>((resolve, reject) => {
    const params = {
      UserPoolId: config.cognito.userPoolId,
      Username: cognitoUser,
    };
    appLogger.debug({ adminDeleteUser_params: params });
    cognitoidentityserviceprovider.adminDeleteUser(
      params,
      (err: any, data: any) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });

export const disableCognitoUser = async (cognitoUser: string): Promise<any> =>
  new Promise<any>((resolve, reject) => {
    const params = {
      UserPoolId: config.cognito.userPoolId,
      Username: cognitoUser,
    };
    appLogger.debug({ adminDisableUser_params: params });
    cognitoidentityserviceprovider.adminDisableUser(
      params,
      (err: any, data: any) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });

export const getCognitoUser = async (cognitoUser: string): Promise<any> =>
  new Promise<any>((resolve, reject) => {
    const params = {
      UserPoolId: config.cognito.userPoolId,
      Username: cognitoUser,
    };
    appLogger.debug({ adminDisableUser_params: params });
    cognitoidentityserviceprovider.adminGetUser(
      params,
      (err: any, data: any) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });

export const updateCognitoUserToLowerCase = async (
  cognitoUser: string,
  email: string
): Promise<any> =>
  new Promise<any>((resolve, reject) => {
    const params = {
      UserAttributes: [
        {
          Name: 'email',
          Value: email.toLowerCase(),
        },
        {
          Name: 'email_verified',
          Value: 'true',
        },
      ],
      UserPoolId: config.cognito.userPoolId,
      Username: cognitoUser,
    };
    appLogger.debug({ adminDisableUser_params: params });
    cognitoidentityserviceprovider.adminUpdateUserAttributes(
      params,
      (err: any, data: any) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });

function generatePassword() {
  const length = 8;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let retVal = '';
  for (let i = 0; i < length; i += 1) {
    const n = charset.length;
    retVal += charset.charAt(Math.floor(Math.random() * n));
    retVal += '1!K';
  }
  return retVal;
}
