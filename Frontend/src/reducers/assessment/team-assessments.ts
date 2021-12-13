import {
    FETCH_TEAM_ASSESSMENTS_START,
    FETCH_TEAM_ASSESSMENTS_FAIL,
    FETCH_TEAM_ASSESSMENTS_SUCCESS,
    AssessmentActions
} from '../../actions';

import { ILoadTeamAssessmentsRequest, IAssessment } from '../../model'

const teamAssessments = {
    [FETCH_TEAM_ASSESSMENTS_START]
        (state: IAssessment,
            action: AssessmentActions<ILoadTeamAssessmentsRequest>) {
        return {
            ...state,
            teamAssessments: {
                ...action.payload
            }
        }
    },
    [FETCH_TEAM_ASSESSMENTS_FAIL]
        (state: IAssessment,
            action: AssessmentActions<ILoadTeamAssessmentsRequest>) {
        return {
            ...state,
            teamAssessments: {
                ...action.payload
            }
        }
    },
    [FETCH_TEAM_ASSESSMENTS_SUCCESS]
        (state: IAssessment,
            action: AssessmentActions<ILoadTeamAssessmentsRequest>) {
        return {
            ...state,
            teamAssessments: {
                ...action.payload
            }
        }
    },
}

export { teamAssessments }
