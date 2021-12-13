import { AssessmentActions } from '.';

type CHANGE_ASSESSMENT_START_TIME = 'CHANGE_ASSESSMENT_START_TIME';
export const CHANGE_ASSESSMENT_START_TIME: CHANGE_ASSESSMENT_START_TIME =
    'CHANGE_ASSESSMENT_START_TIME';

type CHANGE_ASSESSMENT_CURRENT_TIME = 'CHANGE_ASSESSMENT_CURRENT_TIME';
export const CHANGE_ASSESSMENT_CURRENT_TIME: CHANGE_ASSESSMENT_CURRENT_TIME =
    'CHANGE_ASSESSMENT_CURRENT_TIME';

export type ASSESSMENT_TIME_ACTIONS = CHANGE_ASSESSMENT_START_TIME |
        CHANGE_ASSESSMENT_CURRENT_TIME;

export const setAssessmentStartTime = () => {
    return (dispatch: Function, getState: Function) => {
        const startTime = new Date().getTime();
        dispatch(changeAssessmentStartTime(startTime));
    }
};

export const setAssessmentCurrentTime = (currentTime: number) => {
    return (dispatch: Function, getState: Function) => {
        dispatch(changeAssessmentCurrentTime(currentTime));
    }
};

const changeAssessmentStartTime = (date: number): AssessmentActions<number> => {
    return {
        type: CHANGE_ASSESSMENT_START_TIME,
        payload: date,
    }
}

const changeAssessmentCurrentTime = (date: number): AssessmentActions<number> => {
    return {
        type: CHANGE_ASSESSMENT_CURRENT_TIME,
        payload: date,
    }
}