//TODO: This API is not being used any more. Can be deleted.
import { API, Handler } from '@apis/index';
//import { Questionnaire, UserDocument } from '@models/index';
import {
  appLogger,
//  AssessmentDocument,
//  getAssessmentHistory,
//  getLatestAssessment,
//  getQuestionCategoryFromQuestionnaire,
//  getQuestionDetails,
//  getQuestionnaireId,
//  getResultLevels,
//  getTeamIds,
//  getUserAllAssessment,
//  getUserDocument,
  responseBuilder,
} from '@utils/index';
import { Response } from 'express';
//import { getResponseBody, HistoryAcknowledgement } from './getResponseBody';
interface HistoryRequest {
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
  query: {
    after: string;
    limit: string;
    page: string;
    questionnaireId: string;
    questionnaireVersion: string;
    type: string;
  };
}

async function handler(
  request: HistoryRequest,
  response: Response
): Promise<any> {
  appLogger.info({ HistoryRequest: request }, 'Inside Handler');
/*
  const { headers, query } = request;
  if (!headers.user) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Unauthorized');
    return responseBuilder.unauthorized(err, response);
  }
  const {
    user: { email: userId, 'cognito:username': cognitoUserId },
  } = headers;
  const { type, questionnaireId, questionnaireVersion } = query;

  try {
    if (type === 'team') {
      const teamsManagedByUser: string[] = await getTeamIds(
        headers.user['cognito:groups'][0] === 'Admin'
          ? 'admin'
          : headers.user.email
      );
      appLogger.info({ getTeamIds: teamsManagedByUser });
      if (teamsManagedByUser.length === 0) {
        const noTeamsManaged: HistoryAcknowledgement = <
          HistoryAcknowledgement
        >{};
        return responseBuilder.ok(noTeamsManaged, response);
      }
      let totalAssessment = [];
      const assessmentHistoryAllTeams: {
        [key: string]: HistoryAcknowledgement;
      } = {};

      for (const teamManagedByUser of teamsManagedByUser) {
        totalAssessment =
          questionnaireId && questionnaireVersion
            ? await getAssessmentHistory({
                questionnaireId,
                questionnaireVersion,
                team: teamManagedByUser,
                type: 'qid_team',
                userId,
              })
            : await getAssessmentHistory({
                team: teamManagedByUser,
                type: 'team_name',
                userId,
              });
        appLogger.info({ getAssessmentHistory: totalAssessment });
        if (totalAssessment.length === 0) {
          continue;
        }
        const latestAssessments = await getLatestAssessment(totalAssessment);
        appLogger.info({ getLatestAssessment: latestAssessments });
        assessmentHistoryAllTeams[teamManagedByUser] = getResponseBody(
          latestAssessments, []
        );
      }
      if (questionnaireId) {
        const userLevels = await getResultLevels();
        appLogger.info({ getResultConfig: userLevels });
        const questionnaireDetails: Questionnaire = await getQuestionnaireId(
          questionnaireId
        );
        appLogger.info({ getQuestionnaireId: questionnaireDetails });
        const questions: string[] = questionnaireDetails.questions;
        const categoryQues = {};
        const questionsDetails = {};
        for (const questionId of questions) {
          const quesDetails = await getQuestionDetails(questionId);
          appLogger.info({ getQuestionDetails: quesDetails });
          const questionCategory = await getQuestionCategoryFromQuestionnaire(
            questionId,
            questionnaireId,
            questionnaireVersion
          );
          questionsDetails[questionId] = quesDetails;
          if (categoryQues[questionCategory]) {
            categoryQues[questionCategory] += 1;
          } else {
            categoryQues[questionCategory] = 1;
          }
        }
        appLogger.info({
          assessmentHistoryAllTeams,
          categoryQues,
          questionsDetails,
          userLevels,
        });
        return responseBuilder.ok(
          {
            categoryList: categoryQues,
            questionsDetails,
            teams: assessmentHistoryAllTeams,
            userLevels,
          },
          response
        );
      }

      return responseBuilder.ok(assessmentHistoryAllTeams, response);
    }

    if (type === 'manager') {
      const userDocument: UserDocument = await getUserDocument({
        cognitoUserId,
      });
      appLogger.info({ getUserDocument: userDocument });
      const managees: string[] = [];
      managees.push(userId);
      const manageeAssessmentHistory: AssessmentDocument[] = await getAssessmentHistory(
        { userId, type, teamMembers: managees }
      );
      appLogger.info({ getAssessmentHistory: manageeAssessmentHistory });
      return responseBuilder.ok(
        getResponseBody(manageeAssessmentHistory, []),
        response
      );
    }

    const assessmentHistory: AssessmentDocument[] = await getUserAllAssessment({
      userId,
    });
    appLogger.info({ getUserAllAssessment: assessmentHistory });
    const acknowledgement: HistoryAcknowledgement = getResponseBody(
      assessmentHistory, []
    );
    appLogger.info({ getResponseBody: acknowledgement });
    return responseBuilder.ok(acknowledgement, response);
  } catch (err) {
    const noTeamsManaged: HistoryAcknowledgement = <HistoryAcknowledgement>{};
    return responseBuilder.ok(noTeamsManaged, response);
  }
  */
  return responseBuilder.ok({}, response);
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'post',
  route: '/api/v2/assessment/history',
};
