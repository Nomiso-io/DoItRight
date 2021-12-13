import {
    RESET_STATE,
    ResetActions
} from '../../actions';
import { initialState } from '../../model';
const resetReducer = {
    [RESET_STATE]
        (action: ResetActions<{}>) {
        return {
            ...initialState
        }
    },
}

export { resetReducer };
