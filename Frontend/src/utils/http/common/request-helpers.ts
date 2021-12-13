import { httpCodeMessages } from '../constants';
import { HttpRequestError } from './http-request-error';

const mapStatusError = (status: number) => {
    const entry = httpCodeMessages.find(item => item.key === status);
    return entry ? entry.value : 'Error executing request';
};

export const getApiError = (response: Response): Promise<object> =>
    response.json()
        .then((error: object) => error)
        .catch(() => ({}));

export const createException = (response: Response, apiError?: object): HttpRequestError => {
    const message = mapStatusError(response.status);
    const error = new HttpRequestError(response.status, message);
    error.isCustom = true;
    error.response = response;
    error.apiError = apiError;
    return error;
};