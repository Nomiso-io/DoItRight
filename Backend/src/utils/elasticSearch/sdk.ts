/* **** WRAPPER FUNCTIONS FOR ACCESSING ELASTICSEARCH **** */

import { Client } from '@elastic/elasticsearch';
import { config } from '@root/config';
import { appLogger } from '@utils/index';

//const esClient: Client = new Client({ node: config.esURL });
const esClient = new Client({
  auth: {
    password: config.elasticsearch.password,
    username: config.elasticsearch.username,
  },
  node: config.elasticsearch.url,
});

/* this is a paged search*/
export function search<T>(
  indexName: string,
  filters: any,
  notFilters: any,
  resultsCount: number,
  fromCount: number
): Promise<T> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: any) => any): any => {
      const query =
        Array.isArray(notFilters) && notFilters.length > 0
          ? { bool: { filter: filters, must_not: notFilters } }
          : { bool: { filter: filters } };

      esClient.search(
        {
          body: {
            from: fromCount,
            query,
            size: resultsCount,
          },
          index: indexName,
        },
        function (err, resp) {
          if (err) {
            appLogger.error(err);
            return reject(err);
          }

          return resolve(resp.body.hit.hits);
        }
      );
    }
  );
}

export function searchAll<T>(
  indexName: string,
  filters: any,
  notFilters: any
): Promise<T> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: any) => any): any => {
      const query =
        Array.isArray(notFilters) && notFilters.length > 0
          ? { bool: { filter: filters, must_not: notFilters } }
          : { bool: { filter: filters } };

      // first we do a dummy search to find the data size TODO: try using count method
      esClient.search(
        {
          body: {
            from: 0,
            query,
            size: 1,
          },
          index: indexName,
        },
        function (err, resp) {
          if (err) {
            appLogger.error(err);
            return reject(err);
          }

          const total = resp.body.hits.total.value;
          if (total === 0) {
            return resolve([]);
          }

          // then do a search for all the documents
          esClient.search(
            {
              body: {
                from: 0,
                query,
                size: total,
              },
              index: indexName,
            },
            function (err1, resp1) {
              if (err1) {
                appLogger.error(err1);
                return reject(err1);
              }

              return resolve(resp1.body.hits.hits);
            }
          );
        }
      );
    }
  );
}

export function searchAllCount(
  indexName: string,
  filters: any,
  notFilters: any
): Promise<number> {
  return new Promise(
    (resolve: (item: number) => void, reject: (err: any) => any): any => {
      const query =
        Array.isArray(notFilters) && notFilters.length > 0
          ? { bool: { filter: filters, must_not: notFilters } }
          : { bool: { filter: filters } };

      // first we do a dummy search to find the data size
      esClient.search(// TODO: try using count method instead of search
        {
          body: {
            from: 0,
            query,
            size: 1,
          },
          index: indexName,
        },
        function (err, resp) {
          if (err) {
            appLogger.error(err);
            return reject(err);
          }

          return resolve(resp.body.hits.total.value);
        }
      );
    }
  );
}

export function fetchAll<T>(indexName: string): Promise<T> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: any) => any): any => {
      // first we do a dummy search to find the data size TODO: try using count method
      esClient.search(
        {
          body: {
            from: 0,
            query: { match_all: {} },
            size: 1,
          },
          index: indexName,
        },
        function (err, resp) {
          if (err) {
            appLogger.error(err);
            return reject(err);
          }

          const total = resp.body.hits.total.value;
          if (total === 0) {
            return resolve([]);
          }

          // then do a search for all the documents
          esClient.search(
            {
              body: {
                from: 0,
                query: { match_all: {} },
                size: total,
              },
              index: indexName,
            },
            function (err1, resp1) {
              if (err1) {
                appLogger.error(err1);
                return reject(err1);
              }

              return resolve(resp1.body.hits.hits);
            }
          );
        }
      );
    }
  );
}

export function fetchAllCount(indexName: string): Promise<number> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: any) => any): any => {
      // first we do a dummy search to find the data size
      esClient.search(// TODO: try using count method instead of search
        {
          body: {
            from: 0,
            query: { match_all: {} },
            size: 1,
          },
          index: indexName,
        },
        function (err, resp) {
          if (err) {
            appLogger.error(err);
            return reject(err);
          }

          return resolve(resp.body.hits.total.value);
        }
      );
    }
  );
}

export function fetchFields<T>(indexName: string, fields: any[]): Promise<T> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: any) => any): any => {
      // first we do a dummy search to find the data size TODO: try using count method
      esClient.search(
        {
          body: {
            _source: fields, //TODO: try using stored_fields attribute of search method
            from: 0,
            query: { match_all: {} },
            size: 1,
          },
          index: indexName,
        },
        function (err, resp) {
          if (err) {
            appLogger.error(err);
            return reject(err);
          }

          const total = resp.body.hits.total.value;
          if (total === 0) {
            return resolve([]);
          }

          // then do a search for all the documents
          esClient.search(
            {
              body: {
                _source: fields,
                from: 0,
                query: { match_all: {} },
                size: total,
              },
              index: indexName,
            },
            function (err1, resp1) {
              if (err1) {
                appLogger.error(err1);
                return reject(err1);
              }

              return resolve(resp1.body.hits.hits);
            }
          );
        }
      );
    }
  );
}

export function searchSorted<T>(
  indexName: string,
  filters: any,
  notFilters: any,
  sort: string[]
): Promise<T> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: any) => any): any => {
      const query =
        Array.isArray(notFilters) && notFilters.length > 0
          ? { bool: { filter: filters, must_not: notFilters } }
          : { bool: { filter: filters } };

      // first we do a dummy search to find the data size TODO: try using count method
      esClient.search(
        {
          body: {
            query,
          },
          from: 0,
          index: indexName,
          size: 1,
          sort,
        },
        function (err, resp) {
          if (err) {
            appLogger.error(err);
            return reject(err);
          }

          const total = resp.body.hits.total.value;
          if (total === 0) {
            return resolve([]);
          }

          // then do a search for all the documents
          esClient.search(
            {
              body: {
                query,
              },
              from: 0,
              index: indexName,
              size: total,
              sort,
            },
            function (err1: any, resp1: any) {
              if (err1) {
                appLogger.error(err1);
                return reject(err1);
              }

              return resolve(resp1.body.hits.hits);
            }
          );
        }
      );
    }
  );
}
