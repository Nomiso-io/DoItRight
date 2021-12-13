import { AsyncActions } from '../standrard-actions';

export interface IAssessmentAnswerItem {
    id: string;
    answer: string;
}
export interface IAssessmentNextQuestion {
    id: string;
    type: string;
    index: number;
    category: string;
    question: string;
    hint: string;
    answers: IAssessmentAnswerItem[]
}
export type IAssessmentNextQuestionResponse = IAssessmentNextQuestion
export interface ILoadAssessmentNextQuestionRequest {
    data: IAssessmentNextQuestionResponse;
    status: AsyncActions.AsyncActionState;
    error?: string;
}