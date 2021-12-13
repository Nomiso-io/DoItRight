// import { IAuthDetails } from '../../model';
import { UserActions } from './';

export type SAVE_USER_TEAMS = 'SAVE_USER_TEAMS';
export const SAVE_USER_TEAMS: SAVE_USER_TEAMS = 'SAVE_USER_TEAMS';

export function saveUserTeams(teams: Object[]): UserActions<object> {
    return {
        type: 'SAVE_USER_TEAMS',
        payload: {
            teams
        }
    }
}