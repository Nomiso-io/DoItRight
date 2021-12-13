import { API, Handler } from '@apis/index';
import {
  appLogger,
  AssessmentDetails,
  checkForOldAssessment,
  getCategoryListFromQuestionnaire,
  getQuestionnaireId,
  getQuestionsListSorted,
  responseBuilder,
} from '@utils/index';
import { Response } from 'express';
import uuidv1 from 'uuid/v1';
import { getIndexesForAssessmentDetails } from './summaryFunctions';
// import { checkForOldAssessment } from '@utils/dynamoDb/checkForOldAssessment';
interface AssesssmentSummaryRequest {
  headers: {
    user: {
      email: string;
    };
  };
  params: {
    team: string;
    type: string;
  };
  query: {
    version: string;
  };
}

// tslint:disable-next-line: typedef
async function handler(request: AssesssmentSummaryRequest, response: Response) {
  appLogger.info({ AssesssmentSummaryRequest: request }, 'Inside Handler');

  const { user } = request.headers;
  //const { params } = request.params;
  if (!user) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Unauthorized');
    return responseBuilder.unauthorized(err, response);
  }

  //const { email } = user;
  let assessmentId: string = uuidv1();
  let quesType: string = request.params.type;
  let version = request.query.version;
  appLogger.info({ quesType });
  const teamId: string = request.params.team;
  const check = await checkForOldAssessment({
    quesType,
    team: teamId,
    type: 'user',
    userId: user.email,
  });
  appLogger.info({ checkForOldAssessment: check });
  const questionnaire = await getQuestionnaireId(quesType, version);
  if (check && !questionnaire.timeOut) {
    try {
      const assessmentDetails = <AssessmentDetails>check.assessmentDetails;
      assessmentId = check.assessmentId;
      quesType = check.type ? check.type : quesType;
      version = check.questionnaireVersion
        ? check.questionnaireVersion
        : version;
      const assessmentDetailsWithIndex = await getIndexesForAssessmentDetails(
        assessmentDetails,
        quesType,
        version
      );
      const description = questionnaire.description
        ? questionnaire.description
        : 'false';
      appLogger.info({ getQuestionnaireId: questionnaire });
      const categoryList = await getCategoryListFromQuestionnaire(
        quesType,
        version
      );
      appLogger.info({ getCategoryListFromQuestionnaire: categoryList });
      const questions: string[] = await getQuestionsListSorted({
        quesType,
        version,
      });
      appLogger.info({ getQuestionsListSorted: questions });
      const timeOut = questionnaire.timeOut ? questionnaire.timeOut : false;
      const timeOutTime = questionnaire.timeOutTime
        ? questionnaire.timeOutTime
        : 0;
      const warningTimePercentage = questionnaire.warningTimePercentage
        ? questionnaire.warningTimePercentage
        : 0;
      const hideResult = questionnaire.hideResult
        ? questionnaire.hideResult
        : false;

      if (questions.length <= 0) {
        const cannotFindAssesssmentDetails: Error = new Error(
          'Cannot find assessment details'
        );
        appLogger.error(
          { err: cannotFindAssesssmentDetails },
          'Internal Server Error'
        );
        return responseBuilder.internalServerError(
          cannotFindAssesssmentDetails,
          response
        );
      }

      return responseBuilder.ok(
        {
          assessmentId,
          categoryList,
          description,
          hideResult,
          markedAnswers: assessmentDetailsWithIndex,
          numberOfQuestions: questions.length,
          timeOut,
          timeOutTime,
          type: quesType,
          version,
          warningTimePercentage,
        },
        response
      );
    } catch (err) {
      appLogger.error(err, 'Internal Server Error');
      responseBuilder.internalServerError(err, response);
    }
  } else {
    try {
      //           quesType = request.params.type ? request.params.type : quesType;
      //           appLogger.info({quesType});
      const description = questionnaire.description
        ? questionnaire.description
        : 'false';
      appLogger.info({ getQuestionnaireId: questionnaire });
      const categoryList = await getCategoryListFromQuestionnaire(
        quesType,
        version
      );
      appLogger.info({ getCategoryListFromQuestionnaire: categoryList });
      const questions: string[] = await getQuestionsListSorted({
        quesType,
        version,
      });
      appLogger.info({ getQuestionsListSorted: questions });
      //await createNewAssessmentDocument(email, assessmentId, quesType);
      const timeOut = questionnaire.timeOut ? questionnaire.timeOut : false;
      const timeOutTime = questionnaire.timeOutTime
        ? questionnaire.timeOutTime
        : 0;
      const warningTimePercentage = questionnaire.warningTimePercentage
        ? questionnaire.warningTimePercentage
        : 0;
      const hideResult = questionnaire.hideResult
        ? questionnaire.hideResult
        : false;

      if (questions.length <= 0) {
        const cannotFindAssesssmentDetails: Error = new Error(
          'Cannot find assessment details'
        );
        appLogger.error(
          { err: cannotFindAssesssmentDetails },
          'Internal Server Error'
        );
        return responseBuilder.internalServerError(
          cannotFindAssesssmentDetails,
          response
        );
      }

      return responseBuilder.ok(
        {
          assessmentId,
          categoryList,
          description,
          hideResult,
          numberOfQuestions: questions.length,
          timeOut,
          timeOutTime,
          type: quesType,
          version,
          warningTimePercentage,
        },
        response
      );
    } catch (err) {
      appLogger.error(err, 'Internal Server Error');
      responseBuilder.internalServerError(err, response);
    }
  }
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route: '/api/v2/assessment/summary/:team/:type',
};
