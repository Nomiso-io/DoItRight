import { CorsOptions } from 'cors';

export interface Config {
  cognito: {
    appClientId: string;
    appClientURL: string;
    userPoolId: string;
  };
  cors: CorsOptions;
  defaults: {
    groups: string[];
    orgId: string;
    quesType: string;
    scoreCoeff: number;
    subDomain: {
      [key: string]: string;
    };
    teamName: string;
  };
  elasticsearch: {
    password: string;
    url: string;
    username: string;
  };
  metricsTables: {
    [key: string]: string;
  };
  precedenceOrder: {
    [key: string]: number;
  };
  region: string;
  statusCodes: {
    [key: string]: number;
  };
  tables: {
    [key: string]: string;
  };
}

export const config: Config = {
  cognito: {
    appClientId: '',
    appClientURL: '',
    userPoolId: '',
  },
  cors: {
    origin: true,
  },
  defaults: {
    groups: ['Member'],
    orgId: 'www', // default should be 'www' //pinimbus env
    quesType: '1234',
    scoreCoeff: 10,
    subDomain: {
      development: 'dev',
      local: 'dev',
      qa: 'qa',
    },
    teamName: 'Others',
  },
  elasticsearch: {
    password: '', //change based on where to deploy
    url: 'http://localhost:9200', //nomiso - dev& beta //change based on where to deploy
    username: 'doitright-user', //change based on where to deploy
  },
  metricsTables: {
    buildTable: 'build-data',
    gitlabCommitTable: 'gitlab-commit-data',
    incidentTable: 'incident-data',
    qualityTable: 'quality-data',
    repoTable: 'repo-data',
    reqTable: 'req-data',
  },
  precedenceOrder: {
    Admin: 1,
    Manager: 2,
    Member: 3,
  },
  region: 'us-east-1', //pinimbus env //change based on where to deploy
  statusCodes: {
    badRequest: 400,
    forbidden: 403,
    internalServerError: 500,
    notFound: 404,
    ok: 200,
    unauthorized: 401,
  },
  tables: {
    assessments: 'UserAssessments',
    cognitoUsers: 'CognitoUsers',
    configs: 'Configs',
    questionnaires: 'Questionnaires',
    questions: 'Questions',
    team: 'Team',
  },
};
