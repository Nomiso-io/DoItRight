import { Http } from '../../utils';
import { ILoadAssessmentDetailRequest, IAssessmentDetailResponse } from '../../model';
import { AssessmentActions } from '.';

type FETCH_ASSESSMENT_DETAIL_START = 'FETCH_ASSESSMENT_DETAIL_START';
export const FETCH_ASSESSMENT_DETAIL_START: FETCH_ASSESSMENT_DETAIL_START =
    'FETCH_ASSESSMENT_DETAIL_START';

type FETCH_ASSESSMENT_DETAIL_SUCCESS = 'FETCH_ASSESSMENT_DETAIL_SUCCESS';
export const FETCH_ASSESSMENT_DETAIL_SUCCESS: FETCH_ASSESSMENT_DETAIL_SUCCESS =
    'FETCH_ASSESSMENT_DETAIL_SUCCESS';

type FETCH_ASSESSMENT_DETAIL_FAIL = 'FETCH_ASSESSMENT_DETAIL_FAIL';
export const FETCH_ASSESSMENT_DETAIL_FAIL: FETCH_ASSESSMENT_DETAIL_FAIL =
    'FETCH_ASSESSMENT_DETAIL_FAIL';

type RESET_ASSESSMENT_DETAIL = 'RESET_ASSESSMENT_DETAIL';
export const RESET_ASSESSMENT_DETAIL: RESET_ASSESSMENT_DETAIL =
        'RESET_ASSESSMENT_DETAIL';

export type ASSESSMENT_DETAIL_ACTIONS = FETCH_ASSESSMENT_DETAIL_FAIL
    | FETCH_ASSESSMENT_DETAIL_SUCCESS | FETCH_ASSESSMENT_DETAIL_START
    | RESET_ASSESSMENT_DETAIL

export function fetchAssessmentDetail(assessmentId: string, isResult: boolean) {
    return (dispatch: Function, getState: Function) => {
        dispatch(fetchDataStart());
        Http.get<IAssessmentDetailResponse>({
            url: isResult ? `/api/v2/assessment/${assessmentId}/details?isResult=true`:
                            `/api/v2/assessment/${assessmentId}/details`,
            state: getState()
        }).then((response: IAssessmentDetailResponse) => {
            dispatch(fetchDataSuccess(response));
        }).catch((error) => {
            dispatch(fetchDataFail(error));
        })
    };
}

function fetchDataStart(): AssessmentActions<ILoadAssessmentDetailRequest> {
    return {
        type: FETCH_ASSESSMENT_DETAIL_START,
        payload: {
            status: 'start',
            data: null
        }
    };
}

function fetchDataSuccess(data: IAssessmentDetailResponse):
    AssessmentActions<ILoadAssessmentDetailRequest> {
    return {
        type: FETCH_ASSESSMENT_DETAIL_SUCCESS,
        payload: {
            data,
            status: 'success',
        }
    };
}

function fetchDataFail(message: object): AssessmentActions<ILoadAssessmentDetailRequest> {
    return {
        type: FETCH_ASSESSMENT_DETAIL_FAIL,
        payload: {
            error: message,
            data: null,
            status: 'fail',
        }
    };
}

export function resetAssessmentDetail(){
    return (dispatch: Function, getState: Function) => {
        dispatch(resetDetail())
    }
}

function resetDetail():
    AssessmentActions<ILoadAssessmentDetailRequest> {
    return {
        type: RESET_ASSESSMENT_DETAIL,
        payload: {
            data: null,
            status: 'initial',
        }
    };
}