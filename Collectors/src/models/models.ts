//CollectorConfig structure from Config table in dynamoDB
export interface ConfigItem {
    config: CollectorConfigDetails;
    orgId: string;
    type: string;
}

export interface CollectorConfigDetails {
    [key: string]: CollectorConfig[];
}

export interface CollectorConfig {
    attributes: any;
    collectorSchedule: number;
    name: string;
    nextCollectorRunTimestamp: number;
    nextProcessorRunTimestamp: number;
    processorSchedule: number;
    type: string;
}

//team metrics tools details from Team table in dynamoDB
export interface IMetricsTool {
    toolName: string;
    toolType: string;
    enabled: boolean;
    [keyName: string]: any;
}

//all build data
export interface BuildDatabaseDataItem {
    teamId: string;
    servicePath: string;
    buildNum: number;
    projectName: string;
    failureWindow: number;
    stages: BuildDatabaseStageDataItem[];
    status: string;
    startTimestamp: number; // or date
    endTimestamp?: number; // or date
    duration: number;
    pauseDuration?: number;
    url: string;
}

export interface BuildDatabaseStageDataItem {
    stageName: string;
    stageId: number;
    status: string;
    startTimestamp: number;
    endTimestamp?: number;
    duration: number;
    pauseDuration?: number;
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

//all repository data
export interface RepoDatabaseDataItem {
    acceptState?: string;
    projectName: string;
    pullId: number; //or string
    raisedBy: string;
    raisedOn: number; //or date
    repoName: string;
//    reviewedBy: string;
    reviewedOn?: number; //or date
    servicePath: string;
    status: string;
    teamId: string;
    url: string;
}

export const STATUS_CLOSED = 'CLOSED';
export const STATUS_OPEN = 'OPEN';
export const STATE_ACCEPTED = 'ACCEPTED';
export const STATE_REJECTED = 'REJECTED';

export const STATUS_RAISED = 'Raised';
export const STATUS_ACCEPTED = 'Accepted';
export const STATUS_REJECTED = 'Rejected';

//all requirements data
export interface ReqDatabaseDataItem {
  closedOn?: number;
  createdOn: number;
  itemId: string;
  itemPriority: string;
  itemType: string;
  projectName: string;
  servicePath: string;
  startedOn?: number;
  status: string;
  teamId: string;
  url: string;
}

export const REQ_STATUS_NEW = 'To Do';
export const REQ_STATUS_INPROGRESS = 'In Progress';
export const REQ_STATUS_CLOSED = 'Done';
export const REQ_TYPE_BUG = 'Bug';
export const REQ_TYPE_STORY = 'Story';

//all quality data
export interface QualityDatabaseDataItem {
  metrics: string;
  projectName: string,
  servicePath: string;
  teamId: string,
  timestamp: number;
  url:string;
  value: number;
}

//all incident data
export interface IncidentDatabaseDataItem {
    endTime?: number;
    itemId: string;
    itemPriority: string;
    itemType: string;
    projectName: string;
    servicePath: string;
    startTime: number;
    status: string;
    teamId: string;
    url: string;
  }

//all commit data
export interface CommitDatabaseDataItem {
    commitDate: number;
    commitId: string;
    committedBy: string;
    pipelineEndDate?: number;
    pipelineId?: string;
    pipelineStartDate?: number;
    pipelineStatus?: string;
    projectName: string;
    ref?: string;
    repoName: string;
    servicePath: string;
    teamId: string;
    url: string;
  }

  export const COMMIT_STATUS_SUCCESS = 'success';
  export const COMMIT_STATUS_FAILED = 'failed';
  export const COMMIT_STATUS_INPROGRESS = 'running';

