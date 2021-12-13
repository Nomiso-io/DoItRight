import { API, Handler } from '@apis/index';
import {
  appLogger,
  getAssessmentByQuestionnaire,
  getCategoryListFromQuestionnaire,
  getLatestAssessment,
  getResultLevels,
  getTeamMembers,
  responseBuilder,
} from '@utils/index';
import { Response } from 'express';
import { getResponseBody, HistoryAcknowledgement } from './getResponseBody';
// import { getTeamsManagedByUser } from './getTeamsManagedByUser';
interface HistoryRequest {
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
  query: {
    team: string;
    type: string;
    version: string;
  };
}

//TODO: This API is currently not used anywhere
async function handler(
  request: HistoryRequest,
  response: Response
): Promise<any> {
  appLogger.info({ AssessmentResultRequest: request }, 'Inside Handler');

  const { headers, query } = request;
  if (!headers.user) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Unauthorized');
    return responseBuilder.unauthorized(err, response);
  }
  // const { user: { email: userId, 'cognito:username': cognitoUserId } } = headers;
  const { team, type, version } = query;
  const userLevels = await getResultLevels();
  appLogger.info({ getResultConfig: userLevels });
  const categoryList = await getCategoryListFromQuestionnaire(type, version);
  appLogger.info({ getCategoryListFromQuestionnaire: categoryList });
  try {
    const assessmentHistoryAllTeams: {
      [key: string]: HistoryAcknowledgement;
    } = {};
    if (team === 'all') {
      const totalAssessment = await getAssessmentByQuestionnaire({
        questionnaireId: type,
        type: 'byTeam',
      });
      appLogger.info({ getAssessmentByQuestionnaire: totalAssessment });
      if (totalAssessment.length >= 0) {
        const latestAssessments = await getLatestAssessment(totalAssessment);
        appLogger.info({ getLatestAssessment: latestAssessments });
        assessmentHistoryAllTeams[type] = getResponseBody(latestAssessments);
      }
    } else {
      const teamsManagedByUser = [team];
      for (const teamManagedByUser of teamsManagedByUser) {
        const teamMembersForATeam: string[] = await getTeamMembers(
          teamManagedByUser
        );
        appLogger.info({ getTeamMembers: teamMembersForATeam });
        if (teamMembersForATeam.length === 0) {
          continue;
        }
        // teamMembersForATeam.push(userId);
        const totalAssessment = await getAssessmentByQuestionnaire({
          questionnaireId: type,
          teamMembers: teamMembersForATeam,
          type: 'byTeam',
        });
        appLogger.info({ getAssessmentByQuestionnaire: totalAssessment });
        if (totalAssessment.length === 0) {
          continue;
        }
        const latestAssessments = await getLatestAssessment(totalAssessment);
        appLogger.info({ getLatestAssessment: latestAssessments });
        assessmentHistoryAllTeams[type] = getResponseBody(latestAssessments);
      }
    }
    appLogger.info({ assessmentHistoryAllTeams });
    return responseBuilder.ok(
      {
        assessments: assessmentHistoryAllTeams[type].assessments,
        categoryList,
        userLevels,
      },
      response
    );
  } catch (err) {
    appLogger.info(err, 'noTeamsManaged');
    const noTeamsManaged: HistoryAcknowledgement = <HistoryAcknowledgement>{};
    return responseBuilder.ok(
      { teams: noTeamsManaged, userLevels, categoryList },
      response
    );
  }
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route: '/api/v2/assessment/reports',
};

// async function test(x: any,y: any){
//     const assessmentHistory: AssessmentDocument[] = await getAssessmentHistory({ userId: x, type: y });
//     const acknowledgement: HistoryAcknowledgement = getResponseBody(assessmentHistory);
//     console.log(acknowledgement);
// }

// test('rachitjobs7@gmail.com','user');
