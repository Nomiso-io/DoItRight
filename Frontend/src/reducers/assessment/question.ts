import {
    FETCH_ASSESSMENT_QUESTION_START,
    FETCH_ASSESSMENT_QUESTION_SUCCESS,
    FETCH_ASSESSMENT_QUESTION_FAIL,
    AssessmentActions,
    FETCH_ASSESSMENT_QUESTION_INITIALIZE
} from '../../actions';
import { IAssessment, IAssessmentSummaryRequest } from '../../model';

export const assessmentQuestionReducers = {
    [FETCH_ASSESSMENT_QUESTION_INITIALIZE]
        (state: IAssessment, action: AssessmentActions<IAssessmentSummaryRequest>) {
        return {
            ...state,
            assessmentQuestion: {
                ...action.payload
            }
        };
    },
    [FETCH_ASSESSMENT_QUESTION_START]
        (state: IAssessment, action: AssessmentActions<IAssessmentSummaryRequest>) {
        return {
            ...state,
            assessmentQuestion: {
                ...action.payload
            }
        };
    },
    [FETCH_ASSESSMENT_QUESTION_SUCCESS]
        (state: IAssessment, action: AssessmentActions<IAssessmentSummaryRequest>) {
        return {
            ...state,
            assessmentQuestion: {
                ...action.payload
            }
        }
    },
    [FETCH_ASSESSMENT_QUESTION_FAIL]
        (state: IAssessment, action: AssessmentActions<IAssessmentSummaryRequest>) {
        return {
            ...state,
            assessmentQuestion: {
                ...action.payload
            }
        };
    },

};
