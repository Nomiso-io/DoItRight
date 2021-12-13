import { API, Handler } from '@apis/index';
import { AssessmentQuestion } from '@models/index';
import { config } from '@root/config';
import {
  appLogger,
  createNewAssessmentDocument,
  getQuestionCategoryFromQuestionnaire,
  getQuestionDetails,
  getQuestionsListSorted,
  getRandomize,
  getUserAssessmentType,
  responseBuilder,
} from '@utils/index';
import { Response } from 'express';

interface AssessmentQuestionRequest {
  headers: {
    user: {
      email: string;
    };
  };
  params: {
    assessmentId: string;
    index: string;
    questionnaireVersion: string;
    team: string;
    type: string;
  };
  query: {
    questionId: string;
    questionVersion: string;
  };
}

async function handler(request: AssessmentQuestionRequest, response: Response) {
  appLogger.info({ AssessmentQuestionRequest: request }, 'Inside Handler');

  const index = Number(request.params.index) - 1;
  let quesType: string;
  const teamId = request.params.team;
  const {
    questionId: queryQuestionId,
    questionVersion: queryQuestionVersion,
  } = request.query;
  try {
    const assessmentType = await getUserAssessmentType(
      request.headers.user.email,
      request.params.assessmentId
    );
    appLogger.info({ getUserAssessmentType: assessmentType });
    quesType = assessmentType;
  } catch (e) {
    const x = await createNewAssessmentDocument(
      request.headers.user.email,
      request.params.assessmentId,
      teamId,
      request.params.type,
      request.params.questionnaireVersion
    );
    appLogger.info({ createNewAssessmentDocument: x }, 'Created New');
  }
  quesType = request.params.type
    ? request.params.type
    : config.defaults.quesType;
  const questionnaireVersion = request.params.questionnaireVersion;

  try {
    const questions: string[] = await getQuestionsListSorted({
      quesType,
      version: questionnaireVersion,
    });
    appLogger.info({ getQuestionsListSorted: questions });
    const questionId: string = questions[index];
    const condition: boolean =
      queryQuestionId !== '' &&
      queryQuestionVersion !== '' &&
      questionId === queryQuestionId;
    const questionDetails: AssessmentQuestion = condition
      ? await getQuestionDetails(questionId, parseInt(queryQuestionVersion, 10))
      : await getQuestionDetails(questionId);
    appLogger.info({ getQuestionDetails: questionDetails });
    const questionCategory = await getQuestionCategoryFromQuestionnaire(
      questionId,
      quesType,
      questionnaireVersion
    );
    if (questionCategory !== '') {
      questionDetails.category = questionCategory;
    }
    questionDetails.randomize = await getRandomize(
      quesType,
      questionnaireVersion
    );
    return responseBuilder.ok(questionDetails, response);
  } catch (err) {
    appLogger.error(err, 'Internal Server Error');
    responseBuilder.internalServerError(err, response);
  }
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route:
    '/api/v2/assessment/:assessmentId/question/:index/:team/:type/:questionnaireVersion?',
};

// async function x(email: string, assessmentId: string) {
//     let quesType;
//     try {
//         const assessmentType = await getUserAssessmentType(email, assessmentId);
//         quesType = assessmentType;
//       } catch(e) {
//         console.log('Creating new Doc');
//         const x = await createNewAssessmentDocument(email, assessmentId, '7778');
//         console.log('New Created',x);
//       }
//       console.log({quesType});
// }

// x('rachitjobs7@gmail.com', '3a22b9e0-32c2-11ea-8bef-a7d58dd2eb57').then(res => {
//     console.log({res});
// }).catch(e=>{
//     console.log({e});
// })
