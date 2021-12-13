import { FetchAction } from '..';

export interface IAssessmentAnswersMap {
    [questionId: string]: ISelectedOption
}

export interface IAssessmentSummaryAnswersMap {
    payload: any | {}
}

export interface ISelectedOption {
    answers: string[],
    comment: string | null,
    index?: number,
}

export interface IAnswerPayload {
    questionId: string;
    version: number;
    answers: string[];
    comment: string | null;
}

export interface IAssessmentPostRequest {
    status: FetchAction;
    data: IAssessmentPostResponse | null;
    error?: object | null;
}

export interface IAssessmentPostResponse {
    message: string;
}