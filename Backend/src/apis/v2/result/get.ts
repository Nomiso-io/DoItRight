import { API, Handler } from '@apis/index';
import { Question } from '@models/index';
import {
  addResultToAssessmentDocument,
  appLogger,
  AssessmentDetails,
  AssessmentDocument,
  getQuestionDetailsMulti,
  getQuestionIds,
  getResult,
  getResultLevels,
  responseBuilder,
  Result,
} from '@utils/index';
import { Response } from 'express';
import {
  DetailsAcknowledgement,
  getResponseBody,
} from '../details/getResponseBody';
import { calculateResult } from './calculateResult';
import { calculatePercentage, determineUserLevel } from './getResponseBody';

interface AssessmentResultRequest {
  headers: {
    user: {
      email: string;
    };
  };
  params: {
    assessmentId: string;
  };
}

async function handler(request: AssessmentResultRequest, response: Response) {
  appLogger.info({ AssessmentResultRequest: request }, 'Inside Handler');

  const { headers, params } = request;
  if (!headers.user) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Unauthorized');
    return responseBuilder.unauthorized(err, response);
  }
  const {
    user: { email: userId },
  } = headers;
  const { assessmentId } = params;

  try {
    const assessmentDocument: AssessmentDocument = await getResult({
      assessmentId,
      userId,
    });
    appLogger.info({ getResult: assessmentDocument });
    // if (assessmentDocument && assessmentDocument.result) {
    //     const preCalculatedResult: AssessmentResultResponse = getResponseBody(assessmentDocument);
    //     appLogger.info({preCalculatedResult});
    //     return responseBuilder.ok(preCalculatedResult, response);
    // }

    const userAssessmentDetails:
      | AssessmentDetails
      | undefined = assessmentDocument
      ? assessmentDocument.assessmentDetails
      : undefined;
    appLogger.info({ getUserAssessmentDetails: userAssessmentDetails });
    if (!userAssessmentDetails) {
      const err = new Error(
        `Assessment: ${assessmentId} does not exist for ${userId}`
      );
      appLogger.error(err);
      throw err;
    }

    const { date, type, questionnaireVersion } = assessmentDocument;
    // In case of the timed assessments, the assessment can be submitted partially answered
    // So we don't have the versions of the unanswered questions stored in our UserAssessment tables
    // But to calculate the result we need both answered and unanswered question data.
    // So answered and unanswered question data need to be fetched separately here.
    const questionIdsAnswered: string[] = Object.keys(userAssessmentDetails);
    appLogger.info({ questionIdsAnswered });
    const questionDetailsAnsweredQuestions: Question[] =
      questionIdsAnswered.length > 0
        ? await getQuestionDetailsMulti({ questionIds: questionIdsAnswered })
        : [];
    const questionIdsAll: string[] = await getQuestionIds(
      type,
      questionnaireVersion
    );
    appLogger.info({ questionIdsAll });
    // Removing answered questions from the all question data.
    const questionIdsUnanswered: string[] = [...questionIdsAll];
    for (const questionId of questionIdsAll) {
      for (const qId of questionIdsAnswered) {
        if (qId.startsWith(questionId)) {
          appLogger.info(`Removing ${questionId}`);
          questionIdsUnanswered.splice(
            questionIdsUnanswered.indexOf(questionId),
            1
          );
        }
      }
    }
    appLogger.info({ questionIdsUnanswered });
    // Here we don't have the question version so we will fetch the latest version details only.
    const questionDetailsUnansweredQuestions: Question[] =
      questionIdsUnanswered.length > 0
        ? await getQuestionDetailsMulti({ questionIds: questionIdsUnanswered })
        : [];
    const questionDetails: Question[] = [
      ...questionDetailsAnsweredQuestions,
      ...questionDetailsUnansweredQuestions,
    ];
    appLogger.info({ questionDetails });
    const userLevels = await getResultLevels();
    appLogger.info({ getResultConfig: userLevels });
    const result: Result = await calculateResult(
      date,
      userAssessmentDetails,
      questionDetails,
      assessmentId,
      type,
      questionnaireVersion
    );
    appLogger.info({ calculateResult: result });
    result.percentage = calculatePercentage(result);
    result.level = determineUserLevel(result.percentage, userLevels);
    appLogger.info({ result });
    assessmentDocument.result = result;
    assessmentDocument.dateSubmit = new Date().getTime();
    // const acknowledgement: AssessmentResultResponse = getResponseBody(assessmentDocument);
    // tslint:disable-next-line: no-floating-promises
    const acknowledgement: DetailsAcknowledgement = await getResponseBody({
      assessmentDocument,
      questionDetailsArr: questionDetails,
    });
    appLogger.info({ getResponseBody: acknowledgement });
    if (acknowledgement.result) {
      await addResultToAssessmentDocument({
        assessmentId,
        dateSubmit: assessmentDocument.dateSubmit,
        result: acknowledgement.result,
        userId,
      });
      appLogger.info({ addResultToAssessmentDocument: acknowledgement });
    }
    return responseBuilder.ok(acknowledgement, response);
  } catch (err) {
    appLogger.error(err, 'Internal Server Error');
    responseBuilder.internalServerError(err, response);
  }
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route: '/api/v2/assessment/:assessmentId/result',
};

/*--------------------
 TODO: Added below function as temporary fix on 10Mar21. Remove it later.
---------------------*/
export async function correctResult(
  assessmentDocument: AssessmentDocument
): Promise<Result> {
  const userAssessmentDetails:
    | AssessmentDetails
    | undefined = assessmentDocument
    ? assessmentDocument.assessmentDetails
    : undefined;
  if (!userAssessmentDetails) {
    const err = new Error(`Assessment does not exist`);
    appLogger.error(err);
    throw err;
  }
  const {
    assessmentId,
    date,
    type,
    questionnaireVersion,
    userId,
  } = assessmentDocument;
  const questionIdsAnswered: string[] = Object.keys(userAssessmentDetails);
  appLogger.info({ questionIdsAnswered });
  const questionDetailsAnsweredQuestions: Question[] =
    questionIdsAnswered.length > 0
      ? await getQuestionDetailsMulti({ questionIds: questionIdsAnswered })
      : [];
  const questionIdsAll: string[] = await getQuestionIds(
    type,
    questionnaireVersion
  );
  appLogger.info({ questionIdsAll });
  // Removing answered questions from the all question data.
  const questionIdsUnanswered: string[] = [...questionIdsAll];
  for (const questionId of questionIdsAll) {
    for (const qId of questionIdsAnswered) {
      if (qId.startsWith(questionId)) {
        appLogger.info(`Removing ${questionId}`);
        questionIdsUnanswered.splice(
          questionIdsUnanswered.indexOf(questionId),
          1
        );
      }
    }
  }
  appLogger.info({ questionIdsUnanswered });
  // Here we don't have the question version so we will fetch the latest version details only.
  const questionDetailsUnansweredQuestions: Question[] =
    questionIdsUnanswered.length > 0
      ? await getQuestionDetailsMulti({ questionIds: questionIdsUnanswered })
      : [];
  const questionDetails: Question[] = [
    ...questionDetailsAnsweredQuestions,
    ...questionDetailsUnansweredQuestions,
  ];
  appLogger.info({ questionDetails });
  const userLevels = await getResultLevels();
  appLogger.info({ getResultConfig: userLevels });
  const result: Result = await calculateResult(
    date,
    userAssessmentDetails,
    questionDetails,
    assessmentId,
    type,
    questionnaireVersion
  );
  appLogger.info({ calculateResult: result });
  result.percentage = calculatePercentage(result);
  result.level = determineUserLevel(result.percentage, userLevels);
  appLogger.info({ result });
  assessmentDocument.result = result;
  const dateSubmit = assessmentDocument.dateSubmit
    ? assessmentDocument.dateSubmit
    : new Date().getTime();
  await addResultToAssessmentDocument({
    assessmentId,
    dateSubmit,
    result,
    userId,
  });
  return result;
}
