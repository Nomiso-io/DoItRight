import { FetchAction } from '..';

export interface IAssessmentQuestionRequest {
    status: FetchAction;
    data: IAssessmentQuestionData | null;
    error?: object | null;
}

export interface IAssessmentQuestionData {
    numberOfAnswers: number;
    id: string;
    version: number;
    index: number;
    question: string;
    type: string;
    answers: IAnswer;
    category: string;
    randomize?: boolean;
    hint?: string;
    hintURL?: string;
    NA?: boolean;
    reason?: boolean;
}

export interface IAnswer {
    [id: string]: {
        answer: string;
        weightageFactor: number;
    }
}