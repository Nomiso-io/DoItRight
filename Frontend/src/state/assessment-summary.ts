import { AsyncActions } from '../standrard-actions';

export interface IAssessmentSummary {
    numberOfQuestions: number;
    assessmentId: string;
}
export type IAssessmentSummaryResponse = IAssessmentSummary;
export interface ILoadAssessmentSummaryRequest {
    data: IAssessmentSummaryResponse
    status: AsyncActions.AsyncActionState;
    error?: string;
}