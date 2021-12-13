import {
    FETCH_ASSESSMENT_RESULT_START,
    FETCH_ASSESSMENT_RESULT_FAIL,
    FETCH_ASSESSMENT_RESULT_SUCCESS,
    AssessmentResultActions,
    RESET_ASSESSMENT_RESULT
} from '../../actions';
import { ILoadAssessmentFinalResultRequest, IAssessment } from '../../model';

const assessmentResultReducer = {
    [FETCH_ASSESSMENT_RESULT_START]
        (state: IAssessment,
            action: AssessmentResultActions<ILoadAssessmentFinalResultRequest>) {
        return {
            ...state,
            result: {
                ...action.payload
            }
        }
    },
    [FETCH_ASSESSMENT_RESULT_FAIL]
        (state: IAssessment,
            action: AssessmentResultActions<ILoadAssessmentFinalResultRequest>) {
        return {
            ...state,
            result: {
                ...action.payload
            }
        }
    },
    [FETCH_ASSESSMENT_RESULT_SUCCESS]
        (state: IAssessment,
            action: AssessmentResultActions<ILoadAssessmentFinalResultRequest>) {
        return {
            ...state,
            result: {
                ...action.payload
            }
        }
    },
    [RESET_ASSESSMENT_RESULT]
        (state: IAssessment,
            action: AssessmentResultActions<ILoadAssessmentFinalResultRequest>) {
        return {
            ...state,
            result: {
                ...action.payload
            }
        }
    },
};
export { assessmentResultReducer };
