export interface RepoPullReqsDataItem {
  commitsAccepted: number;
  commitsPending: number;
  commitsRejected: number;
}

export interface RepoPullRaiserDataItem {
  commitsAccepted: number;
  commitsCreated: number;
  commitsRejected: number;
  committerName: string;
  projectName: string;
  service: string;
  teamId: string;
  url: string;
}

export interface RepoDataItemLists {
  committerName: string[];
}

export interface RepoPullReqLifeDataItem {
  closedPullReqCount: number;
  timestampEnd: number;
  totalClosureTime: number;
}

export interface RepoDatabaseDataItem {
  acceptState?: string;
  projectName: string;
  pullId: number;
  raisedBy: string;
  raisedOn: number;
  repoName: string;
  reviewedOn?: number;
  servicePath: string;
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

export const STATUS_CLOSED = 'CLOSED';
export const STATUS_OPEN = 'OPEN';
export const STATE_ACCEPTED = 'ACCEPTED';
export const STATE_REJECTED = 'REJECTED';

export const COMMIT_STATUS_SUCCESS = 'success';
export const COMMIT_STATUS_FAILED = 'failed';
export const COMMIT_STATUS_INPROGRESS = 'running';
