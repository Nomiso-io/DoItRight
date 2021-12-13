import { AssessmentActions, REMOVE_ASSESSMENT_DETAILS } from '../../actions'
import { initialState, IAssessment } from '../../model'

export const resetAssessmentReducer = {
    [REMOVE_ASSESSMENT_DETAILS]
        (state: IAssessment, action: AssessmentActions<{}>) {
        return {
            ...initialState.assessment
        }
    },
};
