import { SAVE_USER_DETAILS, REMOVE_USER_DETAILS, SAVE_USER_TEAM } from './auth-actions';
import { SAVE_USER_TEAMS } from './teams-actions';

export interface UserActions<T> {
    type: SAVE_USER_DETAILS | REMOVE_USER_DETAILS | SAVE_USER_TEAM | SAVE_USER_TEAMS;
    payload: T;
}

export * from './auth-actions';
export * from './teams-actions';