//const jwkToPem: any = require('jwk-to-pem');
import { config } from '@root/config';
import { appLogger, updateCognitoUserToLowerCase } from '@root/utils';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import request from 'request';

export function validateToken(authHeader: string, callback: any): void {
  const token: string = authHeader.substring(7);
  appLogger.info('validateToken token=%s', token);

  /*    if (process.env.NODE_ENV === 'local') {
        const decodedJwt: any = jwt.decode(token, { complete: true });
        if(!decodedJwt) {
            const err = new Error('Invalid Token');
            appLogger.info(err, 'NODE_ENV=local');
            return callback(err, undefined);
        }
        appLogger.info(decodedJwt.payload, 'NODE_ENV=local');
        return callback(undefined, decodedJwt.payload);
    }
*/
  const poolUrl = `https://cognito-idp.${config.region}.amazonaws.com/${config.cognito.userPoolId}/.well-known/jwks.json`;

  request(
    {
      json: true,
      url: poolUrl,
    },
    (error: any, response: any, body: any) => {
      if (error || response.statusCode !== 200) {
        appLogger.error(
          { err: error },
          'Network Error! Unable to download JWTs.'
        );
        return callback({ message: 'network error' }, undefined);
      }

      const pems: object = {};
      appLogger.info(
        { cognito_response_body: body },
        'body received from cognito'
      );
      const keys: any = body[`keys`];
      for (const key of keys) {
        const keyId: string = key.kid;
        const modulus: string = key.n;
        const exponent: string = key.e;
        const keyType: string = key.kty;
        //            appLogger.info('keyId=%s, modulus=%s, exponent=%s, keyType=%s', keyId, modulus, exponent, keyType);
        const jwk: any = { kty: keyType, n: modulus, e: exponent };
        const PEM: any = jwkToPem(jwk);
        pems[keyId] = PEM;
      }
      // Validate the token
      const decodedJwt: any = jwt.decode(token, { complete: true });
      if (!decodedJwt || !decodedJwt.header) {
        const err = new Error('Invalid Token');
        appLogger.info(err, 'No decodedJwt object or header');
        return callback(err, undefined);
      }

      const kid: string = decodedJwt.header.kid;
      const pem: any = pems[kid];
      if (!pem) {
        appLogger.error('Invalid Token. No pem found for kid=%s', kid);
        return callback(new Error('Invalid Token'), undefined);
      }

      jwt.verify(token, pem, function (err: any, payload: any): void {
        if (err) {
          appLogger.error({ err }, 'Invalid token. Jwt verify failed.');
          return callback(new Error('Invalid Token'), undefined);
        }
        if (payload['cognito:groups']) {
          const precedenceOrder: any = config.precedenceOrder;
          payload['cognito:groups'].sort((a: any, b: any) => {
            if (precedenceOrder[a] > precedenceOrder[b]) {
              return 1;
            }
            if (precedenceOrder[a] < precedenceOrder[b]) {
              return -1;
            }
            return 0;
          });
        }
        if (!payload['cognito:groups']) {
          payload['cognito:groups'] = config.defaults.groups;
        }
        if (!payload['custom:teamName']) {
          payload['custom:teamName'] = config.defaults.teamName;
        }
        if (payload.email.match(/[A-Z]+/)) {
          updateCognitoUserToLowerCase(payload.sub, payload.email)
            .then((res) => {
              appLogger.info({ updateCognitoUserToLowerCase_result: res });
            })
            .catch((e: any) =>
              appLogger.warn({ updateCognitoUserToLowerCase_error: e })
            );
        }
        appLogger.info({ data: payload }, 'Valid token');
        return callback(undefined, payload);
      });
    }
  );
}
