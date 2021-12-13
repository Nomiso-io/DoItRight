import createReducer from '../createReducer';
import { initialState, IAdmin } from '../../model';
import { adminCreateTeamReducer } from './create-team';

const defaultState = initialState.admin;

const adminReducers = {
    ...adminCreateTeamReducer
}

export const admin = createReducer<IAdmin>(defaultState, adminReducers);
