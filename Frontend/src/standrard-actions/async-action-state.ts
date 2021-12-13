import { AsyncActions } from './';

export interface AsyncActionState {
    status: AsyncActions.AsyncActionState;
    error?: string;
}
