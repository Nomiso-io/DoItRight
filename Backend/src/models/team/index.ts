
export interface TeamInfo {
    active: string;
    createdBy?: string;
    createdOn?: number;
    manager?: string;
    managerId?: string;
    metrics?: MetricsTool[];
    order: string[];
    services?: ServiceInfo[];
    teamId: string;
    teamName: string;
    [keyName: string]: any;
}
/*
export interface TeamAttributes {
    displayName: string;
    Mandatory: boolean;
    options?: any;
    type: string;
    value?: any;
}

export interface CreateTeamConfig {
    config: {
       [keyName: string]: FieldConfigAttributes;
    };
    orgId: string;
}
*/
export interface MetricsTool {
    enabled: boolean;
    toolName: string;
    toolType: string;
    [keyName: string]: any;
}

export interface ServiceInfo {
    active: string;
    createdBy?: string;
    createdOn?: number;
    id: string;
    metrics?: MetricsTool[];
    name: string;
    services?: ServiceInfo[];
    [keyName: string]: any;
  }
