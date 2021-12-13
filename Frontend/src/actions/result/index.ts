import {
    ASSESSMENT_RESULT_ACTIONS
} from './result-actions';

export interface AssessmentResultActions<T> {
    type: ASSESSMENT_RESULT_ACTIONS;
    payload: T;
}

export * from './result-actions';