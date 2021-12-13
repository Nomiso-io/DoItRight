import { Http } from '../../utils';
import {
  ILoadTeamAssessmentsRequest,
  ITeamsAssessmentResponse,
  ITeamsAssessmentStoreFormat,
} from '../../model';
import { AssessmentActions, mapTeamAssessment } from '.';

type FETCH_TEAM_ASSESSMENTS_START = 'FETCH_TEAM_ASSESSMENTS_START';
export const FETCH_TEAM_ASSESSMENTS_START: FETCH_TEAM_ASSESSMENTS_START =
  'FETCH_TEAM_ASSESSMENTS_START';

type FETCH_TEAM_ASSESSMENTS_SUCCESS = 'FETCH_TEAM_ASSESSMENTS_SUCCESS';
export const FETCH_TEAM_ASSESSMENTS_SUCCESS: FETCH_TEAM_ASSESSMENTS_SUCCESS =
  'FETCH_TEAM_ASSESSMENTS_SUCCESS';

type FETCH_TEAM_ASSESSMENTS_FAIL = 'FETCH_TEAM_ASSESSMENTS_FAIL';
export const FETCH_TEAM_ASSESSMENTS_FAIL: FETCH_TEAM_ASSESSMENTS_FAIL =
  'FETCH_TEAM_ASSESSMENTS_FAIL';

export type TEAM_ASSESSMENT_ACTIONS =
  | FETCH_TEAM_ASSESSMENTS_START
  | FETCH_TEAM_ASSESSMENTS_SUCCESS
  | FETCH_TEAM_ASSESSMENTS_FAIL;

export function fetchTeamAssessments() {
  return (dispatch: Function, getState: Function) => {
    dispatch(fetchDataStart());
    Http.get<ITeamsAssessmentResponse>({
      url: `/api/v2/assessment/history?type=team`,
      state: getState(),
    })
    .then((response: ITeamsAssessmentResponse) => {
      const result: ITeamsAssessmentStoreFormat = mapTeamAssessment(response);
      dispatch(fetchDataSuccess(result));
    })
    .catch((error) => {
      dispatch(fetchDataFail(error));
    });
  };
}

function fetchDataStart(): AssessmentActions<ILoadTeamAssessmentsRequest> {
  return {
    type: FETCH_TEAM_ASSESSMENTS_START,
    payload: {
      status: 'start',
      data: null,
    },
  };
}

function fetchDataSuccess(
  data: ITeamsAssessmentStoreFormat
): AssessmentActions<ILoadTeamAssessmentsRequest> {
  return {
    type: FETCH_TEAM_ASSESSMENTS_SUCCESS,
    payload: {
      data,
      status: 'success',
    },
  };
}

function fetchDataFail(
  message: object
): AssessmentActions<ILoadTeamAssessmentsRequest> {
  return {
    type: FETCH_TEAM_ASSESSMENTS_FAIL,
    payload: {
      error: message,
      data: null,
      status: 'fail',
    },
  };
}
