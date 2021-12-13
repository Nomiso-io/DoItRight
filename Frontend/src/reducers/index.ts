import { History } from 'history';
import { combineReducers } from 'redux';
import { IAssessment, IAuthDetails, IAdmin } from '../model';
import * as assessmentReducer from './assessment';
import * as userReducer from './user';
import * as adminReducer from './admin';
import * as displayStateReducer from './display';
import * as systemDetailsReducer from './system';
import { IDisplayState } from '../model/display';
import { ISystemDetails } from '../model/system';

export interface IRootState {
	assessment: IAssessment;
	user: IAuthDetails;
	admin: IAdmin;
	display: IDisplayState;
	systemDetails: ISystemDetails;
}

export default (history: History) =>
	combineReducers({
		...assessmentReducer,
		...userReducer,
		...adminReducer,
		...displayStateReducer,
		...systemDetailsReducer
	});
