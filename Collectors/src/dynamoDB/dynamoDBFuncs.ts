import { appLogger, getAWSRegion } from '../utils';
import AWS from "aws-sdk";

const dbConfig: any = {
  apiVersion: '2012-08-10',
  region: getAWSRegion()
};

if(process.env.NODE_ENV === 'local') {
    const endpoint: string = 'endpoint';
    dbConfig[endpoint] = 'http://localhost:8000';
}

const docClient: AWS.DynamoDB.DocumentClient = new AWS.DynamoDB.DocumentClient(dbConfig);

export function get<T>(params: AWS.DynamoDB.GetItemInput): Promise<T> {
    return new Promise((resolve: (item: any) => void, reject: (err: AWS.AWSError) => any): any =>
        docClient.get(params, (err: AWS.AWSError, data: AWS.DynamoDB.GetItemOutput) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }

            return resolve(data.Item);
        })
    );
}

export function put<T>(params: AWS.DynamoDB.PutItemInput): Promise<T> {
    return new Promise((resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
        docClient.put(params, (err: AWS.AWSError, data: AWS.DynamoDB.PutItemOutput) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }

            return resolve(data.Attributes);
        });
    });
}

export function update<T>(params: AWS.DynamoDB.UpdateItemInput): Promise<T> {
    return new Promise((resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
        docClient.update(params, (err: AWS.AWSError, data: AWS.DynamoDB.UpdateItemOutput) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }

            return resolve(data.Attributes);
        });
    });
}

export function getMulti<T>(params: AWS.DynamoDB.BatchGetItemInput): Promise<T> {
    return new Promise((resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
        docClient.batchGet(params, (err: AWS.AWSError, data: AWS.DynamoDB.BatchGetItemOutput) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }

            return resolve(data.Responses);
        });
    });
}

export function scan<T>(params: AWS.DynamoDB.ScanInput): Promise<T> {
    return new Promise((resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
        docClient.scan(params, async (err: AWS.AWSError, data: AWS.DynamoDB.ScanOutput) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }
            let result: any = data.Items;
            if(data.LastEvaluatedKey) {
                const newParams = params;
                newParams.ExclusiveStartKey = data.LastEvaluatedKey;
                const res: any = await scan(newParams);
                result = result.concat(res);
                return resolve(result);
            }
            return resolve(result);
        });
    });
}

export function scanNonRecursive<T>(params: AWS.DynamoDB.ScanInput): Promise<T> {
    return new Promise((resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
        docClient.scan(params, async (err: AWS.AWSError, data: AWS.DynamoDB.ScanOutput) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }
            const result: any = data.Items;
            return resolve(result);
        });
    });
}

export function putMulti<T>(params: AWS.DynamoDB.BatchWriteItemInput): Promise<T> {
    return new Promise((resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
        docClient.batchWrite(params, (err: AWS.AWSError, data: AWS.DynamoDB.BatchWriteItemOutput) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }

            return resolve(data);
        });
    });
}

export function query<T>(params: AWS.DynamoDB.QueryInput): Promise<T> {
    return new Promise((resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
        docClient.query(params, (err: AWS.AWSError, data: AWS.DynamoDB.QueryOutput) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }

            return resolve(data.Items);
        });
    });
}

export function transactWrite<T>(params: AWS.DynamoDB.TransactWriteItemsInput): Promise<T> {
    return new Promise((resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
        docClient.transactWrite(params, (err: AWS.AWSError, data: AWS.DynamoDB.TransactWriteItemsOutput) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }

            return resolve(data);
        });
    });
}

export function deleteItem<T>(params: AWS.DynamoDB.DeleteItemInput): Promise<T> {
    return new Promise((resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
        docClient.delete(params, (err: AWS.AWSError, data: AWS.DynamoDB.DeleteItemOutput) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }

            return resolve(data);
        });
    });
}

/*
exports.get = (params) => {
    return new Promise((resolve, reject) =>
        docClient.get(params, (err, data) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }
            return resolve(data.Item);
        })
    );
}

exports.put = (params) => {
    return new Promise((resolve, reject) => {
        docClient.put(params, (err, data) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }
            return resolve(data.Attributes);
        });
    });
}

exports.update = (params) => {
    return new Promise((resolve, reject) => {
        docClient.update(params, (err, data) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }
            return resolve(data.Attributes);
        });
    });
}

exports.getMulti = (params) => {
    return new Promise((resolve, reject) => {
        docClient.batchGet(params, (err, data) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }
            return resolve(data.Responses);
        });
    });
}

exports.scan = (params) => {
    return new Promise((resolve, reject) => {
        docClient.scan(params, async (err, data) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }
            let result = data.Items;
            if(data.LastEvaluatedKey) {
                const newParams = params;
                newParams.ExclusiveStartKey = data.LastEvaluatedKey;
                const res = await scan(newParams);
                result = result.concat(res);
//                return resolve(result);
            }
            return resolve(result);
        });
    });
}

exports.scanNonRecursive = (params) => {
    return new Promise((resolve, reject) => {
        docClient.scan(params, async (err, data) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }
            return resolve(data.Items);
        });
    });
}

exports.putMulti = (params) => {
    return new Promise((resolve, reject) => {
        docClient.batchWrite(params, (err, data) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }
            return resolve(data);
        });
    });
}

exports.query = (params) => {
    return new Promise((resolve, reject) => {
        docClient.query(params, (err, data) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }
            return resolve(data.Items);
        });
    });
}

exports.transactWrite = (params) => {
    return new Promise((resolve, reject) => {
        docClient.transactWrite(params, (err, data) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }
            return resolve(data);
        });
    });
}

exports.deleteItem = (params) => {
    return new Promise((resolve, reject) => {
        docClient.delete(params, (err, data) => {
            if (err) {
                appLogger.error(err);
                return reject(err);
            }
            return resolve(data);
        });
    });
}
*/
