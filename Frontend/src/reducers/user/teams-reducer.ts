import {
    UserActions,
    SAVE_USER_TEAMS
} from '../../actions';
import {
    IAuthDetails
} from '../../model';

const teamsReducer = {
    [SAVE_USER_TEAMS]
        (state: IAuthDetails, action: UserActions<object>) {
        return {
            ...state,
            ...action.payload
        }
    },
}

export { teamsReducer };
