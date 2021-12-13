import { ITeamInfo } from '../index';

export interface IAuthDetails {
    idToken: string | null;
    accessToken: string | null;
    userDetails: any | null;
    team: string | null;
    roles: string[] | null;
    teams: ITeamInfo[];
}