import { request, requestFormData } from './request';
import { ContentTypes } from '../constants';
import { RequestHeaders } from './request-base';
import { IRootState } from '../../../reducers';

export interface IPostProps<T> {
    url: string;
    state: IRootState;
    body?: T;
    customHeaders?: RequestHeaders;
    processResponse?: <R>(response: Response) => Promise<R>;
}

export interface IUploadProps {
    url: string;
    body: FormData;
}

export const post = <TResult, TBody>(props: IPostProps<TBody>) =>
    request<TResult, TBody>({
        ...props,
        contentType: ContentTypes.JSON,
        method: 'POST'
    });

export const upload = <TResult>(props: IUploadProps) =>
    requestFormData<TResult>({
        ...props,
    });