import { LevelAttributes, Question } from '@models/index';
import { config } from '@root/config';
import {
  getBestScoringAssessment,
  getQuestionCategoryFromQuestionnaire,
  getQuestionnaireId,
  getRandomize,
  getResultLevels,
  sortCategoriesMapByCategories,
} from '@root/utils/dynamoDb';
import { AssessmentDetails, AssessmentDocument, Result } from '@utils/index';

interface Option {
  answer: string;
  isSelected: boolean;
  weightage: number;
}
export interface DetailsAcknowledgement {
  assessmentSummary: Array<{
    answers: string[]; // TODO: This key is only for backward compatibility. Remove this after beta deployment.
    category: string;
    comment: string;
    options: Option[];
    question: string;
    randomize: boolean;
  }>;
  benchmarkScore?: number;
  bestScoringAssessment?: AssessmentDocument;
  hideResult: boolean;
  recommendations?: any;
  result?: Result;
  showRecommendations: boolean;
  timeOut: boolean;
  //    userLevels?: {
  //        [level: string]: {
  //            lowerLimit: number;
  //            upperLimit: number;
  //        };
  //    };
  userLevels?: LevelAttributes[];
}

export async function getResponseBody({
  questionDetailsArr,
  assessmentDocument,
  userLevels,
}: {
  assessmentDocument: AssessmentDocument;
  questionDetailsArr: Question[];
  userLevels?: any;
}): Promise<DetailsAcknowledgement> {
  const resp = await getQuestionnaireId(
    assessmentDocument.type,
    assessmentDocument.questionnaireVersion
  );
  const questionnaireRecommendationFlag: boolean = resp.showRecommendations
    ? resp.showRecommendations
    : false;
  // console.log(assessmentDocument.type, resp.showRecommendations, questionnaireRecommendationFlag);
  const acknowledgement: DetailsAcknowledgement = {
    assessmentSummary: [],
    benchmarkScore: resp.benchmarkScore,
    hideResult: assessmentDocument.questionnaireDetails
      ? assessmentDocument.questionnaireDetails.hideResult
        ? assessmentDocument.questionnaireDetails.hideResult
        : false
      : false,
    result: assessmentDocument.result,
    showRecommendations: questionnaireRecommendationFlag,
    timeOut: assessmentDocument.questionnaireDetails
      ? assessmentDocument.questionnaireDetails.timeOut
        ? assessmentDocument.questionnaireDetails.timeOut
        : false
      : false,
  };
  const assessmentDetails = <AssessmentDetails>(
    assessmentDocument.assessmentDetails
  );
  const weightageCoefficient = config.defaults.scoreCoeff;
  let categoriesMap = resp.categoriesMap;
  categoriesMap = await sortCategoriesMapByCategories(categoriesMap);
  const assessmentDetailsKeys = Object.keys(assessmentDetails);

  // const quesOrder = assessmentDocument.quesOrder ? assessmentDocument.quesOrder : assessmentDetailsKeys;

  const quesOrder = Object.keys(categoriesMap);

  /*    let sortOrder: string[] = Object.keys(assessmentDetails);
    // console.log({sortOrder});
    //NOTE: sortOrder has <questionId_version> and quesOrder has only <questionId>
    if(assessmentDocument.quesOrder) {
        // console.log(assessmentDocument.quesOrder);
        const ar = new Set(sortOrder);
        sortOrder = [];
        // console.log({ar});
        assessmentDocument.quesOrder.forEach((val) => {
            if(ar.has(val)) {
                sortOrder.push(val);
            }
        });
        // console.log({sortOrder});
    }
    for (const questionId of sortOrder) {
        const item = assessmentDetails[questionId];
*/
  for (const questionId of quesOrder) {
    let answerKey = '';
    for (const key of assessmentDetailsKeys) {
      if (key.startsWith(questionId)) {
        answerKey = key;
        break;
      }
    }
    if (answerKey === '') {
      continue;
    }

    const item = assessmentDetails[answerKey];
    const category = await getQuestionCategoryFromQuestionnaire(
      questionId,
      assessmentDocument.type,
      assessmentDocument.questionnaireVersion
    );
    const randomize = await getRandomize(
      assessmentDocument.type,
      assessmentDocument.questionnaireVersion
        ? assessmentDocument.questionnaireVersion
        : '1'
    );
    const questionDetails: Question = questionDetailsArr.filter(
      (o) => o.id === questionId
    )[0];
    const answers: string[] = [];
    const options: Option[] = [];

    item.answers.forEach((answerId) => {
      if (answerId === '@N/A') {
        answers.push(item.comment);
      } else {
        answers.push(questionDetails.answers[answerId].answer);
      }
    });

    Object.keys(questionDetails.answers).forEach((_answerId) => {
      options.push({
        answer: questionDetails.answers[_answerId].answer,
        isSelected: item.answers.includes(_answerId),
        weightage:
          questionDetails.answers[_answerId].weightageFactor *
          weightageCoefficient,
      });
    });
    acknowledgement.assessmentSummary.push({
      answers,
      category /*: category !== '' ? category : questionDetails.category*/,
      comment: item.comment,
      options,
      question: questionDetails.question,
      randomize,
    });
  }
  acknowledgement.userLevels = userLevels
    ? userLevels
    : await getResultLevels();
  const bestScoringAssessment = await getBestScoringAssessment(
    assessmentDocument.type
  );
  if (bestScoringAssessment) {
    acknowledgement.bestScoringAssessment = bestScoringAssessment;
  }

  return acknowledgement;
}
