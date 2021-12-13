import * as bunyan from 'bunyan';
import { NextFunction, Request, Response } from 'express';

//Read the documentation in https://github.com/trentm/node-bunyan to know how to use it.

export const appLogger: bunyan = bunyan.createLogger({
    level: <bunyan.LogLevelString>process.env.logLevel,
    name: 'doitright-backend',
    serializers: bunyan.stdSerializers,
    src: true,
    stream: process.stdout
});

export function logRequest(request: Request, response: Response, next: NextFunction): void {
    //request object will be logged irrespective of the current log level set
    const level = appLogger.level();
    appLogger.level('debug');
    const log = appLogger.child({
        body: request.body
      }, true);
    log.info({req: request});
    appLogger.level(level);
    next();
}
/*
export function logError(error: Error, request: Request, response: Response, next: NextFunction): void {
    appLogger.error({err: error}, error.stack);
    next(error);
}
*/
export function logResponse(request: Request, response: Response, next: NextFunction): void {
    //response object will be logged irrespective of the current log level set
    function afterResponse() {
        response.removeListener('finish', afterResponse);
        response.removeListener('close', afterResponse);
        const level = appLogger.level();
        appLogger.level('debug');
        appLogger.info({res: response});
        appLogger.level(level);
    }

    response.on('finish', afterResponse);
    response.on('close', afterResponse);
    next();
}

export function reinitLogger (logLevel: string) {
    appLogger.level(<bunyan.LogLevelString>logLevel);
    appLogger.info('Log level reinitialized to [%s]', appLogger.level());
}
