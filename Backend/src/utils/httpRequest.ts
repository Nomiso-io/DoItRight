import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import { appLogger } from './logger';

const supportedRequestTypes: string[] = ['GET', 'POST', 'PUT', 'HEAD'];
const MAX_RETRY = 3;
const TIMEOUT_TIME = 30000; //30 seconds

export const httpRequest = (reqType: string, url: string, body: any = undefined, auth: any = undefined, headers: any = undefined): Promise<any> => {
    const reqTypeUpperCase = reqType.toUpperCase();
    if (!supportedRequestTypes.includes(reqTypeUpperCase)) {
        const err: Error = new Error(`Invalid reqType: ${reqType} for ${url}`);
        appLogger.error(err);
        throw err;
    }

    let urlObject: URL;

    try {
        urlObject = new URL(url);
    } catch (err) {
        appLogger.error({err}, `Invalid url ${url}`);
        throw err;
    }

    let protocolObj: any = http;
    if(urlObject.protocol.startsWith('https')) {
        protocolObj = https;
    } else if(urlObject.protocol.startsWith('http')) {
        protocolObj = http;
    } else {
        const err: Error = new Error(`Unsupported protocol ${urlObject.protocol} in ${url}`);
        appLogger.error(err);
        throw err;
    }

    if (body && reqTypeUpperCase !== 'POST' && reqTypeUpperCase !== 'PUT') {
//        const err: Error = new Error(`Invalid use of the body parameter while using the ${reqType} method.`);
        appLogger.warn(`Ignoring body for ${reqType} request for ${url}.`);
//        throw err;
    }

    const options: any = {
        hostname: urlObject.hostname,
        method: reqType,
        path: urlObject.pathname + urlObject.search,
        protocol: urlObject.protocol,
        timeout: TIMEOUT_TIME,
    };

    if(urlObject.port) {
        options.port = urlObject.port;
    }

    if(headers) {
        options.headers = headers;
    }

    if (body && (reqTypeUpperCase === 'POST' || reqTypeUpperCase === 'PUT')) {
        if(options.headers) {
            options.headers.set('Content-Length', Buffer.byteLength(body));
        } else {
            options.headers = {'Content-Length':Buffer.byteLength(body)};
        }
    }

    if(auth) {
        options.auth = auth;
    }

    return sendRequest(protocolObj, reqTypeUpperCase, options, body);
};

const sendRequest = (protocolObj: any, reqTypeUpperCase: string, options: any, body: any = undefined, retryNum: number = 1) => {
    appLogger.info(`Try ${retryNum} of ${MAX_RETRY} for url ${options.protocol}//${options.hostname}${options.path}`);
    return new Promise(async (resolve, reject) => {

        // Reject on max retry limit exceeded.
        if(retryNum > MAX_RETRY) {
            reject(`Try ${retryNum} exceeded max retries ${MAX_RETRY} for url ${options.protocol}//${options.hostname}${options.path}`);
        }

        //if retrying then wait for a random time and then retry
        if(retryNum > 1) {
            await new Promise((resolve1) => setTimeout(resolve1, 2000));
        }

        const clientRequest = protocolObj.request(options, (incomingMessage: any) => {

            // Retry on response error.
            incomingMessage.on('error', (err: any) => {
                appLogger.error({err}, `Error receiving response from ${options.protocol}//${options.hostname}${options.path}. Will retry.`);
//                return sendRequest(protocolObj, reqTypeUpperCase, options, body, retryNum + 1);
                //Retry on server error
                if(incomingMessage.statusCode >= 500) {
                    appLogger.error(`Received status code ${incomingMessage.statusCode} from ${options.protocol}//${options.hostname}${options.path}. Will retry.`);
                    return sendRequest(protocolObj, reqTypeUpperCase, options, body, retryNum + 1);
                }

                return reject(err);
            });

            // Response object.
            const response: {body: any; buffers: any[]; headers: any; statusCode: number|undefined } = {
                body: '',
                buffers: [],
                headers: incomingMessage.headers,
                statusCode: incomingMessage.statusCode
            };

            // Collect response body data.
            incomingMessage.on('data', (chunk: any) => {
                appLogger.info(`Received response data from ${options.protocol}//${options.hostname}${options.path}`);
                response.buffers.push(chunk);
            });

            // Resolve on end.
            incomingMessage.on('end', () => {
                appLogger.info({statusCode: response.statusCode}, `End of response from ${options.protocol}//${options.hostname}${options.path}`);
                if (response.buffers.length) {
                    response.body = Buffer.concat(response.buffers).toString();
                }

                resolve(response);
            });
            return;
        });
        appLogger.debug({clientRequest});

        // Retry on request error.
        clientRequest.on('error', (err: any) => {
            appLogger.error({err}, `Error sending request to ${options.protocol}//${options.hostname}${options.path}. Will retry.`);
            return sendRequest(protocolObj, reqTypeUpperCase, options, body, retryNum + 1);
        });

        // Write request body if present.
        if (body && (reqTypeUpperCase === 'POST' || reqTypeUpperCase === 'PUT')) {
            clientRequest.write(body);
            appLogger.info(`Sent body for ${options.protocol}//${options.hostname}${options.path}`);
        }

        // Close HTTP connection.
        clientRequest.end();
    });
};

/*
import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import { appLogger } from './logger';

const supportedRequestTypes: string[] = ['GET', 'POST', 'HEAD'];

export const httpRequest = (reqType: string, url: string, body: any = undefined, auth: any = undefined, headers: any = undefined): Promise<any> => {
    const reqTypeUpperCase = reqType.toUpperCase();
    if (!supportedRequestTypes.includes(reqTypeUpperCase)) {
        const err: Error = new Error(`Invalid reqType: ${reqType}`);
        appLogger.error(err);
        throw err;
    }

    let urlObject: URL;

    try {
        urlObject = new URL(url);
    } catch (error) {
        const err: Error = new Error(`Invalid url ${url}`);
        appLogger.error(err);
        throw err;
    }

    let protocolObj: any = http;
    if(urlObject.protocol.startsWith('https')) {
        protocolObj = https;
    } else if(urlObject.protocol.startsWith('http')) {
        protocolObj = http;
    } else {
        const err: Error = new Error(`Unsupported protocol ${urlObject.protocol}`);
        appLogger.error(err);
        throw err;
    }

    if (body && reqType !== 'POST') {
        const err: Error = new Error(`Invalid use of the body parameter while using the ${reqType} method.`);
        appLogger.error(err);
        throw err;
    }

    const options: any = {
        hostname: urlObject.hostname,
        method: reqType,
        path: url,
//        port: urlObject.port
    };

    if(urlObject.port) {
        options.port = urlObject.port;
    }

    if(headers) {
        options.headers = headers;
    }

    if(body) {
        if(options.headers) {
            options.headers.set('Content-Length', Buffer.byteLength(body));
        } else {
            options.headers = {'Content-Length': Buffer.byteLength(body)};
        }
    }

    if(auth) {
        options.auth = auth;
    }

    return new Promise((resolve, reject) => {

        const clientRequest = protocolObj.request(options, (incomingMessage: any) => {

            // Reject on response error.
            incomingMessage.on('error', (error: any) => {
                appLogger.error(error, 'Error receiving response');
                reject(error);
            });

            // Response object.
            const response: {body: any; buffers: any[]; headers: any; statusCode: number|undefined } = {
                body: '',
                buffers: [],
                headers: incomingMessage.headers,
                statusCode: incomingMessage.statusCode
            };

            // Collect response body data.
            incomingMessage.on('data', (chunk: any) => {
                response.buffers.push(chunk);
            });

            // Resolve on end.
            incomingMessage.on('end', () => {
                if (response.buffers.length) {
                    response.body = Buffer.concat(response.buffers).toString();
                }

                resolve(response);
            });
        });

        // Reject on request error.
        clientRequest.on('error', (error: any) => {
            appLogger.error(error, 'Error sending request');
            reject(error);
        });

        // Write request body if present.
        if (body) {
            clientRequest.write(body);
        }

        // Close HTTP connection.
        clientRequest.end();
    });
};
*/
