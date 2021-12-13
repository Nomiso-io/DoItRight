import { request } from './request';
import { ContentTypes } from '../constants';
import { RequestHeaders } from './request-base';

export interface IPutProps<T> {
    url: string;
    state: any;
    body?: T;
    customHeaders?: RequestHeaders;
    processResponse?: <R>(response: Response) => Promise<R>;
}

export const put = <TResult, TBody>(props: IPutProps<TBody>) =>
    request<TResult, TBody>({
        ...props,
        contentType: ContentTypes.JSON,
        method: 'PUT'
    });