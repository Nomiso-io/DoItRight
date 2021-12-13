import { API, Handler } from '@apis/index';
import { Question } from '@models/index';
import {
  appLogger,
  AssessmentDetails,
  AssessmentDocument,
  getQuestionDetailsMulti,
  getUserAssessment,
  getUserAssessmentFromIndex,
  responseBuilder,
} from '@utils/index';
import { Response } from 'express';
import { correctResult } from '../result/get';
import { DetailsAcknowledgement, getResponseBody } from './getResponseBody';

interface DetailsRequest {
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
  params: {
    assessmentId: string;
  };
  query: {
    isResult: string;
  };
}

async function handler(
  request: DetailsRequest,
  response: Response
): Promise<any> {
  appLogger.info({ DetailsRequest: request }, 'Inside Handler');

  const { params } = request;
  const { assessmentId } = params;
  const { email } = request.headers.user;
  const { isResult } = request.query;

  try {
    const assessmentDocument: AssessmentDocument =
      isResult === 'true'
        ? await getUserAssessment({ userId: email, assessmentId })
        : await getUserAssessmentFromIndex({ assessmentId });
    appLogger.info({
      getUserAssessment_getUserAssessmentFromIndex: assessmentDocument,
    });
    assessmentDocument.result = await correctResult(assessmentDocument); // TODO: Added this call as temporary fix on 10Mar21. Remove it later.
    const assessmentDetails = <AssessmentDetails>(
      assessmentDocument.assessmentDetails
    );
    const questionIds: string[] = Object.keys(assessmentDetails);
    const questionDetailsArr: Question[] = await getQuestionDetailsMulti({
      questionIds,
    });
    appLogger.info({ getQuestionDetailsMulti: questionDetailsArr });
    const acknowledgement: DetailsAcknowledgement = await getResponseBody({
      assessmentDocument,
      questionDetailsArr,
    });
    appLogger.info({ getResponseBody: acknowledgement });
    return responseBuilder.ok(acknowledgement, response);
  } catch (err) {
    appLogger.error(err, 'Internal Server Error');
    responseBuilder.internalServerError(err, response);
  }
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route: '/api/v2/assessment/:assessmentId/details',
};

// async function test(assessmentId: string, email: string): Promise<any> {
//     try {
//         const assessmentDocument: AssessmentDocument = await getUserAssessment({ userId: email, assessmentId });
//         // console.log(assessmentDocument);
//         const assessmentDetails = <AssessmentDetails>assessmentDocument.assessmentDetails;
//         const questionIds: string[] = Object.keys(assessmentDetails);
//         console.log('questionIds');
//         const questionDetailsArr: QuestionDetails[] = await getQuestionDetailsMulti({ questionIds });
//         console.log('doneq')
//         const recommendations = await getRecommendations(assessmentId, assessmentDocument);
//         console.log('done')
//         const acknowledgement: any = getResponseBody({ questionDetailsArr, assessmentDocument, recommendations });
//         return acknowledgement;
//     } catch (err) {
//         console.error(err);
//         return err;
//     }
// }
// test('2c590ab0-5f65-11ea-af93-67c528d57bb0','anshul.bhatnagar@sling.com').then(res=>{
//     console.log(res.result);
// }).catch(e=>{
// 	console.log(e);
// })
