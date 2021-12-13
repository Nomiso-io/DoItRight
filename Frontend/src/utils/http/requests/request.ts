import { ContentTypes, RequestMethods } from '../constants';
import {
    getUserSpecificHeaders,
    getUserAgnosticHeaders,
    getBaseHeaders,
    IInputQuery,
    beforeAuthorizedRequestAction
} from '../common';
import { baseRequest, baseFormDataRequest, RequestHeaders } from './request-base';
import { IRootState } from '../../../reducers';

export interface IRequestParams<T> {
    url: string;
    queryString?: IInputQuery;
    hostUrl?: string;
    state?: IRootState;
    method: RequestMethods;
    contentType: ContentTypes;
    body?: T;
    customHeaders?: RequestHeaders;
    processResponse?: <R>(response: Response) => Promise<R>;
}

export interface IRequestAnonymousParams<T> {
    url: string;
    queryString?: IInputQuery;
    hostUrl?: string;
    method: RequestMethods;
    contentType: ContentTypes;
    body?: T;
    processResponse?: <R>(response: Response) => Promise<R>;
}

export interface IFormDataRequestParams {
    url: string;
    queryString?: IInputQuery;
    state?: any;
    hostUrl?: string;
    body: FormData;
}

export const request = <TResult, TBody = {}>(params: IRequestParams<TBody>) => {
    const {
        url,
        queryString,
        hostUrl,
        method,
        contentType,
        state,
        body,
        customHeaders,
        processResponse } = params;
    const baseHeaders = getBaseHeaders(contentType);
    const userSpecificHeaders = getUserSpecificHeaders(state);
    const userAgnosticHeaders = getUserAgnosticHeaders();

    const checkBeforeRequest = beforeAuthorizedRequestAction ?
        beforeAuthorizedRequestAction() : Promise.resolve();

    return checkBeforeRequest.then<TResult>(() =>
        baseRequest<TResult, TBody>({
            method,
            contentType,
            body,
            url,
            queryString,
            hostUrl,
            headers: {
                ...baseHeaders, ...userSpecificHeaders,
                ...userAgnosticHeaders, ...(customHeaders || {})
            },
            ...processResponse && { processResponse }
        }));
};

export const requestAnonymous = <TResult, TBody = {}>(params: IRequestAnonymousParams<TBody>) => {
    const { url, queryString, hostUrl, method, contentType, body, processResponse } = params;
    const baseHeaders = getBaseHeaders(contentType);

    return baseRequest<TResult, TBody>({
        method,
        contentType,
        body,
        url,
        queryString,
        hostUrl,
        headers: { ...baseHeaders },
        ...processResponse && { processResponse }
    });
};

export const requestFormData = <TResult>(params: IFormDataRequestParams) => {
    const { url, queryString, hostUrl, body, state } = params;
    const baseHeaders = getBaseHeaders();
    const customHeaders = getUserSpecificHeaders(state);

    const checkBeforeRequest = beforeAuthorizedRequestAction ?
        beforeAuthorizedRequestAction() : Promise.resolve();

    return checkBeforeRequest.then<TResult>(() =>
        baseFormDataRequest<TResult>({
            body,
            url,
            queryString,
            hostUrl,
            headers: { ...baseHeaders, ...customHeaders },
            method: 'POST',
        })
    );
};