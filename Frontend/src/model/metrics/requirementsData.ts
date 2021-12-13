export interface IReqStatusDataItem {
  countInProgress: number;
  countNew: number;
  countResolved: number;
  timestamp: number;
}

export interface IReqLTCTDataItem {
  issueCount: number;
  timestamp: number;
  totalCycleTime: number;
  totalLeadTime: number;
}

export interface IReqListDataItem {
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

export interface IReqDataItemLists {
  itemPriority: string[];
  itemType: string[];
}

export const REQ_STATUS_NEW = 'To Do'; //should be 'To Do'
export const REQ_STATUS_INPROGRESS = 'In Progress'; //should be 'In Progress'
export const REQ_STATUS_CLOSED = 'Done'; //should be 'Done'
export const REQ_TYPE_BUG = 'Bug';
export const REQ_TYPE_STORY = 'Story';
