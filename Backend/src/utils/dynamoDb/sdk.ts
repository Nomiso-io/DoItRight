/* **** WRAPPER FUNCTIONS FOR ACCESSING DYNAMODB **** */

import { config } from '@root/config';
import { appLogger } from '@root/utils';
import AWS, { DynamoDB } from 'aws-sdk';

const dbConfig = {
  apiVersion: '2012-08-10',
  region: config.region,
};

//if(process.env.DB_ENV === 'local') {
//    const endpoint = 'endpoint';
//    dbConfig[endpoint] = 'http://localhost:8000';
//}
const docClient: DynamoDB.DocumentClient = new AWS.DynamoDB.DocumentClient(
  dbConfig
);

export function get<T>(params: DynamoDB.GetItemInput): Promise<T> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: AWS.AWSError) => any): any =>
      docClient.get(
        params,
        (err: AWS.AWSError, data: DynamoDB.GetItemOutput) => {
          if (err) {
            appLogger.error(err);
            return reject(err);
          }

          return resolve(data.Item);
        }
      )
  );
}

export function put<T>(params: DynamoDB.PutItemInput): Promise<T> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
      docClient.put(
        params,
        (err: AWS.AWSError, data: DynamoDB.PutItemOutput) => {
          if (err) {
            appLogger.error(err);
            return reject(err);
          }

          return resolve(data.Attributes);
        }
      );
    }
  );
}

export function update<T>(params: DynamoDB.UpdateItemInput): Promise<T> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
      docClient.update(
        params,
        (err: AWS.AWSError, data: DynamoDB.UpdateItemOutput) => {
          if (err) {
            appLogger.error(err);
            return reject(err);
          }

          return resolve(data.Attributes);
        }
      );
    }
  );
}

export function getMulti<T>(params: DynamoDB.BatchGetItemInput): Promise<T> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
      docClient.batchGet(
        params,
        (err: AWS.AWSError, data: DynamoDB.BatchGetItemOutput) => {
          if (err) {
            appLogger.error(err);
            return reject(err);
          }

          return resolve(data.Responses);
        }
      );
    }
  );
}

export function scan<T>(params: DynamoDB.ScanInput): Promise<T> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
      docClient.scan(
        params,
        async (err: AWS.AWSError, data: DynamoDB.ScanOutput) => {
          if (err) {
            appLogger.error(err);
            return reject(err);
          }
          let result: any = data.Items;
          if (data.LastEvaluatedKey) {
            const newParams = params;
            newParams.ExclusiveStartKey = data.LastEvaluatedKey;
            const res: any = await scan(newParams);
            result = result.concat(res);
            return resolve(result);
          }
          return resolve(result);
        }
      );
    }
  );
}

export function scanNonRecursive<T>(params: DynamoDB.ScanInput): Promise<T> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
      docClient.scan(
        params,
        async (err: AWS.AWSError, data: DynamoDB.ScanOutput) => {
          if (err) {
            appLogger.error(err);
            return reject(err);
          }
          const result: any = data.Items;
          return resolve(result);
        }
      );
    }
  );
}

export function putMulti<T>(params: DynamoDB.BatchWriteItemInput): Promise<T> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
      docClient.batchWrite(
        params,
        (err: AWS.AWSError, data: DynamoDB.BatchWriteItemOutput) => {
          if (err) {
            appLogger.error(err);
            return reject(err);
          }

          return resolve(data);
        }
      );
    }
  );
}

export function query<T>(params: DynamoDB.QueryInput): Promise<T> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
      docClient.query(
        params,
        (err: AWS.AWSError, data: DynamoDB.QueryOutput) => {
          if (err) {
            appLogger.error(err);
            return reject(err);
          }

          return resolve(data.Items);
        }
      );
    }
  );
}

export function transactWrite<T>(
  params: DynamoDB.TransactWriteItemsInput
): Promise<T> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
      docClient.transactWrite(
        params,
        (err: AWS.AWSError, data: DynamoDB.TransactWriteItemsOutput) => {
          if (err) {
            appLogger.error(err);
            return reject(err);
          }

          return resolve(data);
        }
      );
    }
  );
}

export function deleteItem<T>(params: DynamoDB.DeleteItemInput): Promise<T> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: AWS.AWSError) => any) => {
      docClient.delete(
        params,
        (err: AWS.AWSError, data: DynamoDB.DeleteItemOutput) => {
          if (err) {
            appLogger.error(err);
            return reject(err);
          }

          return resolve(data);
        }
      );
    }
  );
}
