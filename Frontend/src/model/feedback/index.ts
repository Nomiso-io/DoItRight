import { FetchAction } from '../';
export interface IFeedbackPayload {
    rating: number;
    comment: string;
}
export interface IFeedback {
    message: string;
}
export type IFeedbackResponse = IFeedback;
export interface ILoadFeedbackRequest {
    data: IFeedbackResponse | null;
    status: FetchAction;
    error?: object | null;
}