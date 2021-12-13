import { Http } from '../../utils';
// import { ITeamParams } from '../../model';

type FETCH_CREATE_TEAM_PARAMS_START = 'FETCH_CREATE_TEAM_PARAMS_START';
export const FETCH_CREATE_TEAM_PARAMS_START: FETCH_CREATE_TEAM_PARAMS_START =
    'FETCH_CREATE_TEAM_PARAMS_START';

type FETCH_CREATE_TEAM_PARAMS_SUCCESS = 'FETCH_CREATE_TEAM_PARAMS_SUCCESS';
export const FETCH_CREATE_TEAM_PARAMS_SUCCESS: FETCH_CREATE_TEAM_PARAMS_SUCCESS =
    'FETCH_CREATE_TEAM_PARAMS_SUCCESS';

type FETCH_CREATE_TEAM_PARAMS_FAIL = 'FETCH_CREATE_TEAM_PARAMS_FAIL';
export const FETCH_CREATE_TEAM_PARAMS_FAIL: FETCH_CREATE_TEAM_PARAMS_FAIL =
    'FETCH_CREATE_TEAM_PARAMS_FAIL';

export type CREATE_TEAM_ACTIONS = FETCH_CREATE_TEAM_PARAMS_START |
    FETCH_CREATE_TEAM_PARAMS_SUCCESS | FETCH_CREATE_TEAM_PARAMS_FAIL

export function fetchTeamParameters(payload: any) {
    return (dispatch: Function, getState: Function) => {
        dispatch(fetchDataStart());
        Http.get({
            url: '/api/v2/admin/createteam',
            state: getState()
        }).then((response: any) => {
            dispatch(fetchDataSuccess(response));
        }).catch((error) => {
            dispatch(fetchDataFail(error));
        })
    };
}

function fetchDataStart() {
    return {
        type: FETCH_CREATE_TEAM_PARAMS_START,
        payload: {
            status: 'start',
            data: null
        }
    };
}

function fetchDataSuccess(data: any) {
    return {
        type: FETCH_CREATE_TEAM_PARAMS_SUCCESS,
        payload: {
            data,
            status: 'success',
        }
    };
}

function fetchDataFail(message: object) {
    return {
        type: FETCH_CREATE_TEAM_PARAMS_FAIL,
        payload: {
            error: message,
            data: null,
            status: 'fail',
        }
    };
}