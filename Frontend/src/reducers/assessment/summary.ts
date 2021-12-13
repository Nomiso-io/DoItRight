import {
    FETCH_ASSESSMENT_SUMMARY_START,
    FETCH_ASSESSMENT_SUMMARY_FAIL,
    FETCH_ASSESSMENT_SUMMARY_SUCCESS,
    AssessmentActions
} from '../../actions';
import { IAssessment, IAssessmentSummaryRequest } from '../../model';

export const assessmentSummaryReducers = {
    [FETCH_ASSESSMENT_SUMMARY_START]
        (state: IAssessment, action: AssessmentActions<IAssessmentSummaryRequest>) {
        return {
            ...state,
            assessmentSummary: {
                ...action.payload
            }
        };
    },
    [FETCH_ASSESSMENT_SUMMARY_FAIL]
        (state: IAssessment, action: AssessmentActions<IAssessmentSummaryRequest>) {
        return {
            ...state,
            assessmentSummary: {
                ...action.payload
            }
        }
    },
    [FETCH_ASSESSMENT_SUMMARY_SUCCESS]
        (state: IAssessment, action: AssessmentActions<IAssessmentSummaryRequest>) {
        return {
            ...state,
            assessmentSummary: {
                ...action.payload
            }
        };
    },

};
