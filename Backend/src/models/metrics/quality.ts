export interface QualityGraphDataItem {
  // complexity: number;
  coverage: number;
  duplications: number;
  // issues: number;
  // severity: number;
  maintainability: number;
//  projectName: string;
  // qualityGates: number;
  reliability: number;
  security: number;
  // size: number;
  // tests: number;
//  teamId: string;
  timestamp: number;
//  url: string;
}

export interface QualityListDataItem {
  // complexity: number;
  coverage: number;
  duplications: number;
  // issues: number;
  // severity: number;
  maintainability: number;
  projectName: string;
  // qualityGates: number;
  reliability: number;
  security: number;
  // size: number;
  // tests: number;
  service: string;
  teamId: string;
//  timestamp: number;
  url: string;
}

export interface QualityDatabaseDataItem {
  // complexity: number;
  coverage: number;
  duplications: number;
  // issues: number;
  // severity: number;
  maintainability: number;
  projectName: string;
  // qualityGates: number;
  reliability: number;
  security: number;
  // size: number;
  // tests: number;
  servicePath: string;
  teamId: string;
  timestamp: number;
  url: string;
}
/*
//TODO: This is the right structure. Change database methods to use this.

export interface QualityDatabaseDataItem {
  teamId: string,
  projectName: string,
  metrics: string;
  timestamp: number;
  value: number;
  url:string;
}
*/

//export const STATUS_RAISED = 'Raised';
//export const STATUS_ACCEPTED = 'Accepted';
//export const STATUS_REJECTED = 'Rejected';
