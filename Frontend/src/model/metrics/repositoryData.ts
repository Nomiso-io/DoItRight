export interface IRepoPullReqsDataItem {
  commitsAccepted: number;
  commitsCreated: number;
  commitsPending: number;
  commitsRejected: number;
  committerName: string;
  projectName: string;
  teamId: string;
  timestampEnd: number;
  url: string;
  //    timestampStart: number;
}

export interface IRepoPullReqWaitTimeDataItem {
  closedPullReqCount: number;
  committerName: string;
  projectName: string;
  teamId: string;
  timestampEnd: number;
  //    timestampStart: number;
  totalClosureTime: number;
}

export interface IRepoDataItemLists {
  committerName: string[];
}

export const STATUS_RAISED = 'Raised';
export const STATUS_ACCEPTED = 'Accepted';
export const STATUS_REJECTED = 'Rejected';
