import {
    FETCH_ASSESSMENT_HISTORY_START,
    FETCH_ASSESSMENT_HISTORY_FAIL,
    FETCH_ASSESSMENT_HISTORY_SUCCESS,
    AssessmentActions
} from '../../actions';

import { ILoadAssessmentHistoryRequest, IAssessment } from '../../model'

const assessmentHistory = {
    [FETCH_ASSESSMENT_HISTORY_START]
        (state: IAssessment,
            action: AssessmentActions<ILoadAssessmentHistoryRequest>) {
        return {
            ...state,
            assessmentHistory: {
                ...action.payload
            }
        }
    },
    [FETCH_ASSESSMENT_HISTORY_SUCCESS]
        (state: IAssessment,
            action: AssessmentActions<ILoadAssessmentHistoryRequest>) {
        return {
            ...state,
            assessmentHistory: {
                ...action.payload
            }
        }
    },
    [FETCH_ASSESSMENT_HISTORY_FAIL]
        (state: IAssessment,
            action: AssessmentActions<ILoadAssessmentHistoryRequest>) {
        return {
            ...state,
            assessmentHistory: {
                ...action.payload
            }
        }
    },
}

export { assessmentHistory }
