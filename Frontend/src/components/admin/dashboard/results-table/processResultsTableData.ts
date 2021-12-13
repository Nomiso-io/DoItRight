import { IResponseData } from '../common/common';
import { IResultsTable } from './resultsTable';
import {
  getQuestionIdFromCompositeQuestionId /*, getVersionFromCompositeQuestionId*/,
} from '../../../../utils/data';
//import { calculateSortFactor } from './tableSort';

export const processResultsTableData = (
  responseData: IResponseData,
  teamId: string
) => {
  const questionsDetails = responseData.questionsDetails;
  const questionIds = Object.keys(questionsDetails);
  // const tableHeadData = ['Questions'];
  const returnData: IResultsTable = {};
  const { weightageCoefficient } = responseData;
  try {
    //initilize each question's details
    questionIds.forEach((el) => {
      const questionId = responseData.questionsDetails[el].id;
      const question = responseData.questionsDetails[el].question;
      const category = responseData.questionsDetails[el].category;
      const weightage: any = {};
      // Initializing the weightage array with 0 values
      Object.keys(questionsDetails[el].answers).forEach((a) => {
        weightage[
          questionsDetails[el].answers[a].weightageFactor * weightageCoefficient
        ] = 0;
      });
      returnData[questionId] = {
        question,
        category,
        weightage,
        sortFactor: 0,
      };
    });
    //calculate number of responses/answers under each weightage of each question
    Object.keys(responseData.teams).forEach((team: string) => {
      if (teamId === 'all' || teamId === team) {
        responseData.teams[team].assessments.forEach((assessment: any) => {
          if (assessment && assessment.assessmentDetails) {
            Object.keys(assessment.assessmentDetails).forEach(
              (questId: string) => {
                const questionId =
                  getQuestionIdFromCompositeQuestionId(questId);
                //              const questionVersion = getVersionFromCompositeQuestionId(questId);
                //              const answerSelected = assessment.assessmentDetails[questId].answers[0]; // here we will use questId as we are accessing the assessment details array.
                const answersSelected =
                  assessment.assessmentDetails[questId].answers; // here we will use questId as we are accessing the assessment details array.
                // const numberOfAnswers = answersSelected.length;
                if (answersSelected[0] !== '@N/A') {
                  if (
                    returnData[questionId] &&
                    returnData[questionId].weightage &&
                    questionsDetails[questionId] &&
                    questionsDetails[questionId].answers &&
                    questionsDetails[questionId].answers[answersSelected[0]] &&
                    questionsDetails[questionId].answers[answersSelected[0]]
                      .weightageFactor &&
                    typeof returnData[questionId].weightage[
                      (
                        questionsDetails[questionId].answers[answersSelected[0]]
                          .weightageFactor * weightageCoefficient
                      ).toString()
                    ] !== 'undefined' /*&&
                  questionsDetails[questionId].version === questionVersion*/
                  ) {
                    // tslint:disable-next-line: no-increment-decrement
                    answersSelected.forEach((element: string) => {
                      // tslint:disable-next-line: no-increment-decrement
                      returnData[questionId].weightage[
                        (
                          questionsDetails[questionId].answers[element]
                            .weightageFactor * weightageCoefficient
                        ).toString()
                      ] += 1;
                    });
                    //                  returnData[questionId].sortFactor = calculateSortFactor(returnData[questionId], numberOfAnswers - 1)
                  }
                }
              }
            );
          }
        });
      }
    });
    //calculate sortFactor for each question
    //take average % score of each valid response to a question
    Object.keys(returnData).forEach((qId: string) => {
      const weights: string[] = Object.keys(returnData[qId].weightage);
      weights.sort((a: string, b: string) => parseInt(a, 10) - parseInt(b, 10));
      const maxWeight: string = weights[weights.length - 1];
      let totalQs = 0;
      let totalVal = 0;
      weights.forEach((weight: string) => {
        totalQs += returnData[qId].weightage[weight];
        totalVal += parseInt(weight, 10) * returnData[qId].weightage[weight];
      });
      if (totalQs > 0) {
        returnData[qId].sortFactor = Math.round(
          (totalVal / (totalQs * parseInt(maxWeight, 10))) * 100
        );
      }
    });
  } catch (err) {
    console.error('Exception:', err);
  }
  return returnData;
};
