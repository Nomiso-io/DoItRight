import {
    POST_SELECTED_OPTION_START,
    POST_SELECTED_OPTION_FAIL,
    POST_SELECTED_OPTION_SUCCESS,
    SAVE_SELECTED_RESPONSE,
    AssessmentActions,
    SAVE_SUMMARY_MARKED_ANSWERS
} from '../../actions';
import {
    IAssessment,
    IAssessmentPostRequest,
    IAssessmentAnswersMap,
    IAssessmentSummaryAnswersMap,
} from '../../model';

export const assessmentAnswersReducer = {
    [POST_SELECTED_OPTION_START]
        (state: IAssessment, action: AssessmentActions<IAssessmentPostRequest>) {
        return {
            ...state,
            assessmentAnswers: {
                ...action.payload
            }
        };
    },
    [POST_SELECTED_OPTION_FAIL]
        (state: IAssessment, action: AssessmentActions<IAssessmentPostRequest>) {
        return {
            ...state,
            assessmentAnswers: {
                ...action.payload
            }
        }
    },
    [POST_SELECTED_OPTION_SUCCESS]
        (state: IAssessment, action: AssessmentActions<IAssessmentPostRequest>) {
        return {
            ...state,
            assessmentAnswers: {
                ...action.payload
            },
        };
    },
    [SAVE_SELECTED_RESPONSE]
        (state: IAssessment, action: AssessmentActions<IAssessmentAnswersMap>) {
        return {
            ...state,
            markedAnswers: {
                ...state.markedAnswers,
                ...action.payload
            }
        };
    },
    [SAVE_SUMMARY_MARKED_ANSWERS]
        (state: IAssessment, action: AssessmentActions<IAssessmentSummaryAnswersMap>) {
        const payload = addCommentsField(action.payload)
        return {
            ...state,
            markedAnswers: payload
        };
    }
}

const addCommentsField = (data: any) => {
    for (let key in data){
        if(!data[key].comment){
            data[key].comment = null
        }
    }
    return data;

}
