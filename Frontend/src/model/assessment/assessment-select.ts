import { FetchAction } from '..';

export interface ILoadAssessmentTypeRequest {
    status: FetchAction;
    data: any | null;
    error?: object | null;
}