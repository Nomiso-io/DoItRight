import { FetchAction, IAssessmentDetailItem, AssessmentDocument } from '../';
export interface IResultItem {
  score: number;
  categoryWiseResults: {
    [key: string]: {
      percentage: number;
    };
  };
  maxScore: number;
  percentage: number;
  level: string;
  recommendations: IRecommendations;
}

export interface IUserlevel {
  name: string;
  lowerLimit: number;
  upperLimit: number;
  color: string;
}
//export interface IUserlevels {
//    [key:string]: IUserlevel;
//}

export interface IRecommendations {
  [key: string]: any;
}

export interface IAssessmentFinalResult {
  result: IResultItem;
  userLevels: IUserlevel[];
  assessmentSummary: IAssessmentDetailItem[];
  showRecommendations?: boolean;
  recommendations: IRecommendations;
  bestScoringAssessment?: AssessmentDocument;
  benchmarkScore?: number;
}
export type IAssessmentFinalResultResponse = IAssessmentFinalResult;
export interface ILoadAssessmentFinalResultRequest {
  data: IAssessmentFinalResultResponse | null;
  status: FetchAction;
  error?: object | null;
}
