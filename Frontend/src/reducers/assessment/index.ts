import createReducer from '../createReducer';
import { initialState, IAssessment } from '../../model';
import { assessmentQuestionReducers } from './question';
import { assessmentSummaryReducers } from './summary';
import { assessmentAnswersReducer } from './answers';
import { assessmentResultReducer } from './assessment-result-reducer';
import { assessmentHistory } from './assessment-hisory';
import { assessmentDetail } from './assessment-detail';
import { teamAssessments } from './team-assessments';
import { assessmentTypes } from './assessment-select';
import { resetAssessmentReducer } from './reset-assessments';
import { assessmentsMiscellaneousReducer } from './assessments-miscellaneous';
import { assessmentTimeReducer } from './assessment-time';

const defaultState = initialState.assessment;
const assessmentReducers = {
    ...assessmentQuestionReducers,
    ...assessmentSummaryReducers,
    ...assessmentAnswersReducer,
    ...assessmentResultReducer,
    ...assessmentHistory,
    ...assessmentDetail,
    ...teamAssessments,
    ...assessmentTypes,
    ...resetAssessmentReducer,
    ...assessmentsMiscellaneousReducer,
    ...assessmentTimeReducer
}

export const assessment = createReducer<IAssessment>(defaultState, assessmentReducers);
