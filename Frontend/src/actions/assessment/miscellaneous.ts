import { AssessmentActions } from ".";
import { IAssessmentMiscellaneous } from "../../model/assessment/miscellaneous";

type SET_CONTINUE_ASSESSMENT_NOTIFICATION_SHOWN = 'SET_CONTINUE_ASSESSMENT_NOTIFICATION_SHOWN';
export const SET_CONTINUE_ASSESSMENT_NOTIFICATION_SHOWN: SET_CONTINUE_ASSESSMENT_NOTIFICATION_SHOWN = 'SET_CONTINUE_ASSESSMENT_NOTIFICATION_SHOWN'

export type MISCELLANEOUS_ASSESSMENT_ACTIONS = SET_CONTINUE_ASSESSMENT_NOTIFICATION_SHOWN;

export const setContinueAssessmentNotificationShown = ():AssessmentActions<IAssessmentMiscellaneous> => {
    return {
        type: SET_CONTINUE_ASSESSMENT_NOTIFICATION_SHOWN,
        payload: {
            continueAssessmentNotificationShown: true
        }
    };
};

export const unsetContinueAssessmentNotificationShown = ():AssessmentActions<IAssessmentMiscellaneous> => {
    return {
        type: SET_CONTINUE_ASSESSMENT_NOTIFICATION_SHOWN,
        payload: {
            continueAssessmentNotificationShown: false
        }
    };
};