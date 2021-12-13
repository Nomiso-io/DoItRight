import { AssessmentDocument, Result } from '@utils/index';

export interface HistoryAcknowledgement {
  assessments: Array<{
    assessmentId: string;
    assessmentName?: string;
    date: number;
    dateSubmit?: number;
    result?: Result;
    type?: string;
    userId: string;
  }>;
}

export function getResponseBody(
  assessmentHistory: AssessmentDocument[]
): HistoryAcknowledgement {
  const acknowledgement: HistoryAcknowledgement = {
    assessments: [],
  };

  assessmentHistory.forEach((item) => {
    acknowledgement.assessments.push({
      assessmentId: item.assessmentId,
      assessmentName: item.assessmentName,
      date: item.date,
      dateSubmit: item.dateSubmit,
      result: item.result,
      type: item.type,
      userId: item.userId,
    });
  });

  return acknowledgement;
}
