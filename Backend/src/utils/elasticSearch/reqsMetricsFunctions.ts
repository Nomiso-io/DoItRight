import {
  REQ_STATUS_CLOSED,
  REQ_STATUS_INPROGRESS,
  REQ_STATUS_NEW,
  ReqDatabaseDataItem,
  ReqDataItemLists,
  ReqListDataItem,
  ReqLTCTDataItem,
  ReqStatusDataItem,
} from '@models/index';
import { appLogger } from '@utils/index';
import { formIntervals } from '../common';
import { getReqTableName } from './getTableNames';
import { fetchFields, searchAll } from './sdk';

interface ESReqDatabaseDataItem {
  _id: string;
  _index: string;
  _score: number;
  _source: ReqDatabaseDataItem;
  _type: string;
}

export const getReqStatusData = async ({
  fromDate,
  priorities,
  services,
  teamIds,
  toDate,
  types,
}: {
  fromDate: Date;
  priorities?: string[];
  services?: string[];
  teamIds?: string[];
  toDate: Date;
  types?: string[];
}): Promise<ReqStatusDataItem[]> => {
  appLogger.info({
    getReqStatusData: { teamIds, services, priorities, types, fromDate, toDate },
  });
  const filters: any[] = [];
  if (teamIds) {
    filters.push({ terms: { teamId: teamIds } });
    //        filters.push({terms: { teamId: teamIds.map((id: string) => id.toLowerCase()) } });
  }
  if (services) {
    const serviceRegexp: string = services.map((service: string) => `.*${service}.*`).join('|');
    filters.push({ regexp: { servicePath: serviceRegexp } });
  }
  if (priorities) {
    filters.push({ terms: { itemPriority: priorities } });
    //        filters.push({terms: { itemPriority: priorities.map((name: string) => name.toLowerCase()) } });
  }
  if (types) {
    filters.push({ terms: { itemType: types } });
    //        filters.push({terms: { itemType: types.map((name: string) => name.toLowerCase()) } });
  }

  const finalResult: ReqStatusDataItem[] = [];

  const intervals: Date[] = formIntervals(fromDate, toDate);
  for (let i = 1; i < intervals.length; i += 1) {
    const data: ReqStatusDataItem = {
      countInProgress: 0,
      countNew: 0,
      countResolved: 0,
      timestamp: intervals[i].getTime(),
    };
    let result: ESReqDatabaseDataItem[] = [];

    const createdOnRange = {
      gt: Math.floor(intervals[i - 1].getTime() / 1000),
      lte: Math.floor(intervals[i].getTime() / 1000),
    };
    const filters1 = [
      ...filters,
      { range: { createdOn: createdOnRange } },
      { term: { status: REQ_STATUS_NEW } },
    ];
    //        const filters1 = [...filters, { range: { createdOn: createdOnRange } }, {term: { status: REQ_STATUS_NEW.toLowerCase()} }];
    appLogger.debug({ getReqStatusData_searchAll_filters1: filters1 });
    result = await searchAll<ESReqDatabaseDataItem[]>(
      getReqTableName(),
      filters1,
      []
    );
    appLogger.debug({ getReqStatusData_searchAll_result: result });
    data.countNew += result.length;

    const closedOnRange = {
      gt: Math.floor(intervals[i - 1].getTime() / 1000),
      lte: Math.floor(intervals[i].getTime() / 1000),
    };
    const filters2 = [
      ...filters,
      { range: { closedOn: closedOnRange } },
      { term: { status: REQ_STATUS_CLOSED } },
    ];
    //        const filters2 = [...filters, { range: { closedOn: closedOnRange } }, {term: { status: REQ_STATUS_CLOSED.toLowerCase()} }];
    appLogger.debug({ getReqStatusData_searchAll_filters2: filters2 });
    result = await searchAll<ESReqDatabaseDataItem[]>(
      getReqTableName(),
      filters2,
      []
    );
    appLogger.debug({ getReqStatusData_searchAll_result: result });
    data.countResolved += result.length;

    const startedOnRange = {
      gt: Math.floor(intervals[i - 1].getTime() / 1000),
      lte: Math.floor(intervals[i].getTime() / 1000),
    };
    const filters3 = [
      ...filters,
      { range: { startedOn: startedOnRange } },
      { term: { status: REQ_STATUS_INPROGRESS } },
    ];
    //        const filters3 = [...filters, { range: { startedOn: startedOnRange } }, {term: { status: REQ_STATUS_INPROGRESS.toLowerCase()} }];
    appLogger.debug({ getReqStatusData_searchAll_filters3: filters3 });
    result = await searchAll<ESReqDatabaseDataItem[]>(
      getReqTableName(),
      filters3,
      []
    );
    appLogger.debug({ getReqStatusData_searchAll_result: result });
    data.countInProgress += result.length;

    finalResult.push(data);
  }

  return finalResult;
};

export const getReqLTCTData = async ({
  fromDate,
  priorities,
  services,
  teamIds,
  toDate,
  types,
}: {
  fromDate: Date;
  priorities?: string[];
  services?: string[];
  teamIds?: string[];
  toDate: Date;
  types?: string[];
}): Promise<ReqLTCTDataItem[]> => {
  appLogger.info({
    getReqLTCTData: { teamIds, services, priorities, types, fromDate, toDate },
  });
  const filters: any[] = [];
  if (teamIds) {
    filters.push({ terms: { teamId: teamIds } });
    //        filters.push({terms: { teamId: teamIds.map((id: string) => id.toLowerCase()) } });
  }
  if (services) {
    const serviceRegexp: string = services.map((service: string) => `.*${service}.*`).join('|');
    filters.push({ regexp: { servicePath: serviceRegexp } });
  }
  if (priorities) {
    filters.push({ terms: { itemPriority: priorities } });
    //        filters.push({terms: { itemPriority: priorities.map((name: string) => name.toLowerCase()) } });
  }
  if (types) {
    filters.push({ terms: { itemType: types } });
    //        filters.push({terms: { itemType: types.map((name: string) => name.toLowerCase()) } });
  }

  const finalResult: ReqLTCTDataItem[] = [];

  const intervals: Date[] = formIntervals(fromDate, toDate);
  for (let i = 1; i < intervals.length; i += 1) {
    const data: ReqLTCTDataItem = {
      issueCount: 0,
      timestamp: intervals[i].getTime(),
      totalCycleTime: 0,
      totalLeadTime: 0,
    };
    let result: ESReqDatabaseDataItem[] = [];

    const closedOnRange = {
      gt: Math.floor(intervals[i - 1].getTime() / 1000),
      lte: Math.floor(intervals[i].getTime() / 1000),
    };
    //        const filters1 = [...filters, { range: { closedOn: closedOnRange } }, {term: { status: REQ_STATUS_CLOSED.toLowerCase()} }];
    const filters1 = [
      ...filters,
      { range: { closedOn: closedOnRange } },
      { term: { status: REQ_STATUS_CLOSED } },
    ];
    appLogger.debug({ getReqLTCTData_searchAll_filters1: filters1 });
    result = await searchAll<ESReqDatabaseDataItem[]>(
      getReqTableName(),
      filters1,
      []
    );
    appLogger.debug({ getReqLTCTData_searchAll_result: result });
    data.issueCount += result.length;
    result.forEach((res: ESReqDatabaseDataItem) => {
      data.totalCycleTime +=
        res._source.closedOn && res._source.startedOn
          ? Math.floor((res._source.closedOn - res._source.startedOn) / 60) //approximated to nearest minute
          : 0;

      data.totalLeadTime += res._source.closedOn
        ? Math.floor((res._source.closedOn - res._source.createdOn) / 60) //approximated to nearest minute
        : 0;
    });
    finalResult.push(data);
  }
  return finalResult;
};

export const getReqListData = async ({
  fromDate,
  priorities,
  services,
  teamIds,
  toDate,
  types,
}: {
  fromDate: Date;
  priorities?: string[];
  services?: string[];
  teamIds?: string[];
  toDate: Date;
  types?: string[];
}): Promise<ReqListDataItem[]> => {
  appLogger.info({
    getReqListData: { teamIds, services, priorities, types, fromDate, toDate },
  });
  const filters: any[] = [];
  if (teamIds) {
    filters.push({ terms: { teamId: teamIds } });
    //        filters.push({terms: { teamId: teamIds.map((id: string) => id.toLowerCase()) } });
  }
  if (services) {
    const serviceRegexp: string = services.map((service: string) => `.*${service}.*`).join('|');
    filters.push({ regexp: { servicePath: serviceRegexp } });
  }
  if (priorities) {
    filters.push({ terms: { itemPriority: priorities } });
    //        filters.push({terms: { itemPriority: priorities.map((name: string) => name.toLowerCase()) } });
  }
  if (types) {
    filters.push({ terms: { itemType: types } });
    //        filters.push({terms: { itemType: types.map((name: string) => name.toLowerCase()) } });
  }

  const finalResult: ReqListDataItem[] = [];

  const intervals: Date[] = formIntervals(fromDate, toDate);
  for (let i = 1; i < intervals.length; i += 1) {
    let result: ESReqDatabaseDataItem[] = [];

    const closedOnRange = {
      gt: Math.floor(intervals[i - 1].getTime() / 1000),
      lte: Math.floor(intervals[i].getTime() / 1000),
    };
    const startedOnRange = {
      gt: Math.floor(intervals[i - 1].getTime() / 1000),
      lte: Math.floor(intervals[i].getTime() / 1000),
    };
    const createdOnRange = {
      gt: Math.floor(intervals[i - 1].getTime() / 1000),
      lte: Math.floor(intervals[i].getTime() / 1000),
    };
    const ranges = [
      { range: { closedOn: closedOnRange } },
      { range: { startedOn: startedOnRange } },
      { range: { createdOn: createdOnRange } },
    ];
    const filters1 = [...filters, { bool: { should: ranges } }];
    appLogger.debug({ getReqListData_searchAll_filters1: filters1 });
    result = await searchAll<ESReqDatabaseDataItem[]>(
      getReqTableName(),
      filters1,
      []
    );
    appLogger.debug({ getReqListData_searchAll_result: result });
    result.forEach((res: ESReqDatabaseDataItem) => {
      const data: ReqListDataItem = {
        closedOn: res._source.closedOn,
        createdOn: res._source.createdOn,
        itemId: res._source.itemId,
        itemPriority: res._source.itemPriority,
        itemType: res._source.itemType,
        projectName: res._source.projectName,
        service: res._source.servicePath,
        startedOn: res._source.startedOn,
        status: res._source.status,
        teamId: res._source.teamId,
        url: res._source.url,
      };
      finalResult.push(data);
    });
  }
  return finalResult;
};

export const getReqDataItemLists = async (fields: any[]): Promise<ReqDataItemLists> => {
//  const finalResult: ReqDataItem[] = [];
  const finalItemTypeList: string[] = [];
  const finalPriorityList: string[] = [];
  let result: ESReqDatabaseDataItem[] = [];

  result = await fetchFields<ESReqDatabaseDataItem[]>(
    getReqTableName(),
    fields
  );
  appLogger.debug({ getReqItemData_fetchFields_result: result });

  result.forEach((item: ESReqDatabaseDataItem) => {
    if(! finalItemTypeList.includes(item._source.itemType)) {
      finalItemTypeList.push(item._source.itemType);
    }
    if(! finalPriorityList.includes(item._source.itemPriority)) {
      finalPriorityList.push(item._source.itemPriority);
    }
  });

//    const data: ReqDataItem = {
//    itemPriority: result
//      .map((item) => item._source.itemPriority)
//      .filter((value, index, self) => self.indexOf(value) === index),
//    itemType: result
//      .map((item) => item._source.itemType)
//      .filter((value, index, self) => self.indexOf(value) === index),
//  };
//  finalResult.push(data);
  return {itemPriority: finalPriorityList, itemType: finalItemTypeList};
};
