// import { FetchAction } from '../';

export interface IUserConfig {
    [keyName: string]: IUserAttributes;
}

export interface IUserAttributes {
    value?: any;
    options?: any;
    Mandatory: boolean;
    displayName: string;
    type: string;
}

export interface IUserParams {
    config: IUserConfig
    orgId: string;
    type: string;
    values?: any;
}

export interface IUserParamState {
    [keyName: string]: any;
}