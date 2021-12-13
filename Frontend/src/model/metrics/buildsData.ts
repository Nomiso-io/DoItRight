/*
export interface IBuildsDataItem {
    buildNum: number;
    teamId: string;
    projectName: string;
    duration: number;
    status: string;
    timestamp: number;
    url: string;
}
*/
export interface IBuildsGraphDataItem {
    countFailBuilds: number;
    countInProgressBuilds: number;
    countOtherBuilds: number;
    countSuccessBuilds: number;
    timestampEnd: number;
}
  
export interface IBuildsListDataItem {
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
  
export const STATUS_SUCCESS = 'SUCCESS';
export const STATUS_FAILED = 'FAILED';
export const STATUS_CANCELED = 'CANCELED';
export const STATUS_INPROGRESS = 'IN_PROGRESS';
export const STATUS_SKIPPED = 'SKIPPED';
export const STATUS_PENDING = 'PENDING';
export const STATUS_SCHEDULED = 'SCHEDULED';
export const STATUS_OTHER = 'OTHER';
  