import { Client } from '@elastic/elasticsearch';
import { appLogger, getElasticSearchPassword, getElasticSearchURL, getElasticSearchUsername } from '../utils';

//const esClient: Client = new Client({ node: getElasticSearchURL() });
const esClient = new Client({
  auth: {
    password: getElasticSearchPassword(),
    username: getElasticSearchUsername(),
  },
  node: getElasticSearchURL(),
});

export const createIndex = async (indexName: string, properties: any) => {
  await esClient.indices.create({
    index: indexName,
    body: {
      mappings: {
        properties: properties,
      },
    },
  });
};

export const refresh = async (indexName: string) => {
  //We need to force an index refresh at this point, otherwise we will not get any result in the consequent search
  await esClient.indices.refresh({ index: indexName });
};

export const insert = async (indexName: string, data: any) => {
  await esClient.index({
    index: indexName,
    refresh: true,
    body: data,
  });
};

//TODO: implement properly. It's not implemented yet
export const insertBulk = async (indexName: string, dataset: any[]) => {
  // example of bulk operation
  esClient.bulk(
    {
      body: [
        // action description
        { index: { _index: 'test', _type: 'test', _id: 1 } },
        // the document to index
        { title: 'foo' },
        // action description
        { update: { _index: 'test', _type: 'test', _id: 332 } },
        // the document to update
        { doc: { title: 'foo' } },
        // action description
        { delete: { _index: 'test', _type: 'test', _id: 33 } },
        // no document needed for this delete
      ],
    },
    function (err, resp) {
      if (err /*resp.errors*/) {
        appLogger.info(JSON.stringify(resp, null, '\t'));
      }
    }
  );

  /*/Response
{
        "took": 13,
        "errors": true,
        "items": [
                {
                        "index": {
                                "_index": "test",
                                "_type": "test",
                                "_id": "1",
                                "_version": 20,
                                "_shards": {
                                        "total": 2,
                                        "successful": 1,
                                        "failed": 0
                                },
                                "status": 200
                        }
                },
                {
                        "update": {
                                "_index": "test",
                                "_type": "test",
                                "_id": "332",
                                "status": 404,
                                "error": {
                                        "type": "document_missing_exception",
                                        "reason": "[test][332]: document missing",
                                        "shard": "-1",
                                        "index": "test"
                                }
                        }
                },
                {
                        "delete": {
                                "_index": "test",
                                "_type": "test",
                                "_id": "33",
                                "_version": 2,
                                "_shards": {
                                        "total": 2,
                                        "successful": 1,
                                        "failed": 0
                                },
                                "status": 404,
                                "found": false
                        }
                }
        ]
}*/
};

//updates or inserts the given data based on the result returned by the search with the given filters
//updates all the documents that matches the search filters
//if no document matches the search filters then inserts the document. 
export const updateOrInsert = async (
  indexName: string,
  filters: any,
  notFilters: any,
  data: any
) => {
  searchAll<any[]>(indexName, filters, notFilters)
  .then((result: any[] )	=> {
    appLogger.info(result);
    if(!result || result.length == 0) {
      insert(indexName, data);
    } else {
      for(let i = 0; i < result.length; i += 1) {
        update(indexName, result[i]._id, data);
      }
    }
  })
  .catch((err: any) => {
    appLogger.error(err);
  })
};

//simple update when we know the id of the document to update
export const update = async (indexName: string, oldId: string, data: any) => {
  await esClient.update({
    index: indexName,
    id: oldId,
    refresh: true,
    body: { doc: data },
  });
};

//TODO: implement
export const updateByScript = async (indexName: string, query: any, data: any) => {
  await esClient.updateByQuery({
    index: indexName,
    refresh: true,
    body: {
      // can use only script here
      script: {
        source:
          'ctx._source["project"] = "proj1"; ctx._source.item_price= 10000;',
        lang: 'painless',
      },
      query: query,
    },
  });
  /*
{
  "query" : {
    "bool" : {
      "filter" : {
        "terms" : {
          "_id" : [1138081, 1138083, 1138089, 123456] 
        }
      }
    }
  },
    "script" : {
      "inline" : "ctx._source.item_name= 'new_name'; ctx._source.item_price= 10000;", 
      "lang"   : "painless"
      }
  }
*/
};

export const remove = async (indexName: string, query: any) => {
  /* TODO: implement */
};

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
        !notFilters || notFilters === []
          ? { bool: { filter: filters } }
          : { bool: { filter: filters, must_not: notFilters } };

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

          return resolve(resp.body.hits.hits);
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
        !notFilters || notFilters === []
          ? { bool: { filter: filters } }
          : { bool: { filter: filters, must_not: notFilters } };

      // first we do a dummy search to find the data size
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
        !notFilters || notFilters === []
          ? { bool: { filter: filters } }
          : { bool: { filter: filters, must_not: notFilters } };

      // first we do a dummy search to find the data size
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

          return resolve(resp.body.hits.total.value);
        }
      );
    }
  );
}

export function fetchAll<T>(indexName: string): Promise<T> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: any) => any): any => {
      // first we do a dummy search to find the data size
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

          return resolve(resp.body.hits.total.value);
        }
      );
    }
  );
}

/*
var allRecords = [];

// first we do a search, and specify a scroll timeout
client.search({
  index: 'test',
  type: 'records',
  scroll: '10s',
  body: {
     query: {
         "match_all": {}
     }
  }
}, function getMoreUntilDone(error, response) {
  // collect all the records
  response.hits.hits.forEach(function (hit) {
    allRecords.push(hit);
  });

  if (response.hits.total !== allRecords.length) {
    // now we can call scroll over and over
    client.scroll({
      scrollId: response._scroll_id,
      scroll: '10s'
    }, getMoreUntilDone);
  } else {
    appLogger.log('all done', allRecords);
  }
});
 */
/*
export function fieldAll<T>(indexName: string): Promise<T> {
  return new Promise(
    (resolve: (item: any) => void, reject: (err: any) => any): any => {
      // first we do a dummy search to find the data size
      esClient.search(
        {
          body: {
            from: 0,
            query: { match_all: {} },
            size: 1,
          },
          index: indexName,
        },
        function (err: any, resp: any) {
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
*/
