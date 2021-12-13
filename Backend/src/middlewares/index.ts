// tslint:disable:deprecation
import { config } from '@root/config';
import { logRequest, logResponse } from '@root/utils';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import { Application, NextFunction, Request, Response } from 'express';
import { catchAllErrorHandler } from './catchAllErrorHandler';
import { commonResponseHeaders } from './common-response-headers';
import { initializeLoggerAndConfig } from './initializeLoggerAndConfig';
import { invalidRouteHandler } from './invalidRouteHandler';
import { parseSubDomain } from './parseSubDomain';
import { tokenValidator } from './tokenValidator';

type Middleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => void;

export function registerInitialMiddlewares(application: Application): void {
  const middlewares: Middleware[] = [
    cors(config.cors),
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    commonResponseHeaders,
    logRequest,
    logResponse,
    parseSubDomain,
    initializeLoggerAndConfig,
    tokenValidator,
  ];

  application.use(middlewares);
}

export function registerTrailerMiddlewares(application: Application): void {
  //catch all unmatched routes handler
  application.use(invalidRouteHandler);

  //error handler for any errors not already caught
  application.use(catchAllErrorHandler);
  //    application.use((error: Error, request: Request, response: Response, next: NextFunction): void  => responseBuilder.internalServerError(error, response));
}
