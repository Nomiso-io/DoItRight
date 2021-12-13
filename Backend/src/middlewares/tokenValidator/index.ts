import { appLogger, responseBuilder } from '@root/utils';
import { NextFunction, Request, Response } from 'express';
import { validateToken } from './decodeCognitoToken';

export function tokenValidator(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  //skip the validator if 'noauthvalidate' header is set
  if (
    request.headers.noauthvalidate &&
    request.headers.noauthvalidate === 'true'
  ) {
    appLogger.info(
      { noauthvalidate: request.headers.noauthvalidate },
      'Skipping Token Validation'
    );
    return next();
  }

  const idToken: any = request.headers.authorization;
  appLogger.info('TokenValidator idToken=%s', idToken);
  if (!idToken) {
    const err = new Error('Invalid: Missing Token');
    appLogger.error(err);
    return responseBuilder.unauthorized(err, response); // Should call next(err)
  }

  try {
    validateToken(idToken, (error: any, payload: any) => {
      if (error) {
        appLogger.error({ err: error }, 'Invalid Token');
        return responseBuilder.unauthorized(error, response); // Should call next(err)
      }
      appLogger.info({ user: payload });
      request.headers.user = payload;
      return next();
    });
  } catch (err) {
    appLogger.error(err);
    return responseBuilder.badRequest(err, response); // Should call next(err)
  }
}
