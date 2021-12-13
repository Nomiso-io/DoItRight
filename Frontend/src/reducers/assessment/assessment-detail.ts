
import {
    FETCH_ASSESSMENT_DETAIL_START,
    FETCH_ASSESSMENT_DETAIL_FAIL,
    FETCH_ASSESSMENT_DETAIL_SUCCESS,
    AssessmentActions,
    RESET_ASSESSMENT_DETAIL
} from '../../actions';

import { ILoadAssessmentDetailRequest, IAssessment } from '../../model'

const assessmentDetail = {
    [FETCH_ASSESSMENT_DETAIL_START]
        (state: IAssessment,
            action: AssessmentActions<ILoadAssessmentDetailRequest>) {
        return {
            ...state,
            assessmentDetail: {
                ...action.payload
            }
        }
    },
    [FETCH_ASSESSMENT_DETAIL_SUCCESS]
        (state: IAssessment,
            action: AssessmentActions<ILoadAssessmentDetailRequest>) {
        return {
            ...state,
            assessmentDetail: {
                ...action.payload
            }
        }
    },
    [FETCH_ASSESSMENT_DETAIL_FAIL]
        (state: IAssessment,
            action: AssessmentActions<ILoadAssessmentDetailRequest>) {
        return {
            ...state,
            assessmentDetail: {
                ...action.payload
            }
        }
    },
    [RESET_ASSESSMENT_DETAIL]
        (state: IAssessment,
            action: AssessmentActions<ILoadAssessmentDetailRequest>) {
        return {
            ...state,
            assessmentDetail: {
                ...action.payload
            }
        }
    }
}

export { assessmentDetail }
