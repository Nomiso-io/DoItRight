import {
    hostUrl,
    HttpCodes,
    HttpHeaders,
    ContentTypes,
    RequestMethods,
    RequestModeCors
} from '../constants';
import {
    getApiError,
    createException,
    unauthorizedAction,
    tryStringifyByContent,
    stringifyQuery,
    IInputQuery,
} from '../common';

export type RequestHeaders = string[][] | { [key: string]: string };

export interface IBaseRequestParams<T> {
    url: string;
    queryString?: IInputQuery;
    hostUrl?: string;
    headers: RequestHeaders;
    method: RequestMethods;
    contentType: ContentTypes;
    body?: T;
    processResponse?: <R>(response: Response) => Promise<R>;
}

export interface IBaseFormDataRequestParams {
    url: string;
    queryString?: IInputQuery;
    hostUrl?: string;
    headers: RequestHeaders;
    method: RequestMethods;
    body: FormData;
}

const toHeaders = (headers: RequestHeaders): Headers => {
    return new Headers({
        ...(headers || {})
    });
}

const decorateQuery = (url: string, queryString?: IInputQuery) => {
    return queryString ? `${url}?${stringifyQuery(queryString)}` : url;
};

const formatUrl = (params: { hostUrl?: string, url: string, queryString?: IInputQuery }) => {
    return `${params.hostUrl || hostUrl}${decorateQuery(params.url, params.queryString)}`;
}

export const baseRequest = <TResult, TBody = {}>(params: IBaseRequestParams<TBody>) => {
    const { headers: requestHeaders, body: requestBody, contentType, processResponse } = params;

    const headers = toHeaders(requestHeaders)
    const body = tryStringifyByContent(requestBody, contentType);
    const url = formatUrl(params);

    const init = {
        body,
        headers,
        method: params.method,
        mode: RequestModeCors,
    };

    const fetchParams = {
        logBodyWhenError: true,
        ...processResponse && { processResponse }
    };

    return fetchIt<TResult>(url, init, fetchParams);
};

export const baseFormDataRequest = <TResult>(params: IBaseFormDataRequestParams) => {
    const headers = toHeaders(params.headers)

    const init = {
        headers,
        method: params.method,
        mode: RequestModeCors,
        body: params.body
    };

    const url = formatUrl(params);
    return fetchIt<TResult>(url, init, { logBodyWhenError: false });
};

interface IFetchItParams {
    logBodyWhenError: boolean;
    processResponse?: <R>(response: Response) => Promise<R>;
}

const fetchIt = <TResult>
    (url: string, init: RequestInit, params: IFetchItParams = { logBodyWhenError: true }):
    Promise<any> => {
    const fetchOptions: RequestInit = {
        ...init,
        credentials: 'omit'
    };
    return fetch(url, fetchOptions)
        .then((response) => {
            if (response.status === HttpCodes.Unauthorized) {
                unauthorizedAction();
                throw createException(response);
            }

            if (response.status > HttpCodes.BadRequest) {
                throw createException(response);
            }

            return response;
        })
        .then((response) => {
            if (response.status === HttpCodes.BadRequest) {
                return getApiError(response)
                    .then((genericError) => {
                        throw createException(response, genericError);
                    });
            }

            if (params.processResponse) {
                return params.processResponse(response);
            }

            const contentType = (response.headers.get(HttpHeaders.ContentType) || '')
                .toLowerCase();

            if (contentType.indexOf(ContentTypes.JSON) !== -1) {
                return response.json();
            }
        })
        .catch((error) => {
            throw error;
        });
};