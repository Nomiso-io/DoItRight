import {
    SAVE_USER_DETAILS,
    REMOVE_USER_DETAILS,
    UserActions,
    SAVE_USER_TEAM
} from '../../actions';
import {
    IAuthDetails, initialState
} from '../../model';

const authReducer = {
    [SAVE_USER_DETAILS]
        (state: IAuthDetails, action: UserActions<IAuthDetails>) {
        return {
            ...state,
            ...action.payload
        }
    },
    [SAVE_USER_TEAM]
        (state: IAuthDetails, action: UserActions<object>) {
        return {
            ...state,
            ...action.payload
        }
    },
    [REMOVE_USER_DETAILS]
        (state: IAuthDetails, action: UserActions<IAuthDetails>) {
        return {
            ...initialState.user
        }
    },
}

export { authReducer };
