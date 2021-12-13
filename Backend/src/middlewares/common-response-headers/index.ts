import { appLogger } from '@root/utils';
import { NextFunction, Request, Response } from 'express';

export function commonResponseHeaders(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  appLogger.info('Setting Content-Type in commonResponseHeaders');

  response.setHeader('Content-Type', 'application/json');
  next();
}
