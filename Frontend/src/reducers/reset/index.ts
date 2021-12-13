import createReducer from '../createReducer';
import { resetReducer } from './reset-reducer';

const defaultState = {};
const resetStateReducer = {
    ...resetReducer
}
export const reset = createReducer<{}>(defaultState, resetStateReducer);
