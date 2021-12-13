import { ASSESSMENT_SUMMARY_ACTIONS } from './summary-actions';
import { ASSESSMENT_QUESTION_ACTIONS } from './question-actions';
import { POST_SELECTED_OPTION_ACTIONS } from './answer-actions';
import { ASSESSMENT_HISTORY_ACTIONS } from './assessment-history-actions';
import { ASSESSMENT_DETAIL_ACTIONS } from './assessment-detail-actions';
import { TEAM_ASSESSMENT_ACTIONS } from './team-view-actions';
import { ASSESSMENT_TYPES_ACTIONS } from './assessment-select-actions';
import { REMOVE_ASSESSMENT_ACTIONS } from './reset-assessments';
import { MISCELLANEOUS_ASSESSMENT_ACTIONS } from './miscellaneous';
import { ASSESSMENT_TIME_ACTIONS } from './assessment-time';

export interface AssessmentActions<T> {
    type: ASSESSMENT_SUMMARY_ACTIONS |
    ASSESSMENT_QUESTION_ACTIONS |
    POST_SELECTED_OPTION_ACTIONS |
    ASSESSMENT_HISTORY_ACTIONS |
    ASSESSMENT_DETAIL_ACTIONS |
    TEAM_ASSESSMENT_ACTIONS |
    ASSESSMENT_TYPES_ACTIONS |
    REMOVE_ASSESSMENT_ACTIONS |
    MISCELLANEOUS_ASSESSMENT_ACTIONS |
    ASSESSMENT_TIME_ACTIONS;
    payload: T;
}

export * from './summary-actions';
export * from './question-actions';
export * from './answer-actions';
export * from './assessment-history-actions';
export * from './assessment-detail-actions';
export * from './map-assessment-history';
export * from './map-team-view';
export * from './team-view-actions';
export * from './assessment-select-actions';
export * from './reset-assessments';
export * from './miscellaneous';