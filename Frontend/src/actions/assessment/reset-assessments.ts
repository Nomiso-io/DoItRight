import { AssessmentActions } from '.';

export type REMOVE_ASSESSMENT_DETAILS = 'REMOVE_ASSESSMENT_DETAILS';
export const REMOVE_ASSESSMENT_DETAILS: REMOVE_ASSESSMENT_DETAILS = 'REMOVE_ASSESSMENT_DETAILS';

export type REMOVE_ASSESSMENT_ACTIONS = REMOVE_ASSESSMENT_DETAILS;

export function removeAssessmentDetails(): AssessmentActions<{}> {
    return {
        type: 'REMOVE_ASSESSMENT_DETAILS',
        payload: {}
    }
}