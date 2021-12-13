import { IRootState } from '../reducers';
import * as constantvalues from '../common/constantValues';

export const initialState: IRootState = {
    user: {
        idToken: null,
        accessToken: null,
        userDetails: null,
        team: null,
        roles: null,
        teams: [],
    },
    assessment: {
        assessmentSummary: {
            status: 'initial',
            data: null
        },
        assessmentQuestion: {
            status: 'initial',
            data: null
        },
        assessmentAnswers: {
            status: 'initial',
            data: null
        },
        result: {
            status: 'initial',
            data: null
        },
        feedback: {
            status: 'initial',
            data: null
        },
        assessmentHistory: {
            status: 'initial',
            data: null
        },
        assessmentDetail: {
            status: 'initial',
            data: null
        },
        teamAssessments: {
            status: 'initial',
            data: null
        },
        assessmentType: {
            status: 'initial',
            data: null
        },
        selectedAssessmentType: {
            questionnaireId: '',
            version: ''
        },
        markedAnswers: {},
        misc: {
            continueAssessmentNotificationShown: false
        },
        assessmentTime: {
            startTime: 0,
            currentTime: 0
        }
    },
    admin: {
        createTeamParams: {
            status: 'initial',
            data: null
        }
    },
    display: {
        topBarTextRight: '',
        topBarTextCenter: '',
        topBarTextLeft: '',
        currentPage: ''
    },
    systemDetails: {
        appClientId: '',
        appClientURL: '',
        mode: constantvalues.NORMAL_MODE,
        userpoolId:''
    }
}