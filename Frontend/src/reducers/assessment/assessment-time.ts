import { CHANGE_ASSESSMENT_START_TIME, CHANGE_ASSESSMENT_CURRENT_TIME } from '../../actions/assessment/assessment-time';
import { AssessmentActions } from '../../actions';
import { IAssessment } from '../../model';

export const assessmentTimeReducer = {
    [CHANGE_ASSESSMENT_START_TIME](state: IAssessment, actions: AssessmentActions<number>) {
        return {
            ...state,
            assessmentTime: {
                ...state.assessmentTime,
                startTime: actions.payload,
            }
        }
    },
    [CHANGE_ASSESSMENT_CURRENT_TIME](state: IAssessment, actions: AssessmentActions<number>) {
        return {
            ...state,
            assessmentTime: {
                ...state.assessmentTime,
                currentTime: actions.payload,
            }
        }
    },
};
