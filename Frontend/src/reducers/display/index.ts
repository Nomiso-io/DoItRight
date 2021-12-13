import { IDisplayState } from '../../model/display';
import { displayReducer } from './display-reducer';
import createReducer from '../createReducer';
import { initialState } from '../../model';

const defaultState = initialState.display;
const displayStateReducer = {
    ...displayReducer,
}

export const display = createReducer<IDisplayState>(defaultState, displayStateReducer);
