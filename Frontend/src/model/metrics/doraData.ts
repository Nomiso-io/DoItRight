export interface IDeploymentDataItem {
  countBuilds: number;
  timestamp: number;
}

export interface ILeadTimeDataItem {
  issueCount: number;
  timestamp: number;
  totalLeadTime: number;
}

export interface IMeanTimeToRestoreDataItem {
  issueCount: number;
  timestamp: number;
  totalRestoreTime: number;
}

export interface IChangeFailureRateDataItem {
  countFailBuilds: number;
  timestamp: number;
  totalBuilds: number;
}

export interface ITrendDataItem {
  timestamp: number;
  value: number;
}

export const LEAD_TIME_STATUS_CLOSED = 'Closed';
