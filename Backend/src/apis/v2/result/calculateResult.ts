import { Answer, Question } from '@models/index';
import { config } from '@root/config';
import { calculateAnswerQuality } from '@root/utils/dynamoDb/getRecommendations';
import {
  appLogger,
  AssessmentDetails,
  CategoryWiseResults,
  getQuestionnaireId,
  Result,
} from '@utils/index';

function calculateIncrForSelection(
  answers: { [id: string]: Answer },
  answerSelected: string[],
  weightageCoefficient: number,
  isMultiSelect?: boolean,
  numberOfAnswers?: number
) {
  appLogger.info({
    calculateIncrForSelection: {
      answerSelected,
      answers,
      isMultiSelect,
      numberOfAnswers,
      weightageCoefficient,
    },
  });
  let score = 0;
  let maxScore = 0;

  if (
    answerSelected.length === 0 ||
    (answerSelected.length > 0 && answerSelected[0] !== '@N/A')
  ) {
    //sort the answerkeys in decreasing order of weightage
    const optionKeys = Object.keys(answers);
    optionKeys.sort((a, b) =>
      answers[a].weightageFactor > answers[b].weightageFactor ? -1 : 1
    );

    const answerCount = numberOfAnswers ? numberOfAnswers : 1;
    for (let i = 0; i < answerCount; i += 1) {
      maxScore += answers[optionKeys[i]].weightageFactor * weightageCoefficient;
    }
  }

  if (answerSelected.length > 0 && answerSelected[0] !== '@N/A') {
    answerSelected.forEach((ansId: string) => {
      score += answers[ansId].weightageFactor * weightageCoefficient;
    });
  }
  /*
    const answerCountForMultiSelect = numberOfAnswers ? numberOfAnswers : 1;
    const optionKeys = Object.keys(answers);
    optionKeys.sort((a, b) => answers[a].weightageFactor > answers[b].weightageFactor ? -1 : 1);
    if(answerSelected.length > 0 && answerSelected[0] !== '@N/A') {
        let i = 0;
        for (const answerId of optionKeys) {
            const { weightageFactor } = answers[answerId];
            const weightage = weightageFactor * weightageCoefficient;
            if (answerSelected.indexOf(answerId) !== -1) {
                score += weightage;
            }
            // As the optionKeys are sorted in the decreasing order of the weightage factor
            // The the weightage will be added to the maxScore in decreasing order too.
            // For ex, if the weightages are 10, 20, 30, 40 and the answerCountForMultiSelect is 2
            // 40 will be added first, then 30. Ensuring the maximum achievable score.
            if (answerSelected.length > 1 && i < answerCountForMultiSelect) {
                maxScore += weightage;
            } else {
                maxScore = maxScore < weightage ? weightage : maxScore;
            }
            i += 1;
        }
    }
    if (answerSelected.length === 0) {
        let i = 0;
        for (const answerId of optionKeys) {
            const { weightageFactor } = answers[answerId];
            const weightage = weightageFactor * weightageCoefficient;
            if (isMultiSelect &&  i < answerCountForMultiSelect) {
                maxScore += weightage;
            } else {
                maxScore = maxScore < weightage ? weightage : maxScore;
            }
            i += 1;
        }
    }
    */
  return { score, maxScore };
}

function calculatePercentageForCategory(
  score: number,
  maxScore: number
): number {
  return Math.round((score / maxScore) * 100) || 0;
}

function calculateResultPerCategory(
  category: string,
  incr: any,
  categoryWiseResults: CategoryWiseResults
): void {
  const { score, maxScore } = incr;
  if (categoryWiseResults[category]) {
    categoryWiseResults[category].score += score;
    categoryWiseResults[category].maxScore += maxScore;
    categoryWiseResults[category].percentage = calculatePercentageForCategory(
      categoryWiseResults[category].score,
      categoryWiseResults[category].maxScore
    );
  } else {
    const percentage = calculatePercentageForCategory(score, maxScore);
    categoryWiseResults[category] = {
      maxScore: incr.maxScore,
      percentage,
      score: incr.score,
    };
  }
}

/*function calculateAnswerQuality(questionDetails: QuestionDetails[], categoryWiseResults: CategoryWiseResults, userAssessmentDetails: AssessmentDetails, recommendations: any): any{
    const recommendationConf = getCategoryRecommendations();
    questionDetails.forEach((question) => {
        let score = 0;
        let maxScore = 0;
        Object.keys(question.answers).forEach((answerId) => {
            const answerSelected = userAssessmentDetails[question.id].answers;
            const { weightage } = question.answers[answerId];
            if (answerSelected.indexOf(answerId) !== -1) {
                score = weightage;
            }
            if (answerSelected.length > 1) {
                maxScore = weightage;
            } else {
                maxScore = maxScore < weightage ? weightage : maxScore;
            }
        });
        if(score == maxScore || !question.level || !question.thresholdScore){

        } else if (question.level == 'High') {
            //add to recommendation
            recommendations[question.category].recommendedQues.push(question);
        } else if (categoryWiseResults[question.category].percentage < recommendationConf[question.category].percentageReq && score < maxScore) {
            //add to recommendation
            recommendations[question.category].recommendedQues.push(question);
        } else {clouddyna
            if(categoryWiseResults[question.category].percentage < recommendationConf[question.category].percentageReq && score <= question.thresholdScore) {
                recommendations[question.category].recommendedQues.push(question);
            }
        }
    });
    return recommendations;
}*/

/*function calculateRecommendations(categoryWiseResults: CategoryWiseResults): any {
    const recommendations = {};
    const recommendationConf = getCategoryRecommendations();
    for(const category of Object.keys(categoryWiseResults)) {
        for(const level of Object.keys(recommendationConf[category])) {
            if(categoryWiseResults[category].percentage <= recommendationConf[category][level].up && categoryWiseResults[category].percentage >= recommendationConf[category][level].down && recommendationConf[category][level].recommended) {
                recommendations[category] = {};
                recommendations[category].level = level;
                recommendations[category].comment = recommendationConf[category][level].comment;
                recommendations[category].recommendedQues = [];
                break;
            }
        }
    }
    return recommendations;
}*/

export const calculateResult = async (
  date: number,
  userAssessmentDetails: AssessmentDetails,
  questionDetails: Question[],
  assessmentId: string,
  assessmentType: string,
  questionnaireVersion?: string
): Promise<Result> => {
  appLogger.info({
    calculateResult: {
      assessmentId,
      assessmentType,
      date,
      questionDetails,
      questionnaireVersion,
      userAssessmentDetails,
    },
  });
  const result: Result = {
    categoryWiseResults: {},
    level: 'NA',
    maxScore: 0,
    percentage: 0,
    recommendations: {},
    score: 0,
  };

  const questionnaireDetails = await getQuestionnaireId(
    assessmentType,
    questionnaireVersion
  );
  const { categoriesMap } = questionnaireDetails;

  let score = 0;
  let maxScore = 0;
  const categoryWiseResults = {};
  const weightageCoefficient = config.defaults.scoreCoeff;

  for (const question of questionDetails) {
    const { id, version, type, numberOfAnswers } = question;
    const category = categoriesMap[id];
    const qId = `${id}_${version}`;
    const answerSelected = userAssessmentDetails[qId]
      ? userAssessmentDetails[qId].answers
        ? userAssessmentDetails[qId].answers
        : []
      : [];
    const incr = calculateIncrForSelection(
      question.answers,
      answerSelected,
      weightageCoefficient,
      type === 'multi-select',
      numberOfAnswers
    );
    appLogger.info({ calculateIncrForSelection: incr });
    calculateResultPerCategory(category, incr, categoryWiseResults);
    score += incr.score;
    maxScore += incr.maxScore;
  }
  const recommendations = {};
  result.score = score;
  result.maxScore = maxScore;
  result.categoryWiseResults = categoryWiseResults;
  result.recommendations =
    questionnaireDetails.timeOut || questionnaireDetails.hideResult
      ? {}
      : await calculateAnswerQuality(
          questionDetails,
          categoryWiseResults,
          userAssessmentDetails,
          recommendations,
          questionnaireDetails
        );

  appLogger.info({ calculateResult: { result } });
  return result;
};
