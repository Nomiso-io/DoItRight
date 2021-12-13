
import {
    FETCH_ASSESSMENT_TYPES_START,
    FETCH_ASSESSMENT_TYPES_FAIL,
    FETCH_ASSESSMENT_TYPES_SUCCESS,
    AssessmentActions,
    SET_SELECTED_ASSESSMENT_TYPE
} from '../../actions';

import { IAssessment } from '../../model'
import { ILoadAssessmentTypeRequest } from '../../model/assessment/assessment-select';

const assessmentTypes = {
    [FETCH_ASSESSMENT_TYPES_START]
        (state: IAssessment,
            action: AssessmentActions<ILoadAssessmentTypeRequest>) {
        return {
            ...state,
            assessmentDetail: {
                ...action.payload
            }
        }
    },
    [FETCH_ASSESSMENT_TYPES_SUCCESS]
        (state: IAssessment,
            action: AssessmentActions<ILoadAssessmentTypeRequest>) {
        return {
            ...state,
            assessmentType: {
                ...action.payload
            }
        }
    },
    [FETCH_ASSESSMENT_TYPES_FAIL]
        (state: IAssessment,
            action: AssessmentActions<ILoadAssessmentTypeRequest>) {
        return {
            ...state,
            assessmentType: {
                ...action.payload
            }
        }
    },
    [SET_SELECTED_ASSESSMENT_TYPE]
        (state: IAssessment,
            action: AssessmentActions<ILoadAssessmentTypeRequest>) {
        return {
            ...state,
            selectedAssessmentType: action.payload.data
        }
    },
}

export { assessmentTypes }
