import { AssessmentDetails, getQuestionsListSorted } from '@root/utils';
import { getQuestionIdFromCompositeQuestionId } from '@utils/common';

export const getIndexesForAssessmentDetails = async (
  assessmentDetails: AssessmentDetails,
  questionnaireType: string,
  questionnaireVersion: string
) => {
  const questionnaireQuestionIds = await getQuestionsListSorted({
    quesType: questionnaireType,
    version: questionnaireVersion,
  });
  const assessmentDetailsWithIndex: AssessmentDetails = {};
  Object.keys(assessmentDetails).forEach((key: string) => {
    const questionId = getQuestionIdFromCompositeQuestionId(key);

    // With index we are providing the frontend, the index of the question whose previous version needs to be fetched.
    // All the mapped questions should be fetched with their version and frontend should know which index is mapped.
    // Because frontend has no idea about the question or question id, it simply query's the index and the backend sends
    // the question data for the respective index.

    if (questionnaireQuestionIds.indexOf(questionId) >= 0) {
      assessmentDetailsWithIndex[key] = assessmentDetails[key];
      assessmentDetailsWithIndex[key].index = questionnaireQuestionIds.indexOf(
        questionId
      );
    }
  });
  return assessmentDetailsWithIndex;
};
