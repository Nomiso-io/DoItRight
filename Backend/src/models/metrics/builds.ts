export interface BuildGraphDataItem {
  countFailBuilds: number;
  countInProgressBuilds: number;
  countOtherBuilds: number;
  countSuccessBuilds: number;
  timestampEnd: number;
}

export interface BuildListDataItem {
  buildNum: number;
  duration: number;
  endTimestamp: number;
  projectName: string;
  service: string;
  startTimestamp: number;
  status: string;
  teamId: string;
  url: string;
}

export interface BuildDatabaseDataItem {
  buildNum: number;
  duration: number;
  endTimestamp?: number; // or date
  failureWindow: number;
  pauseDuration?: number;
  projectName: string;
  servicePath: string;
  stages: BuildDatabaseStageDataItem[];
  startTimestamp: number; // or date
  status: string;
  teamId: string;
  url: string;
}

export interface BuildDatabaseStageDataItem {
  duration: number;
  endTimestamp?: number;
  pauseDuration?: number;
  stageId: number;
  stageName: string;
  startTimestamp: number;
  status: string;
}

export const STATUS_SUCCESS = 'SUCCESS';
export const STATUS_FAILED = 'FAILED';
export const STATUS_CANCELED = 'CANCELED';
export const STATUS_INPROGRESS = 'IN_PROGRESS';
export const STATUS_SKIPPED = 'SKIPPED';
export const STATUS_PENDING = 'PENDING';
export const STATUS_BLOCKED = 'BLOCKED';
export const STATUS_SCHEDULED = 'SCHEDULED';
export const STATUS_OTHER = 'OTHER';
