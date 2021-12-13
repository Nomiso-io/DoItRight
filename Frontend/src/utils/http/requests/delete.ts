import { request } from './request';
import { ContentTypes } from '../constants';
import { RequestHeaders } from './request-base';

export interface IDelProps<T> {
    url: string;
    state: any;
    body?: T;
    customHeaders?: RequestHeaders;
    processResponse?: <R>(response: Response) => Promise<R>;
}

export const deleteReq = <TResult, TBody>(props: IDelProps<TBody>) =>
    request<TResult, TBody>({
        ...props,
        contentType: ContentTypes.JSON,
        method: 'DELETE'
    });