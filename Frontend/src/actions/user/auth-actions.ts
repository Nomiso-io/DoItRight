import { IAuthDetails } from '../../model';
import { UserActions } from './';

export type SAVE_USER_DETAILS = 'SAVE_USER_DETAILS';
export const SAVE_USER_DETAILS: SAVE_USER_DETAILS = 'SAVE_USER_DETAILS';

export type SAVE_USER_TEAM = 'SAVE_USER_TEAM';
export const SAVE_USER_TEAM: SAVE_USER_TEAM = 'SAVE_USER_TEAM';

export type REMOVE_USER_DETAILS = 'REMOVE_USER_DETAILS';
export const REMOVE_USER_DETAILS: REMOVE_USER_DETAILS = 'REMOVE_USER_DETAILS';

export function saveUserDetails(data: IAuthDetails): UserActions<IAuthDetails> {
    return {
        type: 'SAVE_USER_DETAILS',
        payload: {
            ...data
        }
    }
}

export function saveUserTeam(teamId: string): UserActions<object> {
    return {
        type: 'SAVE_USER_TEAM',
        payload: {
            team: teamId
        }
    }
}

export function removeUserDetails(): UserActions<{}> {
    return {
        type: 'REMOVE_USER_DETAILS',
        payload: {}
    }
}