import { request, requestAnonymous } from './request';
import { IInputQuery } from '../common';
import { RequestHeaders } from './request-base';
import { ContentTypes } from '../constants';

export interface IGetProps {
    url: string;
    state?: any;
    queryString?: IInputQuery;
    customHeaders?: RequestHeaders;
    processResponse?: <R>(response: Response) => Promise<R>;
}

export interface IGetAnonymousProps {
    url: string;
    queryString?: IInputQuery;
    processResponse?: <R>(response: Response) => Promise<R>;
}

export const get = <TResult>(props: IGetProps) =>
    request<TResult>({
        contentType: ContentTypes.JSON,
        ...props,
        method: 'GET',
    });

export const getAnonymous = <TResult>(props: IGetAnonymousProps) =>
    requestAnonymous<TResult>({
        contentType: ContentTypes.JSON,
        ...props,
        method: 'GET',
    });