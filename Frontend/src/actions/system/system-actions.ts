import { ISystemDetails } from '../../model';
import { SystemDetailsActions } from './';

export type SET_SYSTEM_DETAILS = 'SET_SYSTEM_DETAILS';
export const SET_SYSTEM_DETAILS: SET_SYSTEM_DETAILS = 'SET_SYSTEM_DETAILS';

export type REMOVE_SYSTEM_DETAILS = 'REMOVE_SYSTEM_DETAILS';
export const REMOVE_SYSTEM_DETAILS: REMOVE_SYSTEM_DETAILS = 'REMOVE_SYSTEM_DETAILS';

export type SET_SYSTEM_MODE = 'SET_SYSTEM_MODE';
export const SET_SYSTEM_MODE: SET_SYSTEM_MODE = 'SET_SYSTEM_MODE';

export function setSystemDetails(data: ISystemDetails): SystemDetailsActions<ISystemDetails> {
    return {
        type: SET_SYSTEM_DETAILS,
        payload: {
            ...data
        }
    }
}

export function removeSystemDetails(): SystemDetailsActions<{}> {
    return {
        type: REMOVE_SYSTEM_DETAILS,
        payload: {}
    }
}

export function setSystemMode(data: string): SystemDetailsActions<string> {
    return {
        type: SET_SYSTEM_MODE,
        payload: data
    }
}

