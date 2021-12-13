import { Answers, Question, Questionnaire } from '@models/index';
import { config } from '@root/config';
import { AssessmentDetails, CategoryWiseResults } from '@utils/index';

const getTheMostMatureAnswerId = (answers: Answers) => {
  let mostMatureAnswer = Object.keys(answers)[0];
  Object.keys(answers).forEach((answerId) => {
    if (
      answers[mostMatureAnswer].weightageFactor <
      answers[answerId].weightageFactor
    ) {
      mostMatureAnswer = answerId;
    }
  });
  return mostMatureAnswer;
};

export const calculateAnswerQuality = async (
  questionDetails: Question[],
  categoryWiseResults: CategoryWiseResults,
  userAssessmentDetails: AssessmentDetails,
  recommendations: any,
  questionnaireDetails: Questionnaire
): Promise<any> => {
  // console.log('In calculateAnswerQuality');
  const weightageCoefficient = config.defaults.scoreCoeff;
  for (const question of questionDetails) {
    const qId = `${question.id}_${question.version}`;
    const answerSelected: string[] = userAssessmentDetails[qId]
      ? userAssessmentDetails[qId].answers
        ? userAssessmentDetails[qId].answers
        : []
      : [];
    const mostMatureAnswer = getTheMostMatureAnswerId(question.answers);
    let score = 0;
    let maxScore = 0;
    const { numberOfAnswers, answers } = question;
    const answerCountForMultiSelect = numberOfAnswers ? numberOfAnswers : 1;
    const optionKeys = Object.keys(answers);
    optionKeys.sort((a, b) =>
      answers[a].weightageFactor > answers[b].weightageFactor ? -1 : 1
    );
    if (answerSelected.length > 0 && answerSelected[0] !== '@N/A') {
      let i = 0;
      for (const answerId of optionKeys) {
        const { weightageFactor } = answers[answerId];
        const weightage = weightageFactor * weightageCoefficient;
        if (
          answerSelected.length > 0 &&
          answerSelected.indexOf(answerId) !== -1
        ) {
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
      question.scoreObtained = score ? score : maxScore;
      question.maxScore = maxScore;
      const category = questionnaireDetails.categoriesMap[question.id];

      if (!recommendations[category]) {
        recommendations[category] = {};
        recommendations[category].recommendedQues = [];
      }
      // Here the recommendations will be added when the selected answers array
      // will not contain the answer with the maximum weightage.
      if (!answerSelected.includes(mostMatureAnswer)) {
        recommendations[category].recommendedQues.push(question);
      }
    }
  }
  for (const val of Object.keys(recommendations)) {
    const recommendedQues = await sortByKey(
      recommendations[val].recommendedQues,
      'level',
      'scoreObtained'
    );
    recommendations[val].recommendedQues = recommendedQues.slice(0, 3);
  }
  return recommendations;
};

async function sortByKey(
  array: any,
  key: any,
  secondKey: any
): Promise<Question[]> {
  return new Promise((resolve, reject) => {
    const levelMap = {
      hard: 3,
      high: 3,
      low: 1,
      med: 2,
      medium: 2,
    };
    return resolve(
      array.sort(function (a: any, b: any) {
        const levelA = a[key].toLowerCase();
        const levelB = b[key].toLowerCase();
        if (levelMap[levelA] === levelMap[levelB]) {
          // If the level is same, the recommendation of the
          // question obtaining lower score is the priority.
          const scoreA = a[secondKey];
          const scoreB = b[secondKey];
          const maxScoreA = a.maxScore;
          const maxScoreB = b.maxScore;
          return maxScoreA - scoreA > maxScoreB - scoreB ? -1 : 1;
        }
        return levelMap[levelA] > levelMap[levelB] ? -1 : 1;
      })
    );
  });
}
