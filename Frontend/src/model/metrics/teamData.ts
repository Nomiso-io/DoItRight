import  { ICollectorConfigDetails } from '..';

export interface ITeamMetricsDetails {
    config: ICollectorConfigDetails,
    orgId: string,
    metrics: IMetricsTool[];
    services: IServices[];
    teamId: string;
    teamName: string;
}

export interface IServices {
    active: string;
    id: string;
    name: boolean;
    services: IServices[];
    metrics: IMetricsTool[];
}

export interface IMetricsTool {
    toolName: string;
    toolType: string;
    enabled: boolean;
    [keyName: string]: any;
}
