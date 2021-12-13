import { Http } from '../../utils';
import { ILoadAssessmentTypeRequest } from '../../model/assessment/assessment-select';
import { AssessmentActions } from '.';

type FETCH_ASSESSMENT_TYPES_START = 'FETCH_ASSESSMENT_TYPES_START';
export const FETCH_ASSESSMENT_TYPES_START: FETCH_ASSESSMENT_TYPES_START =
    'FETCH_ASSESSMENT_TYPES_START';

type FETCH_ASSESSMENT_TYPES_SUCCESS = 'FETCH_ASSESSMENT_TYPES_SUCCESS';
export const FETCH_ASSESSMENT_TYPES_SUCCESS: FETCH_ASSESSMENT_TYPES_SUCCESS =
    'FETCH_ASSESSMENT_TYPES_SUCCESS';

type FETCH_ASSESSMENT_TYPES_FAIL = 'FETCH_ASSESSMENT_TYPES_FAIL';
export const FETCH_ASSESSMENT_TYPES_FAIL: FETCH_ASSESSMENT_TYPES_FAIL =
    'FETCH_ASSESSMENT_TYPES_FAIL';

type SET_SELECTED_ASSESSMENT_TYPE = 'SET_SELECTED_ASSESSMENT_TYPE';
export const SET_SELECTED_ASSESSMENT_TYPE: SET_SELECTED_ASSESSMENT_TYPE =
    'SET_SELECTED_ASSESSMENT_TYPE';

export type ASSESSMENT_TYPES_ACTIONS = FETCH_ASSESSMENT_TYPES_FAIL
    | FETCH_ASSESSMENT_TYPES_SUCCESS
    | FETCH_ASSESSMENT_TYPES_START
    | SET_SELECTED_ASSESSMENT_TYPE

export function  fetchAssessmentList(teamId: string) {
    return (dispatch: Function, getState: Function) => {
    dispatch(fetchDataStart());
    Http.get({
        url: `/api/v2/assignment?teamId=${teamId}`,
        state: getState()
    }).then((response: any) => {
        dispatch(fetchDataSuccess(response));
    }).catch((error : any) => {
        dispatch(fetchDataFail(error));
    })
}
}

export function setSelectedAssessmentType(assessmentType: any) {
    return (dispatch: Function) => {
        dispatch(setAssessmentType(assessmentType))
    }
}

function setAssessmentType(assessmentType: any) {
    return {
        type: SET_SELECTED_ASSESSMENT_TYPE,
        payload: {
            data: assessmentType
        }
    };
}

export function setSelectAssessmentDataSuccess(data: any) {
    return (dispatch: Function) => {
        dispatch(fetchDataSuccess(data))
    }
}

export function setSelectAssessmentDataFailure(error: any) {
    return (dispatch: Function) => {
        dispatch(fetchDataFail(error))
    }
}

export function setSelectAssessmentDataStart() {
    return (dispatch: Function) => {
        dispatch(fetchDataStart())
    }
}

function fetchDataStart(): AssessmentActions<ILoadAssessmentTypeRequest> {
    return {
        type: FETCH_ASSESSMENT_TYPES_START,
        payload: {
            status: 'start',
            data: null
        }
    };
}

function fetchDataSuccess(data: any):
    AssessmentActions<ILoadAssessmentTypeRequest> {
    return {
        type: FETCH_ASSESSMENT_TYPES_SUCCESS,
        payload: {
            data,
            status: 'success',
        }
    };
}

function fetchDataFail(message: object): AssessmentActions<ILoadAssessmentTypeRequest> {
    return {
        type: FETCH_ASSESSMENT_TYPES_FAIL,
        payload: {
            error: message,
            data: null,
            status: 'fail',
        }
    };
}