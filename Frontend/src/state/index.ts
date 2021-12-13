import { ILoadAssessmentSummaryRequest } from './assessment-summary';
import { ILoadAssessmentNextQuestionRequest } from './assessment-next-question';
import { ILoadAssessmentFinalResultRequest } from './assessment-final-result';

export * from './assessment-summary';
export * from './assessment-next-question';
export * from './assessment-final-result';

export interface IState {
    assessmentSummary: ILoadAssessmentSummaryRequest;
    assessmentNextQuestion: ILoadAssessmentNextQuestionRequest;
    assessmentFinalResult: ILoadAssessmentFinalResultRequest
}