import { config } from '@root/config';
import { appLogger } from '@root/utils';
import { NextFunction, Request, Response } from 'express';

const defaultSubdomain: string =
  config.defaults.subDomain[<string>process.env.DB_ENV];

export function parseSubDomain(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const originalURL: any = request.headers.origin;
  appLogger.info({ originalURL }, 'In parseSubDomain');

  let subdomain = originalURL ? getSubDomainOfURL(originalURL) : '';
  //if there is no subdomain before doitright, or if the site is being accessed using localhost or IP address,
  // then use the default subdomain of that stage
  if (
    subdomain === '' ||
    subdomain === 'doitright' ||
    /^[0-9]+$/.test(subdomain)
  ) {
    //set subdomain to default_subdomain
    appLogger.warn({ subdomain }, 'Defaulting to %s', defaultSubdomain);
    subdomain = defaultSubdomain;
  }
  appLogger.info({ subdomain });
  config.defaults.orgId = subdomain;
  next();
}

function getSubDomainOfURL(origURL: string): string {
  //cut out the substring after 'https://' or 'http://' and the first occurance of the character .
  const index = origURL.indexOf('.doitright.io');
  if (origURL.startsWith('http://') && index > 7) {
    return origURL.substring(7, index);
  }
  if (origURL.startsWith('https://') && index > 8) {
    return origURL.substring(8, index);
  }
  appLogger.warn('Invalid URL format. Returning empty subdomain.');
  return '';
}
