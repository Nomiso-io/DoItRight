import { FetchAction } from '..';

export interface IAssessmentSummaryRequest {
    status: FetchAction;
    data: IAssessmentSummaryData | null;
    error?: object | null;
}

export interface IAssessmentSummaryData {
    numberOfQuestions: number;
    assessmentId: string;
    markedAnswers?: object;
    categoryList: any;
    type: string;
    description: string;
    version?: string;
    timeOut: boolean;
    timeOutTime: number;
    warningTimePercentage: number;
    hideResult: boolean;
}