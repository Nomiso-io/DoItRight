import { Application, Request, Response } from 'express';
import { api as postAssessmentAnswerV2 } from './v2/answer/post';
import { api as getAssignmentV2 } from './v2/assignments/get';
import { api as postAssignmentV2 } from './v2/assignments/post';
import { api as getQuestionV2 } from './v2/createQuestion/get';
import { api as createQuestionV2 } from './v2/createQuestion/post';
import { api as updateQuestionV2 } from './v2/createQuestion/put';
import { api as deactivateTeamsConfigV2 } from './v2/createTeam/delete';
import { api as getTeamsConfigV2 } from './v2/createTeam/get';
import { api as createTeamsConfigV2 } from './v2/createTeam/post';
import { api as updateTeamsConfigV2 } from './v2/createTeam/put';
import { api as getAssessmentDetailsV2 } from './v2/details/get';
import { api as dowloadReportsV2 } from './v2/downloadReports/get';
import { api as getFeedbackV2 } from './v2/feedback/get';
import { api as postFeedbackV2 } from './v2/feedback/post';
import { api as getAssessmentHistoryV2 } from './v2/history/get';
import { api as postAssessmentHistoryV2 } from './v2/history/post';
import { api as getAssessmentQuestionV2 } from './v2/question/get';
import { api as getQuestionnaireV2 } from './v2/questionnaire/get';
import { api as postQuestionnaireV2 } from './v2/questionnaire/post';
import { api as putQuestionnaireV2 } from './v2/questionnaire/put';
import { api as reportsV2 } from './v2/reports/get';
import { api as getAssementResultV2 } from './v2/result/get';
import { api as getSystemSettingsV2 } from './v2/settings/get';
import { api as postSystemSettingsV2 } from './v2/settings/post';
import { api as getAssessmentSummaryV2 } from './v2/summary/get';
import { api as getAssessmentAndTeamDetailsV2 } from './v2/teamAndAssessmentList/get';
import { api as getTeamsV2 } from './v2/teams/get';
import { api as addTeamsV2 } from './v2/teams/post';
import { api as deleteUsersV2 } from './v2/userManagement/delete';
import { api as getUserstV2 } from './v2/userManagement/get';
import { api as createUsersV2 } from './v2/userManagement/post';
import { api as updateUsersV2 } from './v2/userManagement/put';

import { api as buildMetrics } from './metrics/builds/get';
import { api as doraMetrics } from './metrics/dora/get';
import { api as qualityMetrics } from './metrics/quality/get';
import { api as reposMetrics } from './metrics/repos/get';
import { api as reqsMetrics } from './metrics/reqs/get';
import { api as getMetricsTools } from './metrics/teamMetricsTool/get';
import { api as setMetricsTools } from './metrics/teamMetricsTool/post';
import { api as testConnection } from './metrics/toolsConnect/post';

export type Handler = (request: Request, response: Response) => void;
export interface API {
  handler: Handler;
  method: string;
  route: string;
}

const apis: API[] = [
  getSystemSettingsV2,
  postSystemSettingsV2,
  createTeamsConfigV2,
  getAssessmentSummaryV2,
  getAssessmentQuestionV2,
  postAssessmentAnswerV2,
  getAssementResultV2,
  postFeedbackV2,
  getFeedbackV2,
  getAssessmentAndTeamDetailsV2,
  getAssessmentHistoryV2,
  getAssessmentDetailsV2,
  getTeamsConfigV2,
  getTeamsV2,
  addTeamsV2,
  getQuestionnaireV2,
  getAssignmentV2,
  postAssignmentV2,
  updateTeamsConfigV2,
  deactivateTeamsConfigV2,
  createUsersV2,
  updateUsersV2,
  getUserstV2,
  deleteUsersV2,
  reportsV2,
  createQuestionV2,
  postAssessmentHistoryV2,
  getQuestionV2,
  putQuestionnaireV2,
  postQuestionnaireV2,
  updateQuestionV2,
  dowloadReportsV2,
];

const metricsApis: API[] = [
  getMetricsTools,
  setMetricsTools,
  buildMetrics,
  reposMetrics,
  reqsMetrics,
  qualityMetrics,
  doraMetrics,
  testConnection,
];

export function registerApis(application: Application): void {
  apis.forEach((api: API) => {
    // tslint:disable-next-line: no-unsafe-any
    application[api.method](api.route, api.handler);
  });
}

export function registerMetricsApis(application: Application): void {
  metricsApis.forEach((api: API) => {
    // tslint:disable-next-line: no-unsafe-any
    application[api.method](api.route, api.handler);
  });
}
