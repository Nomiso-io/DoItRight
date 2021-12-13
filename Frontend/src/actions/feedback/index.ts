import {
    FEEDBACK_ACTIONS
} from './feedback-actions';

export interface FeedbackActions<T> {
    type: FEEDBACK_ACTIONS;
    payload: T;
}

export * from './feedback-actions';