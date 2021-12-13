import { SET_APP_BAR_LEFT_TEXT, DisplayActions,
         SET_APP_BAR_RIGHT_TEXT, RESET_ALL_DISPLAY_TEXT, SET_APP_BAR_CENTER_TEXT, SET_CURRENT_PAGE } from '../../actions';
import { IDisplayState } from '../../model/display';

export const displayReducer = {
    [SET_APP_BAR_LEFT_TEXT]
    (state: IDisplayState, action: DisplayActions<string>) {
        return {
            ...state,
            topBarTextLeft: action.payload
        };
    },
    [SET_APP_BAR_CENTER_TEXT]
    (state: IDisplayState, action: DisplayActions<string>) {
        return {
            ...state,
            topBarTextCenter: action.payload
        };
    },
    [SET_APP_BAR_RIGHT_TEXT]
    (state: IDisplayState, action: DisplayActions<string>) {
        return {
            ...state,
            topBarTextRight: action.payload
        };
    },
    [RESET_ALL_DISPLAY_TEXT]
    (state: IDisplayState, action: DisplayActions<string>) {
        return {
            ...state,
            topBarTextLeft: '',
            topBarTextCenter: '',
            topBarTextRight: ''
        };
    },
    [SET_CURRENT_PAGE]
    (state: IDisplayState, action: DisplayActions<string>) {
        return {
            ...state,
            currentPage: action.payload
        };
    }
}
