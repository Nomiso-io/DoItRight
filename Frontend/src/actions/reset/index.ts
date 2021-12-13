import { RESET_STATE } from './reset-actions';

export interface ResetActions<T> {
    type: RESET_STATE;
    payload: T;
}

export * from './reset-actions';