import { appLogger, responseBuilder } from '@root/utils';
import { NextFunction, Request, Response } from 'express';

export function catchAllErrorHandler(
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
): void {
  appLogger.error({ err: error });

  if (error.name === 'notFound') {
    return responseBuilder.notFound(error, response);
  }
  return responseBuilder.internalServerError(error, response);
}
