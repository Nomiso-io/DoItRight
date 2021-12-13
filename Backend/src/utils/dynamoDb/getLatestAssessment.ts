import { AssessmentDocument } from './createNewAssessmentDocument';

//filter old assessments from the given list of AssessmentDocument
export const getLatestAssessment = async (
  assessmentHistory: AssessmentDocument[]
) => {
  const userMap = new Map();
  const newAssessmentDocument: AssessmentDocument[] = [];
  for (const val of assessmentHistory) {
    if (val.result && userMap.has(val.userId)) {
      if (userMap.get(val.userId).date <= val.date) {
        userMap.set(val.userId, val);
      }
    } else if (val.result) {
      userMap.set(val.userId, val);
    }
  }
  userMap.forEach((value: any, key: string) => {
    newAssessmentDocument.push(value);
  });
  return newAssessmentDocument;
};
