export interface DeploymentDataItem {
  countBuilds: number;
  timestamp: number;
}

export interface LeadTimeDataItem {
  issueCount: number;
  timestamp: number;
  totalLeadTime: number;
}

export interface MeanTimeToRestoreDataItem {
  issueCount: number;
  timestamp: number;
  totalRestoreTime: number;
}

export interface ChangeFailureRateDataItem {
  countFailBuilds: number;
  timestamp: number;
  totalBuilds: number;
}

export interface TrendDataItem {
  timestamp: number;
  value: number;
}

export interface DORADataItem {
  aggregateValue: number;
  graphData: DeploymentDataItem[]
    | LeadTimeDataItem[]
    | MeanTimeToRestoreDataItem[]
    | ChangeFailureRateDataItem[];
  level: string;
  trendData: TrendDataItem[];
}

export const DORA_LEVEL_NA = 'N/A';
export const DORA_LEVEL_ELITE = 'Elite';
export const DORA_LEVEL_HIGH = 'High';
export const DORA_LEVEL_LOW = 'Low';
export const DORA_LEVEL_MEDIUM = 'Medium';
