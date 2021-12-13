export interface AllotedTeam {
    isLead: boolean;
    name: string;
}

export interface UserDocument {
    active?: boolean;
    createdBy?: string;
    createdOn?: number;
    emailId: string;
    emailVerified: string;
    id: string;
    modifiedBy?: string;
    modifiedOn?: number;
    orgId?: string;
    roles?: string[];
    teams: AllotedTeam[];
    [keyName: string]: any;
}

export interface CreateUserAttributes {
    displayName: string;
    Mandatory: boolean;
    options?: any;
    type: string;
    value?: any;
}

export interface CreateUserConfig {
    config: {
       [keyName: string]: CreateUserAttributes;
    };
    orgId: string;
}
