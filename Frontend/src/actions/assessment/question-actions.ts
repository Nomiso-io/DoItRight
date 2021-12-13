import { Http } from '../../utils';
import { IAssessmentQuestionRequest, IAssessmentQuestionData } from '../../model';
import { AssessmentActions } from '.';
import { getQuestionIdFromCompositeQuestionId, getVersionFromCompositeQuestionId } from '../../utils/data';

type FETCH_ASSESSMENT_QUESTION_INITIALIZE = 'FETCH_ASSESSMENT_QUESTION_INITIALIZE';
export const FETCH_ASSESSMENT_QUESTION_INITIALIZE: FETCH_ASSESSMENT_QUESTION_INITIALIZE =
    'FETCH_ASSESSMENT_QUESTION_INITIALIZE';

type FETCH_ASSESSMENT_QUESTION_START = 'FETCH_ASSESSMENT_QUESTION_START';
export const FETCH_ASSESSMENT_QUESTION_START: FETCH_ASSESSMENT_QUESTION_START =
    'FETCH_ASSESSMENT_QUESTION_START';

type FETCH_ASSESSMENT_QUESTION_SUCCESS = 'FETCH_ASSESSMENT_QUESTION_SUCCESS';
export const FETCH_ASSESSMENT_QUESTION_SUCCESS: FETCH_ASSESSMENT_QUESTION_SUCCESS =
    'FETCH_ASSESSMENT_QUESTION_SUCCESS';

type FETCH_ASSESSMENT_QUESTION_FAIL = 'FETCH_ASSESSMENT_QUESTION_FAIL';
export const FETCH_ASSESSMENT_QUESTION_FAIL: FETCH_ASSESSMENT_QUESTION_FAIL =
    'FETCH_ASSESSMENT_QUESTION_FAIL';

export type ASSESSMENT_QUESTION_ACTIONS = FETCH_ASSESSMENT_QUESTION_FAIL
    | FETCH_ASSESSMENT_QUESTION_SUCCESS
    | FETCH_ASSESSMENT_QUESTION_START
    | FETCH_ASSESSMENT_QUESTION_INITIALIZE

export function fetchAssessmentQuestion(assessmentId: string, index: number, type: string, questionnaireVersion: string, team: string, mappedQuestionId?: string) {
    return (dispatch: Function, getState: Function) => {
        dispatch(fetchDataStart());
        let url: string = '';
        if (mappedQuestionId) {
            const questionId = getQuestionIdFromCompositeQuestionId(mappedQuestionId);
            const questionVersion = getVersionFromCompositeQuestionId(mappedQuestionId);
            url = `/api/v2/assessment/${assessmentId}/question/${index}/${team}/${type}/${questionnaireVersion}?questionId=${questionId}&questionVersion=${questionVersion}`
        } else {
            url = `/api/v2/assessment/${assessmentId}/question/${index}/${team}/${type}/${questionnaireVersion}`;
        }
        Http.get<IAssessmentQuestionData>({
            url,
            state: getState()
        }).then((response: IAssessmentQuestionData) => {
            response.index = index;
            dispatch(fetchDataSuccess(response));
        }).catch((error) => {
            dispatch(fetchDataFail(error));
        })
    };
}

export function fetchAssessmentQuestionInitialize(): AssessmentActions<IAssessmentQuestionRequest> {
    return {
        type: FETCH_ASSESSMENT_QUESTION_INITIALIZE,
        payload: {
            status: 'initial',
            data: null
        }
    };
}

function fetchDataStart(): AssessmentActions<IAssessmentQuestionRequest> {
    return {
        type: FETCH_ASSESSMENT_QUESTION_START,
        payload: {
            status: 'start',
            data: null
        }
    };
}

function fetchDataSuccess(data: IAssessmentQuestionData):
    AssessmentActions<IAssessmentQuestionRequest> {
    return {
        type: FETCH_ASSESSMENT_QUESTION_SUCCESS,
        payload: {
            data,
            status: 'success',
        }
    };
}

function fetchDataFail(message: object): AssessmentActions<IAssessmentQuestionRequest> {
    return {
        type: FETCH_ASSESSMENT_QUESTION_FAIL,
        payload: {
            error: message,
            data: null,
            status: 'fail',
        }
    };
}