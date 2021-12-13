import { AsyncActions } from '../standrard-actions';
export interface IResultItem {
    score: number;
    maxScore: number;
    percentage: number;
    level: string;
}
export interface IAssessmentFinalResult {
    date: number;
    result: IResultItem;
}
export type IAssessmentFinalResultResponse = IAssessmentFinalResult
export interface ILoadAssessmentFinalResultRequest {
    data: IAssessmentFinalResultResponse;
    status: AsyncActions.AsyncActionState;
    error?: string;
}