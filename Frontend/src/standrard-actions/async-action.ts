import { Action } from 'redux';

export enum AsyncActionState {
    NotStarted = 'NotStarted',
    Initiated = 'Initiated',
    Success = 'Success',
    Failure = 'Failure'
}

export interface IAsyncAction<T> extends Action {
    status: AsyncActionState;
    type: T;
}

export interface IAsyncErrorAction<T> extends IAsyncAction<T> {
    error: string;
}