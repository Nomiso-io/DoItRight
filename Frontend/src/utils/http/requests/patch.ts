import { request } from './request';
import { ContentTypes } from '../constants';
import { RequestHeaders } from './request-base';

export interface IPatchProps<T> {
    url: string;
    state: any;
    body: T;
    customHeaders?: RequestHeaders;
    processResponse?: <R>(response: Response) => Promise<R>;
}

export const patch = <TResult, TBody>(props: IPatchProps<TBody>) =>
    request<TResult, TBody>({
        ...props,
        contentType: ContentTypes.JSON,
        method: 'PATCH'
    });