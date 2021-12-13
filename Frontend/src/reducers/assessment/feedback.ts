import {
    POST_FEEDBACK_START,
    POST_FEEDBACK_SUCCESS,
    POST_FEEDBACK_FAIL,
    FeedbackActions
} from '../../actions';
import {
    IAssessment,
    ILoadFeedbackRequest
} from '../../model';

export const feedbackReducer = {
    [POST_FEEDBACK_START]
        (state: IAssessment, action: FeedbackActions<ILoadFeedbackRequest>) {
        return {
            ...state,
            feedback: {
                ...action.payload
            }
        };
    },
    [POST_FEEDBACK_FAIL]
        (state: IAssessment, action: FeedbackActions<ILoadFeedbackRequest>) {
        return {
            ...state,
            feedback: {
                ...action.payload
            }
        }
    },
    [POST_FEEDBACK_SUCCESS]
        (state: IAssessment, action: FeedbackActions<ILoadFeedbackRequest>) {
        return {
            ...state,
            feedback: {
                ...action.payload
            },
        };
    }
}
