import { TeamInfo } from '@models/index';
import { AssessmentDetails, AssessmentDocument, Result } from '@utils/index';

export interface HistoryAcknowledgement {
  assessments: Array<{
    assessmentDetails?: AssessmentDetails;
    assessmentId: string;
    assessmentName?: string;
    date: number;
    dateSubmit?: number;
    hideResult: boolean;
    questionnaireVersion?: string;
    result?: Result;
    teamId: string;
    teamName: string;
    timeOut: boolean;
    type?: string;
    userId: string;
  }>;
}

export function getResponseBody(
  assessmentHistory: AssessmentDocument[],
  teamsList: TeamInfo[]
): HistoryAcknowledgement {
  const acknowledgement: HistoryAcknowledgement = {
    assessments: [],
  };

  assessmentHistory.forEach((item) => {
    const timeOut = item.questionnaireDetails
      ? item.questionnaireDetails.timeOut
        ? item.questionnaireDetails.timeOut
        : false
      : false;

    const hideResult = item.questionnaireDetails
      ? item.questionnaireDetails.hideResult
        ? item.questionnaireDetails.hideResult
        : false
      : false;

    const teamDetails = teamsList.find((team: TeamInfo) => team.teamId === item.team);

    if (item.result) {
      acknowledgement.assessments.push({
        assessmentDetails: item.assessmentDetails,
        assessmentId: item.assessmentId,
        assessmentName: item.assessmentName,
        date: item.date,
        dateSubmit: item.dateSubmit,
        hideResult,
        questionnaireVersion: item.questionnaireVersion,
        result: item.result,
        teamId: item.team,
        teamName: teamDetails ? teamDetails.teamName : item.team,
        timeOut,
        type: item.type,
        userId: item.userId,
      });
    } else if (!timeOut) {
      acknowledgement.assessments.push({
        assessmentDetails: item.assessmentDetails,
        assessmentId: item.assessmentId,
        assessmentName: item.assessmentName,
        date: item.date,
        dateSubmit: item.dateSubmit,
        hideResult,
        questionnaireVersion: item.questionnaireVersion,
        result: item.result,
        teamId: item.team,
        teamName: teamDetails ? teamDetails.teamName : item.team,
        timeOut,
        type: item.type,
        userId: item.userId,
      });
    }
  });

  return acknowledgement;
}
