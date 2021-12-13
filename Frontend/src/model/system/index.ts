export interface ISystemDetails {
  appClientId: string;
  appClientURL: string;
  mode: string; // regular or trial
  userpoolId: string;
}

export interface IConfigItem {
  config:
    | ISystemDetails
    | IObjectConfigDetails
    | IGeneralConfigDetails
    | ICollectorConfigDetails;
  orgId: string;
  type: string;
}

export interface IObjectConfigDetails {
  [key: string]: IFieldConfigAttributes;
}

export interface IFieldConfigAttributes {
  displayName: string;
  custom: boolean;
  mandatory: boolean;
  type: string;
  options?: any;
  defaultValue?: string;
  position?: number;
  helpText?: string;
}

export interface IGeneralConfigDetails {
  levels: ILevelAttributes[];
  performanceMetricsConstant: number;
  archiveDays: number;
}

export interface ILevelAttributes {
  color: string;
  lowerLimit: number;
  name: string;
  upperLimit: number;
}

export interface ICollectorConfigDetails {
  [key: string]: ICollectorConfig[];
}

export interface ICollectorConfig {
  attributes: IObjectConfigDetails;
  collectorSchedule: number;
  name: string;
  nextCollectorRunTimestamp: number;
  nextProcessorRunTimestamp: number;
  processorSchedule: number;
}
