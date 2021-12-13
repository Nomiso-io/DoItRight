import { SET_SYSTEM_DETAILS, SystemDetailsActions,
         REMOVE_SYSTEM_DETAILS, SET_SYSTEM_MODE } from '../../actions';
import { ISystemDetails, initialState } from '../../model';

export const systemValuesReducer = {
    [SET_SYSTEM_DETAILS]
    (state: ISystemDetails, action: SystemDetailsActions<ISystemDetails>) {
        return {
            ...state,
            ...action.payload
        };
    },
    [REMOVE_SYSTEM_DETAILS]
    (state: ISystemDetails, action: SystemDetailsActions<ISystemDetails>) {
        return {
            ...initialState.systemDetails
        };
    },
    [SET_SYSTEM_MODE]
    (state: ISystemDetails, action: SystemDetailsActions<string>) {
        return {
            ...state,
            mode: action.payload
        };
    }
}
