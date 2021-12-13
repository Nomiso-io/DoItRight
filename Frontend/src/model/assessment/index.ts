import { IAssessmentAnswersMap, IAssessmentPostRequest } from './answers';
import { IAssessmentQuestionRequest } from './questions';
import { IAssessmentSummaryRequest } from './summary';
import { ILoadAssessmentFinalResultRequest } from '../result';
import { ILoadFeedbackRequest } from '../feedback';
import { ILoadAssessmentHistoryRequest } from './history';
import { ILoadAssessmentDetailRequest } from './detail';
import { ILoadTeamAssessmentsRequest } from './team-view';
import { ILoadAssessmentTypeRequest } from './assessment-select';
import { ISelectedAssessmentType } from './selected-assessment-type';
import { IAssessmentMiscellaneous } from './miscellaneous';
import { IAssessmentTime } from './assessmentTime';

export interface IAssessment {
  assessmentSummary: IAssessmentSummaryRequest;
  assessmentQuestion: IAssessmentQuestionRequest;
  markedAnswers: IAssessmentAnswersMap;
  assessmentAnswers: IAssessmentPostRequest;
  result: ILoadAssessmentFinalResultRequest;
  feedback: ILoadFeedbackRequest;
  assessmentHistory: ILoadAssessmentHistoryRequest;
  assessmentDetail: ILoadAssessmentDetailRequest;
  teamAssessments: ILoadTeamAssessmentsRequest;
  assessmentType: ILoadAssessmentTypeRequest;
  selectedAssessmentType: ISelectedAssessmentType;
  misc: IAssessmentMiscellaneous;
  assessmentTime: IAssessmentTime;
}

export * from './answers';
export * from './questions';
export * from './summary';
export * from './history';
export * from './detail';
export * from './team-view';
export * from './assessment-select';
