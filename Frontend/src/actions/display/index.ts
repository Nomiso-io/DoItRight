import { DISPLAY_ACTIONS } from './display-action';

export interface DisplayActions<T> {
    type: DISPLAY_ACTIONS;
    payload: T;
}

export * from './display-action';