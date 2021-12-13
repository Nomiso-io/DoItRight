import {
  IAssessmentListItem,
  ITeamsAssessmentResponse,
  ITeamsAssessmentStoreFormat,
  ITeamAssessment,
} from '../../model';

export const mapTeamAssessment = (
  response: ITeamsAssessmentResponse
): ITeamsAssessmentStoreFormat => {
  const teamAssessments: ITeamAssessment[] = [];

  Object.keys(response.teams).forEach((teamId: string) => {
    const assessmentNameVersionMap: { [key: string]: IAssessmentListItem[]; } = {};

    response.teams[teamId].assessments.forEach((assessment: IAssessmentListItem) => {
        const key = `${assessment.assessmentName}_${assessment.questionnaireVersion}`;
        if (!Object.keys(assessmentNameVersionMap).includes(key)) {
          assessmentNameVersionMap[key] = [];
        }
        assessmentNameVersionMap[key].push(assessment);
      }
    );

    Object.keys(assessmentNameVersionMap).forEach((key: string) => {
      const totalScore = assessmentNameVersionMap[key].reduce(
        (acc, assessmentData) => {
          return assessmentData.result!.percentage + acc;
        },
        0
      );
      const totalAssessment = assessmentNameVersionMap[key].length;
      const averageScore = Math.round(totalScore / totalAssessment);

      const assessmentRow: ITeamAssessment = {
        teamId: assessmentNameVersionMap[key][0].teamId,
        teamName: assessmentNameVersionMap[key][0].teamName,
        assessmentName: assessmentNameVersionMap[key][0].assessmentName
          ? assessmentNameVersionMap[key][0].assessmentName
          : '',
        type: assessmentNameVersionMap[key][0].type
          ? assessmentNameVersionMap[key][0].type
          : '',
        questionnaireVersion: assessmentNameVersionMap[key][0]
          .questionnaireVersion
          ? assessmentNameVersionMap[key][0].questionnaireVersion
          : '1',
        averageScore,
        level: 'low',
        assessments: assessmentNameVersionMap[key],
      };
      teamAssessments.push(assessmentRow);
    });
  });

  return {
    teams: teamAssessments,
    userLevels: response.userLevels,
  };
};
