import { SET_SYSTEM_DETAILS, REMOVE_SYSTEM_DETAILS, SET_SYSTEM_MODE } from './system-actions';

export interface SystemDetailsActions<T> {
    type: SET_SYSTEM_DETAILS | REMOVE_SYSTEM_DETAILS | SET_SYSTEM_MODE;
    payload: T;
}

export * from './system-actions';