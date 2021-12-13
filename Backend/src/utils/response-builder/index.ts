import { config } from '@root/config';
import { appLogger } from '@utils/index';
import { Response } from 'express';

export type Acknowledgement = object;
//export interface Error { message: string; }
export type FORBIDDEN = (error: Error, response: Response) => void;
export type OK = (acknowledgement: Acknowledgement, response: Response) => void;
export type INTERNAL_SERVER_ERROR = (error: Error, response: Response) => void;
export type UNAUTHORIZED = (error: Error, response: Response) => void;
export type BAD_REQUEST = (error: Error, response: Response) => void;
export type NOT_FOUND = (error: Error, response: Response) => void;

export interface ResponseBuilder {
    badRequest: BAD_REQUEST;
    forbidden: FORBIDDEN;
    internalServerError: INTERNAL_SERVER_ERROR;
    notFound: NOT_FOUND;
    ok: OK;
    unauthorized: UNAUTHORIZED;
}

export const responseBuilder: ResponseBuilder = {
    badRequest: (error, response: Response): void => {
        appLogger.error({Response_BadRequest: error});
        response.status(config.statusCodes.badRequest).send({ msg: error.message });
    },
    forbidden: (error, response: Response): void => {
        appLogger.error({Response_Forbidden: error});
        response.status(config.statusCodes.forbidden).send({ msg: error.message });
    },
    internalServerError: (error, response: Response): void => {
        appLogger.error({Response_InternalServerError: error});
        response.status(config.statusCodes.internalServerError).send({ msg: error.message });
    },
    notFound: (error, response: Response): void => {
        appLogger.error({Response_NotFound: error});
        response.status(config.statusCodes.notFound).send({ msg: error.message });
    },
    ok: (acknowledgement: Acknowledgement, response: Response): void => {
        const level = appLogger.level();
        appLogger.level('debug');
        appLogger.info({Response_ok: acknowledgement});
        appLogger.level(level);
        response.status(config.statusCodes.ok).send(acknowledgement);
    },
    unauthorized: (error, response: Response): void => {
        appLogger.error({Response_Unauthorized: error});
        response.status(config.statusCodes.unauthorized).send({ msg: error.message });
    }
};
