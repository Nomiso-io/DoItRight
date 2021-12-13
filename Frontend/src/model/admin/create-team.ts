import { FetchAction } from '../';
import  { IFieldConfigAttributes, IMetricsTool } from '..';

export interface ICreateTeamParamsRequest {
    data: ITeamParams | null,
    status: FetchAction,
    error?: object | null
}

export interface ITeamInfo {
    active: string;
    createdBy?: string;
    createdOn?: number;
    manager?: string;
    managerId?: string;
    metrics?: IMetricsTool[];
  //  order: [string];
    orgId: string;
    services?: IServiceInfo[];
    teamId: string;
    teamName: string;
    technology?: string;
    [keyName: string]: any;
  }
  
  export interface IServiceInfo {
    active: string;
    createdBy?: string;
    createdOn?: number;
    id: string;
    metrics?: IMetricsTool[];
    name: string;
    services?: IServiceInfo[];
    [keyName: string]: any;
  }
  
/*
export interface ITeamAttributes {
//    value?: any;
    options?: any;
    mandatory: boolean;
    displayName: string;
    type: string;
    custom: boolean;
}
*/
export interface ITeamParams {
    teamConfig: ITeamConfig;
    serviceConfig: ITeamConfig;
    orgId: string;
    values?: ITeamInfo;
}

export interface ITeamConfig {
    [keyName: string]: IFieldConfigAttributes;
}
