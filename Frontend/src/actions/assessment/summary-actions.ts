import { Http } from '../../utils';
import { IAssessmentSummaryRequest } from '../../model';
import { IAssessmentSummaryData } from '../../model/assessment';
import { AssessmentActions } from '.';
import { mapSummaryAnswersToQuestions } from './answer-actions'
import { ISelectedAssessmentType } from '../../model/assessment/selected-assessment-type';

type FETCH_ASSESSMENT_SUMMARY_START = 'FETCH_ASSESSMENT_SUMMARY_START';
export const FETCH_ASSESSMENT_SUMMARY_START: FETCH_ASSESSMENT_SUMMARY_START =
    'FETCH_ASSESSMENT_SUMMARY_START';

type FETCH_ASSESSMENT_SUMMARY_SUCCESS = 'FETCH_ASSESSMENT_SUMMARY_SUCCESS';
export const FETCH_ASSESSMENT_SUMMARY_SUCCESS: FETCH_ASSESSMENT_SUMMARY_SUCCESS =
    'FETCH_ASSESSMENT_SUMMARY_SUCCESS';

type FETCH_ASSESSMENT_SUMMARY_FAIL = 'FETCH_ASSESSMENT_SUMMARY_FAIL';
export const FETCH_ASSESSMENT_SUMMARY_FAIL: FETCH_ASSESSMENT_SUMMARY_FAIL =
    'FETCH_ASSESSMENT_SUMMARY_FAIL';

export type ASSESSMENT_SUMMARY_ACTIONS = FETCH_ASSESSMENT_SUMMARY_FAIL
    | FETCH_ASSESSMENT_SUMMARY_SUCCESS
    | FETCH_ASSESSMENT_SUMMARY_START

const apiPath = '/api/v2/assessment/summary';

export function fetchAssessmentData(assessmentSelectData: ISelectedAssessmentType, team: string) {
    return (dispatch: Function, getState: Function) => {
        dispatch(fetchDataStart());
        Http.get<IAssessmentSummaryData>({
            url: `${apiPath}/${team}/${assessmentSelectData.questionnaireId}?version=${assessmentSelectData.version}`,
            state: getState()
        }).then((response: IAssessmentSummaryData) => {
            dispatch(fetchDataSuccess(response));
            dispatch(mapSummaryAnswersToQuestions(response))
        }).catch((error) => {
            dispatch(fetchDataFail(error));
        })
    };
}

function fetchDataStart(): AssessmentActions<IAssessmentSummaryRequest> {
    return {
        type: FETCH_ASSESSMENT_SUMMARY_START,
        payload: {
            status: 'start',
            data: null
        }
    };
}

function fetchDataSuccess(data: IAssessmentSummaryData):
    AssessmentActions<IAssessmentSummaryRequest> {
    if (!data.markedAnswers) {
        data.markedAnswers = {}
    }
    return {
        type: FETCH_ASSESSMENT_SUMMARY_SUCCESS,
        payload: {
            data,
            status: 'success',
        }
    };
}

function fetchDataFail(message: object): AssessmentActions<IAssessmentSummaryRequest> {
    return {
        type: FETCH_ASSESSMENT_SUMMARY_FAIL,
        payload: {
            error: message,
            data: null,
            status: 'fail',
        }
    };
}