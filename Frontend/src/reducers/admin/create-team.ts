import { IAdmin, ICreateTeamParamsRequest } from "../../model";
import { FETCH_CREATE_TEAM_PARAMS_START, AdminActions,
     FETCH_CREATE_TEAM_PARAMS_SUCCESS, FETCH_CREATE_TEAM_PARAMS_FAIL } from "../../actions";

export const adminCreateTeamReducer = {
    [FETCH_CREATE_TEAM_PARAMS_START]
    (state: IAdmin, action: AdminActions<ICreateTeamParamsRequest>) {
        return {
            ...state,
            createTeamParams: {
                ...action.payload
            }
        };
    },
    [FETCH_CREATE_TEAM_PARAMS_SUCCESS]
    (state: IAdmin, action: AdminActions<ICreateTeamParamsRequest>) {
        return {
            ...state,
            createTeamParams: {
                ...action.payload
            }
        };
    },
    [FETCH_CREATE_TEAM_PARAMS_FAIL]
    (state: IAdmin, action: AdminActions<ICreateTeamParamsRequest>) {
        return {
            ...state,
            createTeamParams: {
                ...action.payload
            }
        };
    }
}