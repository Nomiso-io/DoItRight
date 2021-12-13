import {
  BuildDatabaseDataItem,
  BuildGraphDataItem,
  BuildListDataItem,
  STATUS_FAILED,
  STATUS_INPROGRESS,
  STATUS_SUCCESS,
} from '@models/index';
import { appLogger } from '@utils/index';
import { formIntervals } from '../common';
import { getBuildTableName } from './getTableNames';
import { searchAll } from './sdk';

interface ESBuildDatabaseDataItem {
  _id: string;
  _index: string;
  _score: number;
  _source: BuildDatabaseDataItem;
  _type: string;
}

export const getBuildGraphData = async ({
  fromDate,
  services,
  teamIds,
  toDate,
}: {
  fromDate: Date;
  services?: string[];
  teamIds?: string[];
  toDate: Date;
}): Promise<BuildGraphDataItem[]> => {
  appLogger.info({ getBuildGraphData: { teamIds, services, fromDate, toDate } });
  const filters: any[] = [];
  if (teamIds) {
    filters.push({ terms: { teamId: teamIds } });
    //    filters.push({terms: { teamId: teamIds.map((id: string) => id.toLowerCase()) } });
  }
  if (services) {
    const serviceRegexp: string = services.map((service: string) => `.*${service}.*`).join('|');
    filters.push({ regexp: { servicePath: serviceRegexp } });
  }

  const finalResult: BuildGraphDataItem[] = [];

  const intervals: Date[] = formIntervals(fromDate, toDate);
  for (let i = 1; i < intervals.length; i += 1) {
    const data: BuildGraphDataItem = {
      countFailBuilds: 0,
      countInProgressBuilds: 0,
      countOtherBuilds: 0,
      countSuccessBuilds: 0,
      timestampEnd: intervals[i].getTime(),
    };
    let result: ESBuildDatabaseDataItem[] = [];

    const timestampRange = {
      gt: Math.floor(intervals[i - 1].getTime() / 1000),
      lte: Math.floor(intervals[i].getTime() / 1000),
    };
    const filters1 = [...filters, { range: { endTimestamp: timestampRange } }];
    appLogger.debug({ getBuildGraphData_searchAll_filters1: filters1 });
    result = await searchAll<ESBuildDatabaseDataItem[]>(
      getBuildTableName(),
      filters1,
      []
    );
    appLogger.debug({ getBuildGraphData_searchAll_result: result });
    result.forEach((res: ESBuildDatabaseDataItem) => {
      switch (res._source.status) {
        case STATUS_SUCCESS: {
          data.countSuccessBuilds += 1;
          break;
        }
        case STATUS_FAILED: {
          data.countFailBuilds += 1;
          break;
        }
        case STATUS_INPROGRESS: {
          data.countInProgressBuilds += 1;
          break;
        }
        default: {
          data.countOtherBuilds += 1;
        }
      }
    });

    finalResult.push(data);
  }

  return finalResult;
};

export const getBuildListData = async ({
  fromDate,
  services,
  teamIds,
  toDate,
}: {
  fromDate: Date;
  services?: string[];
  teamIds?: string[];
  toDate: Date;
}): Promise<BuildListDataItem[]> => {
  appLogger.info({ getBuildListData: { teamIds, services, fromDate, toDate } });
  const filters: any[] = [];
  if (teamIds) {
    filters.push({ terms: { teamId: teamIds } });
    //    filters.push({terms: { teamId: teamIds.map((id: string) => id.toLowerCase()) } });
  }
  if (services) {
    const serviceRegexp: string = services.map((service: string) => `.*${service}.*`).join('|');
    filters.push({ regexp: { servicePath: serviceRegexp } });
  }

  const finalResult: BuildListDataItem[] = [];
  let result: ESBuildDatabaseDataItem[] = [];

  const timestampRange = {
    gt: Math.floor(fromDate.getTime() / 1000),
    lte: Math.floor(toDate.getTime() / 1000),
  };
  filters.push({ range: { endTimestamp: timestampRange } });
  appLogger.debug({ getBuildListData_searchAll_filter: filters });
  result = await searchAll<ESBuildDatabaseDataItem[]>(
    getBuildTableName(),
    filters,
    []
  );
  appLogger.debug({ getBuildListData_searchAll_result: result });
  result.forEach((res: ESBuildDatabaseDataItem) => {
    const data: BuildListDataItem = {
      buildNum: res._source.buildNum,
      duration: res._source.duration,
      endTimestamp: (res._source.endTimestamp) ? res._source.endTimestamp * 1000 : 0,
      projectName: res._source.projectName,
      service: res._source.servicePath,
      startTimestamp: (res._source.startTimestamp) ? res._source.startTimestamp * 1000 : 0,
      status: res._source.status,
      teamId: res._source.teamId,
      url: res._source.url,
    };

    finalResult.push(data);
  });

  return finalResult;
};
