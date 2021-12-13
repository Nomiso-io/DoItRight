// tslint:disable: all
import { HttpRequestError } from './http-request-error';

export class ApiError extends Error {
    public url!: string;
    public method!: string;
    public headers!: { key: string, value: string }[];
    public body!: object;
    public statusCode!: number;
    public data!: object;

    // constructor(message: any) {
    //     super(message);
    // }
}

export interface IApiErrorInfo {
    url: string;
    method: string;
    body?: {};
    headers: Headers;
    data: object;
}

const formatHeaders = (headers: Headers) => {
    const result: any = [];
    headers.forEach((value, key) => {
        result.push({ key, value });
    });

    return result;
};

export const createApiError = (error: any, info: IApiErrorInfo): ApiError => {
    let result: ApiError;

    if (error.isCustom === true) {
        const httpError = error as HttpRequestError;
        result = new ApiError(`Failed to fetch resource. ${httpError.message}`);
        //result.data = httpError.apiError;
        result.statusCode = httpError.code;
    } else {
        result = new ApiError('Failed to fetch resource. Internal server error');
    }

    result.url = info.url;
    //result.body = info.body;
    result.method = info.method;
    result.name = 'APIError';
    result.headers = formatHeaders(info.headers);

    return result;
};