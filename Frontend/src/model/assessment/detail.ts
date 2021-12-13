import { FetchAction } from '..';
import { IResultItem } from '../result/index'
export interface IOptionItem {
    answer: string;
    isSelected: boolean;
    weightage: number;
}
export interface IAssessmentDetailItem {
    question: string;
    comment?: string;
    category: string;
    answers: string[];
    options: IOptionItem[];
    randomize?: boolean;
}
export interface IRecommendationItem {
    [category: string]: any
}
interface IAssessmentDetail {
    assessmentSummary: IAssessmentDetailItem[];
    bestScoringAssessment?: AssessmentDocument;
    hideResult: boolean;
    result: IResultItem;
    recommendations: IRecommendationItem;
    showRecommendations?: boolean;
    benchmarkScore?: number;
    timeOut: boolean;
    userLevels: any;
}
export type IAssessmentDetailResponse = IAssessmentDetail;
export interface ILoadAssessmentDetailRequest {
    data: IAssessmentDetailResponse | null;
    status: FetchAction;
    error?: object | null;
}

/* Interfaces directly taken from the backend starts */
export interface AssessmentDocument {
    assessmentDetails?: AssessmentDetails;
    assessmentId: string;
    assessmentName?: string;
    date: number;
    dateSubmit?: number;
    feedback?: any;
    quesOrder?: string[];
    result?: IResultItem;
    type: string;
    userId: string;
}

export interface AssessmentDetails {
    [assessmentId: string]: {
        answers: [string];
        comment: string;
    };
}
/* Interfaces directly taken from the backend ends */