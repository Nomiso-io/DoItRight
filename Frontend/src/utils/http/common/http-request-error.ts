import { HttpCodes } from '../constants';

export class HttpRequestError extends Error {
    public response!: Response;
    public isCustom: boolean = false;
    public apiError?: object;

    constructor(public code: number, message: string) {
        super(message);

        Object.defineProperty(this, 'isNotFound', {
            get: () => {
                return this.code === HttpCodes.NotFound;
            }
        });
    }
}