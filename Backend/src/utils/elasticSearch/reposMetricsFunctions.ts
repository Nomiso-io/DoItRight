import {
  RepoDatabaseDataItem,
  RepoDataItemLists,
  RepoPullRaiserDataItem,
  RepoPullReqLifeDataItem,
  RepoPullReqsDataItem,
  STATE_ACCEPTED,
  STATE_REJECTED,
  STATUS_CLOSED,
} from '@models/index';
import { appLogger } from '@utils/index';
import { formIntervals } from '../common';
import { getRepoTableName } from './getTableNames';
import { fetchFields, searchAll } from './sdk';

interface ESRepoDatabaseDataItem {
  _id: string;
  _index: string;
  _score: number;
  _source: RepoDatabaseDataItem;
  _type: string;
}

export const getRepoPullReqsData = async ({
  committers,
  fromDate,
  services,
  teamIds,
  toDate,
}: {
  committers?: string[];
  fromDate: Date;
  services?: string[];
  teamIds?: string[];
  toDate: Date;
}): Promise<RepoPullReqsDataItem[]> => {
  appLogger.info({
    getRepoPullReqsData: { teamIds, services, committers, fromDate, toDate },
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
  if (committers) {
    filters.push({ terms: { raisedBy: committers } });
    //        filters.push({terms: { raisedBy: committers.map((name: string) => name.toLowerCase()) } });
  }

  const finalResult: RepoPullReqsDataItem[] = [];

  const data: RepoPullReqsDataItem = {
    commitsAccepted: 0,
    //      commitsCreated: 0,
    commitsPending: 0,
    commitsRejected: 0,
    //      committerName: '',
    //      projectName: '',
    //      teamId: '',
    //      timestampEnd: toDate.getTime(),
    //      url: '',
  };
  let result: ESRepoDatabaseDataItem[] = [];

  const raisedOnRange = { lte: Math.floor(toDate.getTime() / 1000) };
  const filters1 = [...filters, { range: { raisedOn: raisedOnRange } }];
  const notFilters: any[] = [{ exists: { field: 'acceptState' } }];
  appLogger.debug({
    getRepoPullReqsData_searchAll_filters: filters1,
    getRepoPullReqsData_searchAll_notFilters: notFilters,
  });
  result = await searchAll<ESRepoDatabaseDataItem[]>(
    getRepoTableName(),
    filters1,
    notFilters
  );
  appLogger.debug({ getRepoPullReqsData_searchAll_result: result });
  data.commitsPending = result.length;

  const reviewedOnRange = {
    gt: Math.floor(fromDate.getTime() / 1000),
    lte: Math.floor(toDate.getTime() / 1000),
  };
  //    const filters2 = [...filters, { range: { reviewedOn: reviewedOnRange } }, {term: { acceptState: STATE_ACCEPTED.toLowerCase()} }];
  const filters2 = [
    ...filters,
    { range: { reviewedOn: reviewedOnRange } },
    { term: { acceptState: STATE_ACCEPTED } },
  ];
  appLogger.debug({ getRepoPullReqsData_searchAll_filters2: filters2 });
  result = await searchAll<ESRepoDatabaseDataItem[]>(
    getRepoTableName(),
    filters2,
    []
  );
  appLogger.debug({ getRepoPullReqsData_searchAll_result: result });
  data.commitsAccepted = result.length;

  //    const filters3 = [...filters, { range: { reviewedOn: reviewedOnRange } }, {term: { acceptState: STATE_REJECTED.toLowerCase()} }];
  const filters3 = [
    ...filters,
    { range: { reviewedOn: reviewedOnRange } },
    { term: { acceptState: STATE_REJECTED } },
  ];
  appLogger.debug({ getRepoPullReqsData_searchAll_filters3: filters3 });
  result = await searchAll<ESRepoDatabaseDataItem[]>(
    getRepoTableName(),
    filters3,
    []
  );
  appLogger.debug({ getRepoPullReqsData_searchAll_result: result });
  data.commitsRejected = result.length;

  finalResult.push(data);

  return finalResult;
};

export const getRepoPullReqLifeData = async ({
  committers,
  fromDate,
  services,
  teamIds,
  toDate,
}: {
  committers?: string[];
  fromDate: Date;
  services?: string[];
  teamIds?: string[];
  toDate: Date;
}): Promise<RepoPullReqLifeDataItem[]> => {
  appLogger.info({
    getRepoPullReqLifeData: { teamIds, services, committers, fromDate, toDate },
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
  if (committers) {
    filters.push({ terms: { raisedBy: committers } });
    //        filters.push({terms: { raisedBy: committers.map((name: string) => name.toLowerCase()) } });
  }

  const finalResult: RepoPullReqLifeDataItem[] = [];

  const intervals: Date[] = formIntervals(fromDate, toDate);
  for (let i = 1; i < intervals.length; i += 1) {
    const data: RepoPullReqLifeDataItem = {
      closedPullReqCount: 0,
      //            committerName: '',
      //            projectName: '',
      //            teamId: '',
      timestampEnd: intervals[i].getTime(),
      totalClosureTime: 0,
    };
    let result: ESRepoDatabaseDataItem[] = [];

    const reviewedOnRange = {
      gt: Math.floor(intervals[i - 1].getTime() / 1000),
      lte: Math.floor(intervals[i].getTime() / 1000),
    };
    //        const filters1 = [...filters, { range: { reviewedOn: reviewedOnRange } }, {term: { status: STATUS_CLOSED.toLowerCase()} }];
    const filters1 = [
      ...filters,
      { range: { reviewedOn: reviewedOnRange } },
      { term: { status: STATUS_CLOSED } },
    ];
    appLogger.debug({ getRepoPullReqLifeData_searchAll_filters1: filters1 });
    result = await searchAll<ESRepoDatabaseDataItem[]>(
      getRepoTableName(),
      filters1,
      []
    );
    appLogger.debug({ getRepoPullReqLifeData_searchAll_result: result });
    data.closedPullReqCount += result.length;
    result.forEach(
      (res: ESRepoDatabaseDataItem) =>
        (data.totalClosureTime += res._source.reviewedOn
          ? Math.floor((res._source.reviewedOn - res._source.raisedOn) / 60) //approximated to nearest minute
          : 0)
    );

    finalResult.push(data);
  }

  return finalResult;
};

export const getRepoPullRaiserData = async ({
  committers,
  fromDate,
  services,
  teamIds,
  toDate,
}: {
  committers?: string[];
  fromDate: Date;
  services?: string[];
  teamIds?: string[];
  toDate: Date;
}): Promise<RepoPullRaiserDataItem[]> => {
  appLogger.info({
    getRepoPullRaiserData: { teamIds, services, committers, fromDate, toDate },
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
  if (committers) {
    filters.push({ terms: { raisedBy: committers } });
    //        filters.push({terms: { raisedBy: committers.map((name: string) => name.toLowerCase()) } });
  }

  const finalResult: RepoPullRaiserDataItem[] = [];

  const aggrMap: { [key: string]: RepoPullRaiserDataItem } = {};
  let result: ESRepoDatabaseDataItem[] = [];

  const raisedOnRange = {
    gt: Math.floor(fromDate.getTime() / 1000),
    lte: Math.floor(toDate.getTime() / 1000),
  };
  const filters1 = [...filters, { range: { raisedOn: raisedOnRange } }];
  appLogger.debug({ getRepoPullRaiserData_searchAll_committers: filters1 });
  result = await searchAll<ESRepoDatabaseDataItem[]>(
    getRepoTableName(),
    filters1,
    []
  );
  appLogger.debug({ getRepoPullRaiserData_searchAll_result: result });
  result.forEach((item: ESRepoDatabaseDataItem) => {
    const key: string = `${item._source.raisedBy}_${item._source.teamId}_${item._source.projectName}`;
    if (aggrMap[key]) {
      aggrMap[key].commitsCreated += 1;
    } else {
      const data: RepoPullRaiserDataItem = {
        commitsAccepted: 0,
        commitsCreated: 1,
        //                commitsPending: 0,
        commitsRejected: 0,
        committerName: item._source.raisedBy,
        projectName: item._source.projectName,
        service: item._source.servicePath,
        teamId: item._source.teamId,
        //                timestampEnd: toDate.getTime(),
        url: item._source.url,
      };
      aggrMap[key] = data;
    }
  });

  const reviewedOnRange = {
    gt: Math.floor(fromDate.getTime() / 1000),
    lte: Math.floor(toDate.getTime() / 1000),
  };
  //    const filters2 = [...filters, { range: { reviewedOn: reviewedOnRange } }, {term: { acceptState: STATE_ACCEPTED.toLowerCase()} }];
  const filters2 = [
    ...filters,
    { range: { reviewedOn: reviewedOnRange } },
    { term: { acceptState: STATE_ACCEPTED } },
  ];
  appLogger.debug({ getRepoPullRaiserData_searchAll_filters2: filters2 });
  result = await searchAll<ESRepoDatabaseDataItem[]>(
    getRepoTableName(),
    filters2,
    []
  );
  appLogger.debug({ getRepoPullRaiserData_searchAll_result: result });
  result.forEach((item: ESRepoDatabaseDataItem) => {
    const key: string = `${item._source.raisedBy}_${item._source.teamId}_${item._source.projectName}`;
    if (aggrMap[key]) {
      aggrMap[key].commitsAccepted += 1;
    } else {
      const data: RepoPullRaiserDataItem = {
        commitsAccepted: 1,
        commitsCreated: 0,
        //                commitsPending: 0,
        commitsRejected: 0,
        committerName: item._source.raisedBy,
        projectName: item._source.projectName,
        service: item._source.servicePath,
        teamId: item._source.teamId,
        //                timestampEnd: toDate.getTime(),
        url: item._source.url,
      };
      aggrMap[key] = data;
    }
  });

  //    const filters3 = [...filters, { range: { reviewedOn: reviewedOnRange } }, {term: { acceptState: STATE_REJECTED.toLowerCase()} }];
  const filters3 = [
    ...filters,
    { range: { reviewedOn: reviewedOnRange } },
    { term: { acceptState: STATE_REJECTED } },
  ];
  appLogger.debug({ getRepoPullRaiserData_searchAll_filters3: filters3 });
  result = await searchAll<ESRepoDatabaseDataItem[]>(
    getRepoTableName(),
    filters3,
    []
  );
  appLogger.debug({ getRepoPullRaiserData_searchAll_result: result });
  result.forEach((item: ESRepoDatabaseDataItem) => {
    const key: string = `${item._source.raisedBy}_${item._source.teamId}_${item._source.projectName}`;
    if (aggrMap[key]) {
      aggrMap[key].commitsRejected += 1;
    } else {
      const data: RepoPullRaiserDataItem = {
        commitsAccepted: 0,
        commitsCreated: 0,
        //                commitsPending: 0,
        commitsRejected: 1,
        committerName: item._source.raisedBy,
        projectName: item._source.projectName,
        service: item._source.servicePath,
        teamId: item._source.teamId,
        //                timestampEnd: toDate.getTime(),
        url: item._source.url,
      };
      aggrMap[key] = data;
    }
  });

  Object.keys(aggrMap).map((key: string) => {
    finalResult.push(aggrMap[key]);
  });

  return finalResult;
};

export const getRepoDataItemLists = async (
  fields: any[]
): Promise<RepoDataItemLists> => {
//  const finalResult: RepoPullRaiserList[] = [];
//  const aggrMap: { [key: string]: RepoPullRaiserList } = {};
  const finalCommittersList: string[] = [];
  let result: ESRepoDatabaseDataItem[] = [];

  result = await fetchFields<ESRepoDatabaseDataItem[]>(
    getRepoTableName(),
    fields
  );

  result.forEach((item: ESRepoDatabaseDataItem) => {
    if(! finalCommittersList.includes(item._source.raisedBy)) {
      finalCommittersList.push(item._source.raisedBy);
    }
  //  const key: string = `${item._source.raisedBy}`;
  //  const data: RepoPullRaiserList = {
  //    committerName: item._source.raisedBy,
  //  };
  //  aggrMap[key] = data;
  });

//  Object.keys(aggrMap).map((key: string) => {
//    finalResult.push(aggrMap[key]);
//  });
  return {committerName: finalCommittersList};
};
