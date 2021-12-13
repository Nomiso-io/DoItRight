type SET_APP_BAR_LEFT_TEXT = 'SET_APP_BAR_LEFT_TEXT';
export const SET_APP_BAR_LEFT_TEXT: SET_APP_BAR_LEFT_TEXT =
    'SET_APP_BAR_LEFT_TEXT';

type SET_APP_BAR_CENTER_TEXT = 'SET_APP_BAR_CENTER_TEXT';
export const SET_APP_BAR_CENTER_TEXT: SET_APP_BAR_CENTER_TEXT =
    'SET_APP_BAR_CENTER_TEXT';

type SET_APP_BAR_RIGHT_TEXT = 'SET_APP_BAR_RIGHT_TEXT';
export const SET_APP_BAR_RIGHT_TEXT: SET_APP_BAR_RIGHT_TEXT =
    'SET_APP_BAR_RIGHT_TEXT';

type RESET_ALL_DISPLAY_TEXT = 'RESET_ALL_DISPLAY_TEXT';
export const RESET_ALL_DISPLAY_TEXT: RESET_ALL_DISPLAY_TEXT =
    'RESET_ALL_DISPLAY_TEXT';

type SET_CURRENT_PAGE = 'SET_CURRENT_PAGE';
export const SET_CURRENT_PAGE: SET_CURRENT_PAGE =
    'SET_CURRENT_PAGE';

export type DISPLAY_ACTIONS = SET_APP_BAR_LEFT_TEXT |
    SET_APP_BAR_CENTER_TEXT |
    SET_APP_BAR_RIGHT_TEXT |
    RESET_ALL_DISPLAY_TEXT |
    SET_CURRENT_PAGE;

export function setAppBarLeftText(text: string) {
    return {
        type: 'SET_APP_BAR_LEFT_TEXT',
        payload: text
    }
}

export function setAppBarCenterText(text: string) {
    return {
        type: 'SET_APP_BAR_CENTER_TEXT',
        payload: text
    }
}

export function setAppBarRightText(text: string) {
    return {
        type: 'SET_APP_BAR_RIGHT_TEXT',
        payload: text
    }
}

export function resetBothDisplayText() {
    return {
        type: 'RESET_ALL_DISPLAY_TEXT',
    }
}

export function setCurrentPage(page: string) {
    return {
        type: SET_CURRENT_PAGE,
        payload: page
    }
}