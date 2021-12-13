
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';

export function useActions(actions: any, deps?: any): any {
	const dispatch = useDispatch();
	return useMemo(
		() => {
			if (Array.isArray(actions)) {
				return actions.map(a => bindActionCreators(a, dispatch));
			}
			return bindActionCreators(actions, dispatch);
		},
		deps ? [dispatch, ...deps] : deps,
	);
}

export * from './assessment';
export * from './user';
export * from './result';
export * from './feedback';
export * from './reset';
export * from './admin';
export * from './display';
export * from './system';
