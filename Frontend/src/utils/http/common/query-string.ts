import * as qs from 'query-string';
import { ContentTypes } from '../constants';

export interface IInputQuery {
    [key: string]: string | number | boolean | object;
};

// tslint:disable-next-line: no-any
export const tryStringifyByContent = (data: any, contentType: ContentTypes): string | undefined => {
    if (!data) {
        return undefined;
    }

    switch (contentType) {
        case ContentTypes.JSON:
            return JSON.stringify(data);
        case ContentTypes.Form:
            return qs.stringify(data);
        default:
            return undefined;
    }
};

export const stringifyQuery = (value: IInputQuery) => {
    return qs.stringify(value);
};