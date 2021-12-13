export const getQuestionIdFromCompositeQuestionId = (
  compositeQuestionId: string
) => {
  const versionIndex = compositeQuestionId.lastIndexOf('_');
  let questionIdConstructed = compositeQuestionId.substring(0, versionIndex);
  const versionString = compositeQuestionId.substring(versionIndex + 1);
  const versionInt = parseInt(
    compositeQuestionId.substring(versionIndex + 1),
    10
  );

  // The below code snippet is written for the question ids like ques_604d3d60-b54f-11ea-8b73-ad76248587a0
  // and ques_808001
  if (isNaN(versionInt) || versionString.length > 4 || versionInt > 10000) {
    questionIdConstructed = compositeQuestionId;
  }
  return questionIdConstructed;
};

export const getVersionFromCompositeQuestionId = (
  compositeQuestionId: string
) => {
  const versionIndex = compositeQuestionId.lastIndexOf('_');
  const versionString = compositeQuestionId.substring(versionIndex + 1);
  if (versionString.length > 2) {
    return 0;
  }
  const versionInt = parseInt(versionString, 10);

  // There is no check here as there is one in getQuestionIdFromCompositeQuestionId
  // It is assumed that this function is getting called where the version exists.
  return isNaN(versionInt) ? 1 : versionInt;
};
