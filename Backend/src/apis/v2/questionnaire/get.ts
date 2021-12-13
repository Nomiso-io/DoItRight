import { API, Handler } from '@apis/index';
import { Questionnaire } from '@models/index';
import {
  getQuestionnaire,
  getQuestionnaireId,
  getQuestionnairesAssigned,
  getUserDocument,
} from '@root/utils/index';
import { appLogger, responseBuilder } from '@utils/index';
import { Response } from 'express';

interface GetQuestionnaire {
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
  query: {
    latest: boolean;
    questionnaireId: string;
    questionnaireVersion: string;
    status: string;
  };
}

/*
  Fetches questionnaires from the questionaires table
  - If requestUrl is /api/v2/questionnaire, then
    - If the query has questionnaireId and questionnaireVersion, send the questionnaire with that particular Id and version.
    - If the query has latest=true, send only the latest version of the questionnaire.
    - If the user is Admin, then
      - If query is 'status=all', fetch all questionnaires from the questionaires table
      - If no query or query is 'status=active', fetch only active questionnaires from the questionaires table
    - If the user not Admin, then fetch only the questionnaires assigned to the team the user belongs to.
*/
async function handler(request: GetQuestionnaire, response: Response) {
  appLogger.info({ GetQuestionnaire: request }, 'Inside Handler');

  try {
    if (request.query.questionnaireId && request.query.questionnaireId !== '') {
      const questionnaire = await getQuestionnaireId(
        request.query.questionnaireId,
        request.query.questionnaireVersion
      );
      appLogger.info({ getQuestionnaireId: questionnaire });
      return responseBuilder.ok(questionnaire, response);
    }

    const { user } = request.headers;
    const status = request.query.status ? request.query.status : 'active';
    const latest = request.query.latest ? request.query.latest : false;
    const fetchQuestionnaireList =
      status === 'all'
        ? await getQuestionnaire(true)
        : await getQuestionnaire(false);
    appLogger.info({ getQuestionnaire: fetchQuestionnaireList });
    const getQuestionnaireList: Questionnaire[] = [];

    // Filling the getQuestionnaireList based on the latest flag.
    for (const questionnaire of fetchQuestionnaireList) {
      if (latest) {
        let itemExist = false;
        getQuestionnaireList.forEach((el: any, i: number) => {
          if (el.questionnaireId === questionnaire.questionnaireId) {
            itemExist = true;
            if (
              parseInt(getQuestionnaireList[i].version, 10) <
              parseInt(questionnaire.version ? questionnaire.version : '1', 10)
            ) {
              getQuestionnaireList[i] = questionnaire;
            }
          }
        });
        if (!itemExist) {
          getQuestionnaireList.push(questionnaire);
        }
      } else {
        getQuestionnaireList.push(questionnaire);
      }
    }

    getQuestionnaireList.sort((a: Questionnaire, b: Questionnaire) => {
      const aStr = a.name.toLowerCase();
      const bStr = b.name.toLowerCase();
      return aStr.localeCompare(bStr);
    });

    if (user['cognito:groups'][0] === 'Admin') {
      return responseBuilder.ok(getQuestionnaireList, response);
    }

    const questionnaireList: any = [];

    const teams = (
      await getUserDocument({ cognitoUserId: user['cognito:username'] })
    ).teams[0];
    appLogger.info({ getUserDocument_first_teams: teams });
    const getList: string[] = await getQuestionnairesAssigned(
      teams ? teams.name : 'Others'
    );
    appLogger.info({ getQuestionnairesAssigned: getList });

    for (const ques of getQuestionnaireList) {
      if (getList.includes(ques.questionnaireId)) {
        questionnaireList.push(ques);
      }
    }

    appLogger.info({ questionnaireList });
    return responseBuilder.ok(questionnaireList, response);
  } catch (err) {
    appLogger.error(err, 'Internal Server Error');
    responseBuilder.internalServerError(err, response);
  }
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route: '/api/v2/questionnaire/',
};
