import { appLogger, config, getTableNameForOrg } from '../utils';
import * as esDBFuncs from './esFuncs';

interface ESStateDataItem {
  _id: string;
  _index: string;
  _score: number;
  _source: IStateDatabaseItem;
  _type: string;
}

export interface IStateDatabaseItem {
	toolName: string;
	teamId: string;
	project: string;
//	url: string;
	lastAccessed: number;
	details?: any;
}

export const getLastState = async (
	{toolName, teamId, project}: {toolName: string, teamId: string, project: string}
): Promise<IStateDatabaseItem> => {
    return new Promise((resolve: (item: any) => void, reject: (err: any) => any): any => {
//		appLogger.info('getLastState function', {toolName, teamId, project});
		const filters: any[] = [
			{ term: { toolName: toolName } },
			{ term: { teamId: teamId } },
			{ term: { project: project } }
		];
	
		esDBFuncs.searchAll<ESStateDataItem[]>(getTableNameForOrg(config.stateIndex), filters, [])
		.then( (result: ESStateDataItem[] )	=> {
//			appLogger.info(result);
			if(!result || result.length == 0) {
				return resolve(null);
			} else {
				return resolve(result[0]._source);
			}
		})
		.catch((err: any) => {
			appLogger.error({err, filters: filters}, "Error getting last state");
			return reject(err);
		})
	})
}

export const setLastState = async (state: IStateDatabaseItem): Promise<any> => {
    return new Promise((resolve: (item: any) => void, reject: (err: any) => any): any => {
//		appLogger.info('setLastState function', {state});
		const filters: any[] = [
			{ term: { toolName: state.toolName } },
			{ term: { teamId: state.teamId } },
			{ term: { project: state.project } }
		];

		esDBFuncs.updateOrInsert(getTableNameForOrg(config.stateIndex), filters, [], state)
		.then( (result: any )	=> {
//			appLogger.info(result);
			return resolve(result);
		})
		.catch((err: any) => {
			appLogger.error({err, filters: filters, stateItem: state}, "Error setting last state");
			return reject(err);
		})
	})
	
}
