import { apiHostUrl } from '../config';

export const hostUrl = apiHostUrl;

// include the credentials only if

export enum HttpCodes {
    BadRequest = 400,
    Unauthorized = 401,
    NotFound = 404,
    ServiceUnavailable = 503,
    RequestTimeout = 504,
    Success = 200,
    Created = 201
};

export const httpCodeMessages = [{
    key: HttpCodes.BadRequest, value: 'Error executing request, try again'
}, {
    key: HttpCodes.Unauthorized, value: 'Unauthorized'
}, {
    key: HttpCodes.NotFound, value: 'Not Found'
}, {
    key: HttpCodes.ServiceUnavailable, value: 'Service Unavailable'
}, {
    key: HttpCodes.RequestTimeout, value: 'Request timeout, try again later'
}, {
    key: HttpCodes.Success, value: 'Success'
}, {
    key: HttpCodes.Created, value: 'Created'
}];

export type RequestMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export enum ContentTypes {
    JSON = 'application/json',
    Form = 'application/x-www-form-urlencoded',
    PDF = 'application/pdf',
    CSV = 'text/csv'
};

export enum HttpHeaders {
    ContentType = 'Content-Type',
    ContentDisposition = 'Content-Disposition'
};

export const RequestModeCors: RequestMode = 'cors';

export const PlrTransactionIdType = {
    0: 'DASHBOARD_SELECT_CIDN_PAGE',
    1: 'SUPPORT_FEEDBACK_PAGE',
    2: 'FIRST_TIME_SELECT_CIDN_PAGE',
    3: 'VIEW_REQUEST_LIST_PAGE',
    4: 'VIEW_REQUEST_CATALOGUE_PAGES',
    5: 'VIEW_REQUEST_FORM_PAGES',
}

export const PLRPathList = [
    '/app/dashboard',
    '/app/support/feedback',
    '/app/select-company',
    '/app/service-requests/open',
    '/app/service-requests/closed',
    '/app/service-requests/new-request'
]

// tslint:disable-next-line: max-line-length
export const StaffRequestAccessURL = 'https://teamtelstra.sharepoint.com/sites/B2BDigitalTransformationHub/SitePages/Staff-Access-to-Telstra-Connect.aspx?web=1';