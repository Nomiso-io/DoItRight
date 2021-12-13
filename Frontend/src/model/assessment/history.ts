import { FetchAction } from '..';
import { IResultItem } from '../result';
export interface IAssessmentListItem {
  assessmentDetails: any;
  assessmentId: string;
  assessmentName: string;
  date: number;
  dateSubmit: number;
  hideResult: boolean;
  questionnaireVersion: string;
  result?: IResultItem;
  teamId: string;
  teamName: string;
  timeOut: boolean;
  type: any;
  userId: string;
}

interface IAssessmentHistory {
  assessments: IAssessmentListItem[];
}

export interface IAssessmentHistoryStoreFormat {
  assessments: {
    [assessmentId: string]: IAssessmentListItem;
  };
}
export type IAssessmentHistoryResponse = IAssessmentHistory;
export interface ILoadAssessmentHistoryRequest {
  data: IAssessmentHistoryStoreFormat | null;
  status: FetchAction;
  error?: object | null;
}
