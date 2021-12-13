import { Http } from '../../utils';
import { ILoadFeedbackRequest } from '../../model';
import { IFeedbackPayload, IFeedbackResponse } from '../../model/feedback';
import { FeedbackActions } from './';

type POST_FEEDBACK_START = 'POST_FEEDBACK_START';
export const POST_FEEDBACK_START: POST_FEEDBACK_START =
    'POST_FEEDBACK_START';

type POST_FEEDBACK_SUCCESS = 'POST_FEEDBACK_SUCCESS';
export const POST_FEEDBACK_SUCCESS: POST_FEEDBACK_SUCCESS =
    'POST_FEEDBACK_SUCCESS';

type POST_FEEDBACK_FAIL = 'POST_FEEDBACK_FAIL';
export const POST_FEEDBACK_FAIL: POST_FEEDBACK_FAIL =
    'POST_FEEDBACK_FAIL';

export type FEEDBACK_ACTIONS = POST_FEEDBACK_FAIL
    | POST_FEEDBACK_SUCCESS
    | POST_FEEDBACK_START

export function postFeedback(payload: IFeedbackPayload, assessmentId: string) {
    return (dispatch: Function, getState: Function) => {
        dispatch(fetchDataStart());
        Http.post<IFeedbackResponse, IFeedbackPayload>({
            url: `/api/v2/${assessmentId}/feedback`,
            body: {
                ...payload
            },
            state: getState()
        }).then((response: IFeedbackResponse) => {
            dispatch(fetchDataSuccess(response));
        }).catch((error: any) => {
            dispatch(fetchDataFail(error));
        })
    };
}

function fetchDataStart(): FeedbackActions<ILoadFeedbackRequest> {
    return {
        type: POST_FEEDBACK_START,
        payload: {
            status: 'start',
            data: null
        }
    };
}

function fetchDataSuccess(data: IFeedbackResponse):
    FeedbackActions<ILoadFeedbackRequest> {
    return {
        type: POST_FEEDBACK_SUCCESS,
        payload: {
            data,
            status: 'success',
        }
    };
}

function fetchDataFail(message: object):
    FeedbackActions<ILoadFeedbackRequest> {
    return {
        type: POST_FEEDBACK_FAIL,
        payload: {
            error: message,
            data: null,
            status: 'fail',
        }
    };
}