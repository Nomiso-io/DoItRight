import { SET_CONTINUE_ASSESSMENT_NOTIFICATION_SHOWN, AssessmentActions } from '../../actions';
import { IAssessment } from '../../model';
import { IAssessmentMiscellaneous } from '../../model/assessment/miscellaneous';

export const assessmentsMiscellaneousReducer = {
    [SET_CONTINUE_ASSESSMENT_NOTIFICATION_SHOWN]
    (state: IAssessment, action: AssessmentActions<IAssessmentMiscellaneous>) {
        {
            return {
                ...state,
                misc: { ...action.payload }
            };
        }
    }
};
