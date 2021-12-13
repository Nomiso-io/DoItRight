import { CREATE_TEAM_ACTIONS } from './create-team-action';

export interface AdminActions<T> {
    type: CREATE_TEAM_ACTIONS;
    payload: T;
}

export * from './create-team-action';