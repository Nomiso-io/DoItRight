export interface ReqStatusDataItem {
  countInProgress: number;
  countNew: number;
  countResolved: number;
  timestamp: number;
}

export interface ReqLTCTDataItem {
  issueCount: number;
  timestamp: number;
  totalCycleTime: number;
  totalLeadTime: number;
}

export interface ReqListDataItem {
  closedOn?: number;
  createdOn: number;
  itemId: string;
  itemPriority: string;
  itemType: string;
  projectName: string;
  service: string;
  startedOn?: number;
  status: string;
  teamId: string;
  url: string;
}

export interface ReqDataItemLists {
  itemPriority: string[];
  itemType: string[];
}

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

export const REQ_STATUS_NEW = 'To Do'; //should be 'To Do'
export const REQ_STATUS_INPROGRESS = 'In Progress'; //should be 'In Progress'
export const REQ_STATUS_CLOSED = 'Done'; //should be 'Done'
export const REQ_TYPE_BUG = 'Bug';
export const REQ_TYPE_STORY = 'Story';
