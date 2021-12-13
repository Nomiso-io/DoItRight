import { NextFunction, Request, Response } from 'express';

export function invalidRouteHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const error = new Error('Invalid URL. Page not found.');
  error.name = 'notFound';
  next(error);
}
