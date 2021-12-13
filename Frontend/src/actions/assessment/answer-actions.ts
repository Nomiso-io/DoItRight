import { Http } from '../../utils';
import {
    IAnswerPayload,
    IAssessmentPostResponse,
    IAssessmentPostRequest,
    IAssessmentAnswersMap,
    IAssessmentSummaryData
} from '../../model';
import { AssessmentActions } from '.';

type POST_SELECTED_OPTION_START = 'POST_SELECTED_OPTION_START';
export const POST_SELECTED_OPTION_START: POST_SELECTED_OPTION_START =
    'POST_SELECTED_OPTION_START';

type POST_SELECTED_OPTION_SUCCESS = 'POST_SELECTED_OPTION_SUCCESS';
export const POST_SELECTED_OPTION_SUCCESS: POST_SELECTED_OPTION_SUCCESS =
    'POST_SELECTED_OPTION_SUCCESS';

type POST_SELECTED_OPTION_FAIL = 'POST_SELECTED_OPTION_FAIL';
export const POST_SELECTED_OPTION_FAIL: POST_SELECTED_OPTION_FAIL =
    'POST_SELECTED_OPTION_FAIL';

type SAVE_SELECTED_RESPONSE = 'SAVE_SELECTED_RESPONSE';
export const SAVE_SELECTED_RESPONSE: SAVE_SELECTED_RESPONSE =
    'SAVE_SELECTED_RESPONSE';

type SAVE_SUMMARY_MARKED_ANSWERS = 'SAVE_SUMMARY_MARKED_ANSWERS';
export const SAVE_SUMMARY_MARKED_ANSWERS: SAVE_SUMMARY_MARKED_ANSWERS =
    'SAVE_SUMMARY_MARKED_ANSWERS';

export type POST_SELECTED_OPTION_ACTIONS = POST_SELECTED_OPTION_FAIL
    | POST_SELECTED_OPTION_SUCCESS
    | POST_SELECTED_OPTION_START
    | SAVE_SELECTED_RESPONSE
    | SAVE_SUMMARY_MARKED_ANSWERS

export function postSelectedOption(assessmentId: string, payload: IAnswerPayload) {
    return (dispatch: Function, getState: Function) => {
        dispatch(fetchDataStart());
        Http.post<IAssessmentPostResponse, IAnswerPayload>({
            url: `/api/v2/assessment/${assessmentId}/answer`,
            body: {
                ...payload
            },
            state: getState()
        }).then((response: IAssessmentPostResponse) => {
            dispatch(fetchDataSuccess(response));
            dispatch(mapAnswerToQuestion(payload));
        }).catch((error) => {
            dispatch(mapAnswerToQuestion(payload));
            dispatch(fetchDataFail(error));
        })
    };
}

function fetchDataStart(): AssessmentActions<IAssessmentPostRequest> {
    return {
        type: POST_SELECTED_OPTION_START,
        payload: {
            status: 'start',
            data: null
        }
    };
}

function fetchDataSuccess(data: IAssessmentPostResponse):
    AssessmentActions<IAssessmentPostRequest> {
    return {
        type: POST_SELECTED_OPTION_SUCCESS,
        payload: {
            data,
            status: 'success',
        }
    };
}

function mapAnswerToQuestion(data: IAnswerPayload):
    AssessmentActions<IAssessmentAnswersMap> {
    return {
        type: SAVE_SELECTED_RESPONSE,
        payload: {
            [data.questionId]: {
                answers: data.answers,
                comment: data.comment
            }
        }
    };
}

function fetchDataFail(message: object): AssessmentActions<IAssessmentPostRequest> {
    return {
        type: POST_SELECTED_OPTION_FAIL,
        payload: {
            error: message,
            data: null,
            status: 'fail',
        }
    };
}

export function mapSummaryAnswersToQuestions(data: IAssessmentSummaryData) {
    return {
        type: SAVE_SUMMARY_MARKED_ANSWERS,
        payload: data.markedAnswers
    };
}