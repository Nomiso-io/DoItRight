
export interface Todo {
	id: number;
	text: string;
	completed: boolean;
}

export type Question = IFetctDataPayload;

export type FetchAction = 'initial' | 'start' | 'success' | 'fail'

export enum ActionType {
	ADD_TODO,
	DELETE_TODO,
	COMPLETE_TODO,
	UNCOMPLETE_TODO,
	FETCH_DATA_START,
	FETCH_DATA_SUCCESS,
	FETCH_DATA_FAIL,
}

export interface Action<T> {
	type: ActionType;
	payload: T;
}

export interface IFetctDataPayload {
	status: FetchAction;
	data: object | null;
	error?: object;
}