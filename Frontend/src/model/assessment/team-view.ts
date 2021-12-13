import { FetchAction, IAssessmentListItem } from '..';
import { ILevelAttributes } from '../system';

export interface IAssessmentTeamView {
  teams: {
    [teamId: string]: {
      assessments: IAssessmentListItem[];
    };
  };
  userLevels: ILevelAttributes[];
}

export interface ITeamAssessment {
  teamId: string;
  teamName: string;
  assessmentName: string;
  type: string;
  questionnaireVersion: string;
  averageScore: number;
  level: string;
  assessments: IAssessmentListItem[];
}

export interface ITeamsAssessmentStoreFormat {
  teams: ITeamAssessment[];
  userLevels: ILevelAttributes[];
}

export type ITeamsAssessmentResponse = IAssessmentTeamView;

export interface ILoadTeamAssessmentsRequest {
  data: ITeamsAssessmentStoreFormat | null;
  status: FetchAction;
  error?: object | null;
}
