import createReducer from '../createReducer';
import { initialState, ISystemDetails } from '../../model';
import { systemValuesReducer } from './system-details-reducer';

const defaultState = initialState.systemDetails;
const systemDetailsReducer = {
    ...systemValuesReducer,
}

export const systemDetails = createReducer<ISystemDetails>(defaultState, systemDetailsReducer);
