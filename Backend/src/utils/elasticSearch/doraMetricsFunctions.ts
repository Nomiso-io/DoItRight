import {
  BuildDatabaseDataItem,
  ChangeFailureRateDataItem,
  COMMIT_STATUS_SUCCESS,
  CommitDatabaseDataItem,
  DeploymentDataItem,
  IncidentDatabaseDataItem,
  LeadTimeDataItem,
  MeanTimeToRestoreDataItem,
//  REQ_STATUS_CLOSED,
//  REQ_TYPE_BUG,
//  ReqDatabaseDataItem,
//  STATUS_FAILED,
//  STATUS_INPROGRESS,
  STATUS_SUCCESS,
} from '@models/index';
import { appLogger } from '@utils/index';
import { formIntervals } from '../common';
import { getBuildTableName, getGitlabCommitTableName, getIncidentTableName/*, getReqTableName*/ } from './getTableNames';
import { searchAll, searchAllCount, searchSorted } from './sdk';

/*
interface ESReqDatabaseDataItem {
  _id: string;
  _index: string;
  _score: number;
  _source: ReqDatabaseDataItem;
  _type: string;
}
*/
interface ESBuildDatabaseDataItem {
  _id: string;
  _index: string;
  _score: number;
  _source: BuildDatabaseDataItem;
  _type: string;
}
interface ESCommitDatabaseDataItem {
  _id: string;
  _index: string;
  _score: number;
  _source: CommitDatabaseDataItem;
  _type: string;
}

interface ESIncidentDatabaseDataItem {
  _id: string;
  _index: string;
  _score: number;
  _source: IncidentDatabaseDataItem;
  _type: string;
}

export const getDeploymentGraphData = async ({
  fromDate,
  services,
  teamIds,
  toDate,
}: {
  fromDate: Date;
  services?: string[];
  teamIds?: string[];
  toDate: Date;
}): Promise<DeploymentDataItem[]> => {
  appLogger.info({ getDeploymentGraphData: { teamIds, services, fromDate, toDate } });
  const filters: any[] = [];
  if (teamIds) {
    filters.push({ terms: { teamId: teamIds } });
    //    filters.push({terms: { teamId: teamIds.map((id: string) => id.toLowerCase()) } });
  }
  if (services) {
    const serviceRegexp: string = services.map((service: string) => `.*${service}.*`).join('|');
    filters.push({ regexp: { servicePath: serviceRegexp } });
  }

  const finalResult: DeploymentDataItem[] = [];

  const intervals: Date[] = formIntervals(fromDate, toDate);
  for (let i = 1; i < intervals.length; i += 1) {
    let result: number = 0; //ESBuildDatabaseDataItem[] = [];

    const timestampRange = {
      gt: Math.floor(intervals[i - 1].getTime() / 1000),
      lte: Math.floor(intervals[i].getTime() / 1000),
    };
    const filters1 = [
      ...filters,
      { range: { endTimestamp: timestampRange } },
      { term: { status: STATUS_SUCCESS } },
    ];
    appLogger.debug({
      getDeploymentGraphData_searchAllCount_filters1: filters1,
    });
    result = await searchAllCount(getBuildTableName(), filters1, []);
    appLogger.debug({ getDeploymentGraphData_searchAllCount_result: result });
    const data: DeploymentDataItem = {
      countBuilds: result,
      timestamp: intervals[i].getTime(),
    };
    finalResult.push(data);
  }
  return finalResult;
};

export const getLeadTimeGraphData = async ({
  fromDate,
  services,
  teamIds,
  toDate,
}: {
  fromDate: Date;
  services?: string[];
  teamIds?: string[];
  toDate: Date;
}): Promise<LeadTimeDataItem[]> => {
  appLogger.info({ getLeadTimeGraphData: { teamIds, services, fromDate, toDate } });
  const filters: any[] = [];
  if (teamIds) {
    filters.push({ terms: { teamId: teamIds } });
    //        filters.push({terms: { teamId: teamIds.map((id: string) => id.toLowerCase()) } });
  }
  if (services) {
    const serviceRegexp: string = services.map((service: string) => `.*${service}.*`).join('|');
    filters.push({ regexp: { servicePath: serviceRegexp } });
  }

  const finalResult: LeadTimeDataItem[] = [];

  const intervals: Date[] = formIntervals(fromDate, toDate);
  for (let i = 1; i < intervals.length; i += 1) {
    const data: LeadTimeDataItem = {
      issueCount: 0,
      timestamp: intervals[i].getTime(),
      totalLeadTime: 0,
    };

    let result: ESCommitDatabaseDataItem[] = [];
    const buildEndRange = {
      gt: Math.floor(intervals[i - 1].getTime() / 1000),
      lte: Math.floor(intervals[i].getTime() / 1000),
    };

    const filters1 = [
      ...filters,
      { range: { pipelineEndDate: buildEndRange } },
      { term: { pipelineStatus: COMMIT_STATUS_SUCCESS } },
    ];
    appLogger.debug({ getLeadTimeGraphData_searchAll_filters1: filters1 });
    result = await searchAll<ESCommitDatabaseDataItem[]>(
      getGitlabCommitTableName(),
      filters1,
      []
    );
    appLogger.debug({ getLeadTimeGraphData_searchAll_result: result });
    result.forEach(async (res: ESCommitDatabaseDataItem) => {
      const filters2 = [
//        ...filters,
        { term: { teamId: res._source.teamId } },
        { term: { servicePath: res._source.servicePath } },
        { range: { pipelineStartDate: { lt: res._source.pipelineStartDate } } },
        { term: { pipelineStatus: COMMIT_STATUS_SUCCESS } },
      ];

      //TODO: try using top-metrics aggregation instead of sort
      //https://www.elastic.co/guide/en/elasticsearch/reference/7.14//search-aggregations-metrics-top-metrics.html
      const sortFields = [ 'pipelineStartDate: desc' ];

      appLogger.debug({ getLeadTimeGraphData_searchSorted_filters2: filters2 });
      const sortedResult = await searchSorted<ESCommitDatabaseDataItem[]>(
        getGitlabCommitTableName(),
        filters2,
        [],
        sortFields
      );
      appLogger.debug({ getLeadTimeGraphData_searchSorted_sortedResult: sortedResult });

      let commitRange: any = {
        lt: res._source.pipelineStartDate
      };

      if(sortedResult.length > 0) {
        commitRange = {
          gt: sortedResult[0]._source.commitDate,
          lt: res._source.pipelineStartDate
        };
      }

      const filters3 = [
//        ...filters,
        { term: { teamId: res._source.teamId } },
        { term: { servicePath: res._source.servicePath } },
        { range: { commitDate: commitRange } },
      ];

      appLogger.debug({ getLeadTimeGraphData_searchAll_filters3: filters3 });
      const commitResult = await searchAll<ESCommitDatabaseDataItem[]>(
        getGitlabCommitTableName(),
        filters3,
        []
      );
      appLogger.debug({ getLeadTimeGraphData_searchAll_commitResult: commitResult });
      data.issueCount += commitResult.length;
      commitResult.forEach((commit: ESCommitDatabaseDataItem) => {
        data.totalLeadTime += res._source.pipelineEndDate
        ? Math.floor((res._source.pipelineEndDate - commit._source.commitDate) / 60) //approximated to nearest minute
        : 0;
      });
    });

    /*
    let result: ESReqDatabaseDataItem[] = [];

    const closedOnRange = {
      gt: Math.floor(intervals[i - 1].getTime() / 1000),
      lte: Math.floor(intervals[i].getTime() / 1000),
    };
    //    const filters1 = [...filters, { range: { closedOn: closedOnRange } }, {term: { status: REQ_STATUS_CLOSED.toLowerCase()} }];
    const filters1 = [
      ...filters,
      { range: { closedOn: closedOnRange } },
      { term: { status: REQ_STATUS_CLOSED } },
    ];
    appLogger.debug({ getLeadTimeGraphData_searchAll_filters1: filters1 });
    result = await searchAll<ESReqDatabaseDataItem[]>(
      getReqTableName(),
      filters1,
      []
    );
    appLogger.debug({ getLeadTimeGraphData_searchAll_result: result });
    data.issueCount += result.length;
    result.forEach((res: ESReqDatabaseDataItem) => {
      data.totalLeadTime += res._source.closedOn
        ? Math.floor((res._source.closedOn - res._source.createdOn) / 60) //approximated to nearest minute
        : 0;
    });
    */

    finalResult.push(data);
  }
  return finalResult;
};

export const getMeanTimeToRestoreGraphData = async ({
  fromDate,
  services,
  teamIds,
  toDate,
}: {
  fromDate: Date;
  services?: string[];
  teamIds?: string[];
  toDate: Date;
}): Promise<MeanTimeToRestoreDataItem[]> => {
  appLogger.info({
    getMeanTimeToRestoreGraphData: { teamIds, services, fromDate, toDate },
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

  const finalResult: MeanTimeToRestoreDataItem[] = [];

  const intervals: Date[] = formIntervals(fromDate, toDate);
  for (let i = 1; i < intervals.length; i += 1) {
    const data: MeanTimeToRestoreDataItem = {
      issueCount: 0,
      timestamp: intervals[i].getTime(),
      totalRestoreTime: 0,
    };
    let result: ESIncidentDatabaseDataItem[] = [];

    const endedOnRange = {
      gt: Math.floor(intervals[i - 1].getTime() / 1000),
      lte: Math.floor(intervals[i].getTime() / 1000),
    };
    //    const filters1 = [...filters, { range: { endTime: endedOnRange } }, {term: { status: REQ_STATUS_CLOSED.toLowerCase()} }];
    const filters1 = [
      ...filters,
      { range: { endTime: endedOnRange } }
    ];
    appLogger.debug({
      getMeanTimeToRestoreGraphData_searchAll_filters1: filters1,
    });
    result = await searchAll<ESIncidentDatabaseDataItem[]>(
      getIncidentTableName(),
      filters1,
      []
    );
    appLogger.debug({ getMeanTimeToRestoreGraphData_searchAll_result: result });
    data.issueCount += result.length;
    result.forEach((res: ESIncidentDatabaseDataItem) => {
      data.totalRestoreTime += res._source.endTime
        ? Math.floor((res._source.endTime - res._source.startTime) / 60) //approximated to nearest minute
        : 0;
    });
    finalResult.push(data);
  }
  return finalResult;
};

export const getChangeFailureRateGraphData = async ({
  fromDate,
  services,
  teamIds,
  toDate,
}: {
  fromDate: Date;
  services?: string[];
  teamIds?: string[];
  toDate: Date;
}): Promise<ChangeFailureRateDataItem[]> => {
  appLogger.info({
    getChangeFailureRateGraphData: { teamIds, services, fromDate, toDate },
  });

  const buildFilters: any[] = [];
  if (teamIds) {
    buildFilters.push({ terms: { teamId: teamIds } });
//    incidentFilters.push({ terms: { teamId: teamIds } });
    //    filters.push({terms: { teamId: teamIds.map((id: string) => id.toLowerCase()) } });
  }
  if (services) {
    const serviceRegexp: string = services.map((service: string) => `.*${service}.*`).join('|');
    buildFilters.push({ regexp: { servicePath: serviceRegexp } });

//    const serviceRegexp2: string = services.map((service: string) => `.*${service.replace('/', '.*|.*')}.*`).join('|');
//    incidentFilters.push({ regexp: { servicePath: serviceRegexp2 } });
  }

  const finalResult: ChangeFailureRateDataItem[] = [];

  const intervals: Date[] = formIntervals(fromDate, toDate);
  for (let i = 1; i < intervals.length; i += 1) {
    const data: ChangeFailureRateDataItem = {
      countFailBuilds: 0,
      //      percentageOfFailureBuilds: 0,
      timestamp: intervals[i].getTime(),
      totalBuilds: 0,
    };

    //get all the successfull deployments in the interval
    const timestampRange = {
      gt: Math.floor(intervals[i - 1].getTime() / 1000),
      lte: Math.floor(intervals[i].getTime() / 1000),
    };
    //    const filters1 = [...filters, { range: { endTime: endedOnRange } }, {term: { status: REQ_STATUS_CLOSED.toLowerCase()} }];
    const filters1 = [
      ...buildFilters,
      { range: { endTimestamp: timestampRange } },
      { term: { status: STATUS_SUCCESS } },
    ];
    appLogger.debug({
      getChangeFailureRateGraphData_searchAll_filters1: filters1,
    });
    const buildResult: ESBuildDatabaseDataItem[] = await searchAll<ESBuildDatabaseDataItem[]>(
      getBuildTableName(),
      filters1,
      []
    );
    appLogger.debug({ getChangeFailureRateGraphData_searchAll_buildResult: buildResult });
    buildResult.forEach(async (build: ESBuildDatabaseDataItem) => {
      data.totalBuilds += 1;

      //get the next successful deployment for the same microservice
      const filters2 = [
//        ...filters,
        { term: { teamId: build._source.teamId } },
        { term: { servicePath: build._source.servicePath } },
        { range: { startTimestamp: { gt: build._source.endTimestamp } } },
        { term: { status: STATUS_SUCCESS } },
      ];

      //TODO: try using top-metrics aggregation instead of sort
      //https://www.elastic.co/guide/en/elasticsearch/reference/7.14//search-aggregations-metrics-top-metrics.html
      const sortFields = [ 'startTimestamp: asc' ];

      appLogger.debug({ getChangeFailureRateGraphData_searchSorted_filters2: filters2 });
      const sortedResult: ESBuildDatabaseDataItem[] = await searchSorted<ESBuildDatabaseDataItem[]>(
        getBuildTableName(),
        filters2,
        [],
        sortFields
      );
      appLogger.debug({ getChangeFailureRateGraphData_searchSorted_sortedResult: sortedResult });

      if(build._source.endTimestamp) {
        //calculate the incident window based on the next successfull deployment time and configured incident window size, whichever is lower.
        let windowEnd: number = build._source.endTimestamp + (build._source.failureWindow * 3600); //converting windowPeriod from hours to seconds
        if((sortedResult.length > 0) && (sortedResult[0]._source.startTimestamp < windowEnd)) {
          windowEnd = sortedResult[0]._source.startTimestamp;
        }

        //check if any incident occured within the incident window
        const incidentFilters: any[] = [
          { term: { teamId: build._source.teamId } },
          { regexp: { servicePath: `.*${build._source.servicePath.replace('/', '.*|.*')}.*` } },
          { range: { startTime: {
            gt: build._source.endTimestamp,
            lte: windowEnd
          } } }
        ];

        appLogger.debug({ getChangeFailureRateGraphData_searchAllCount_incidentFilters: incidentFilters });
        const incidentCount: number = await searchAllCount(
          getIncidentTableName(),
          incidentFilters,
          []
        );

        if(incidentCount > 0) {
          data.countFailBuilds += 1;
        }
      }
    });

    finalResult.push(data);
  }
  return finalResult;

  /*
  const filters: any[] = [];
  if (teamIds) {
    filters.push({ terms: { teamId: teamIds } });
    //    filters.push({terms: { teamId: teamIds.map((id: string) => id.toLowerCase()) } });
  }
  if (services) {
    const serviceRegexp: string = services.map((service: string) => `.*${service}.*`).join('|');
    filters.push({ regexp: { servicePath: serviceRegexp } });
  }

  const finalResult: ChangeFailureRateDataItem[] = [];

  const intervals: Date[] = formIntervals(fromDate, toDate);
  for (let i = 1; i < intervals.length; i += 1) {
    const data: ChangeFailureRateDataItem = {
      countFailBuilds: 0,
      //      percentageOfFailureBuilds: 0,
      timestamp: intervals[i].getTime(),
      totalBuilds: 0,
    };
    //    let result: ESBuildDatabaseDataItem[] = [];

    const timestampRange = {
      gt: Math.floor(intervals[i - 1].getTime() / 1000),
      lte: Math.floor(intervals[i].getTime() / 1000),
    };
    const filters1 = [
      ...filters,
      { range: { endTimestamp: timestampRange } },
      { terms: { status: [STATUS_SUCCESS, STATUS_FAILED, STATUS_INPROGRESS] } },
    ];
    //    const filters1 = [...filters, { range: { timestamp: timestampRange } }];
    appLogger.debug({
      getChangeFailureRateGraphData_searchAllCount_filters1: filters1,
    });
    data.totalBuilds = await searchAllCount(getBuildTableName(), filters1, []);
    //    appLogger.debug({ getChangeFailureRateGraphData_searchAllCount_result: result });
    const filters2 = [
      ...filters,
      { range: { endTimestamp: timestampRange } },
      { term: { status: STATUS_FAILED } },
    ];
    appLogger.debug({
      getChangeFailureRateGraphData_searchAllCount_filters2: filters2,
    });
    data.countFailBuilds = await searchAllCount(
      getBuildTableName(),
      filters2,
      []
    );
    //    result.forEach((res: ESBuildDatabaseDataItem) => {
    //      if (res._source.status === STATUS_BUILT) {
    //        data.totalCount += 1;
    //        if (res._source.result === RESULT_FAIL) {
    //          data.countFailBuilds += 1;
    //        }
    //      }
    //    });
    finalResult.push(data);
  }
  return finalResult;
  */
};
