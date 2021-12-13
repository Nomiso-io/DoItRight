import createReducer from '../createReducer';
import { initialState, IAuthDetails } from '../../model';
import { authReducer } from './auth-reducer';
import { teamsReducer } from './teams-reducer';

const defaultState = initialState.user;
const userReducer = {
    ...authReducer,
    ...teamsReducer
}

export const user = createReducer<IAuthDetails>(defaultState, userReducer);
