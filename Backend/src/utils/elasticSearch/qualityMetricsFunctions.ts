import { QualityDatabaseDataItem, QualityGraphDataItem, QualityListDataItem } from '@models/index';
import { appLogger } from '@utils/index';
import { formIntervals } from '../common';
import { getQualityTableName } from './getTableNames';
import { searchAll } from './sdk';

interface ESQualityDatabaseDataItem {
  _id: string;
  _index: string;
  _score: number;
  _source: QualityDatabaseDataItem;
  _type: string;
}

export const getQualityListData = async ({
  fromDate,
  services,
  teamIds,
  toDate,
}: {
  fromDate: Date;
  services?: string[];
  teamIds?: string[];
  toDate: Date;
}): Promise<QualityListDataItem[]> => {
  appLogger.info({ getQualityListData: { teamIds, services, fromDate, toDate } });
  const filters: any[] = [];
  if(teamIds) {
    filters.push({terms: { teamId: teamIds } });
//    filters.push({terms: { teamId: teamIds.map((id: string) => id.toLowerCase()) } });
  }
  if (services) {
    const serviceRegexp: string = services.map((service: string) => `.*${service}.*`).join('|');
    filters.push({ regexp: { servicePath: serviceRegexp } });
  }

  const finalResult: QualityListDataItem[] = [];
  const aggrMap: { [key: string]: QualityListDataItem[] } = {};
  let result: ESQualityDatabaseDataItem[] = [];

  const timestampRange = {
    gt: Math.floor(fromDate.getTime() / 1000),
    lte: Math.floor(toDate.getTime() / 1000),
  };
  const filters1 = [...filters, { range: { timestamp: timestampRange } }];
  appLogger.debug({ getQualityListData_searchAll_filter1: filters1 });
  result = await searchAll<ESQualityDatabaseDataItem[]>(
    getQualityTableName(),
    filters1,
    []
  );
  appLogger.debug({ getQualityListData_searchAll_result: result });
  result.forEach((res: ESQualityDatabaseDataItem) => {
    const key: string = `${res._source.teamId}_${res._source.projectName}`;

    const data: QualityListDataItem = {
      // complexity: res._source.complexity,
      coverage: res._source.coverage,
      duplications: res._source.duplications,
      // issues: res._source.issues,
      // severity: res._source.severity,
      maintainability: res._source.maintainability,
      projectName: res._source.projectName,
      // qualityGates: res._source.qualityGates,
      reliability: res._source.reliability,
      security: res._source.security,
      service: res._source.servicePath,
      // size: res._source.size,
      // tests: res._source.tests,
      teamId: res._source.teamId,
      url: res._source.url,
    };

    if (! Object.keys(aggrMap).includes(key)) {
      aggrMap[key] = [];
    }
    aggrMap[key].push(data);
  });

  Object.keys(aggrMap).forEach((key: string) => {
    const data: QualityListDataItem = {
      // complexity: 0,
      coverage: 0,
      duplications: 0,
      // issues: 0,
      // severity: 0,
      maintainability: 0,
      projectName: '',
      // qualityGates: 0,
      reliability: 0,
      security: 0,
      service: '',
      // size: 0,
      // tests: 0,
      teamId: '',
      url: '',
    };

    aggrMap[key].forEach((item: QualityListDataItem) => {
      // data.complexity += item.complexity;
      data.coverage += item.coverage;
      data.duplications += item.duplications;
      // data.issues += item.issues;
      // data.severity += item.severity;
      data.maintainability += item.maintainability;
      data.projectName = item.projectName;
      // data.qualityGates += item.qualityGates;
      data.reliability += item.reliability;
      data.security += item.security;
      data.service = item.service;
      // data.size += item.size;
      // data.tests += item.size;
      data.teamId = item.teamId;
      data.url = item.url;
    });

    // data.complexity = data.complexity/aggrMap[key].length;
    data.coverage = data.coverage/aggrMap[key].length;
    data.duplications = data.duplications/aggrMap[key].length;
    // data.issues = data.issues/aggrMap[key].length;
    // data.severity = data.severity/aggrMap[key].length;
    data.maintainability = data.maintainability/aggrMap[key].length;
    // data.qualityGates = data.qualityGates/aggrMap[key].length;
    data.reliability = data.reliability/aggrMap[key].length;
    data.security = data.security/aggrMap[key].length;
    // data.size = data.size/aggrMap[key].length;
    // data.tests = data.size/aggrMap[key].length;

    finalResult.push(data);
  });

  return finalResult;
};

export const getQualityGraphData = async ({
  fromDate,
  services,
  teamIds,
  toDate,
}: {
  fromDate: Date;
  services?: string[];
  teamIds?: string[];
  toDate: Date;
}): Promise<QualityGraphDataItem[]> => {
  appLogger.info({ getQualityGraphData: { teamIds, services, fromDate, toDate } });
  const filters: any[] = [];
  if(teamIds) {
    filters.push({terms: { teamId: teamIds } });
//    filters.push({terms: { teamId: teamIds.map((id: string) => id.toLowerCase()) } });
  }
  if (services) {
    const serviceRegexp: string = services.map((service: string) => `.*${service}.*`).join('|');
    filters.push({ regexp: { servicePath: serviceRegexp } });
  }

  const finalResult: QualityGraphDataItem[] = [];

  const intervals: Date[] = formIntervals(fromDate, toDate);
  for (let i = 1; i < intervals.length; i += 1) {
    let result: ESQualityDatabaseDataItem[] = [];

    const timestampRange = {
      gt: Math.floor(intervals[i-1].getTime() / 1000),
      lte: Math.floor(intervals[i].getTime() / 1000),
    };
    const filters1 = [...filters, { range: { timestamp: timestampRange } }];
    appLogger.debug({ getQualityGraphData_searchAll_filter1: filters1 });
    result = await searchAll<ESQualityDatabaseDataItem[]>(
      getQualityTableName(),
      filters1,
      []
    );
    appLogger.debug({ getQualityGraphData_searchAll_result: result });

    const data: QualityGraphDataItem = {
      // complexity: 0,
      coverage: 0,
      duplications: 0,
      // issues: 0,
      // severity: 0,
      maintainability: 0,
      // qualityGates: 0,
      reliability: 0,
      security: 0,
      // size: 0,
      // tests: 0,
      timestamp: intervals[i].getTime(),
    };

    result.forEach((res: ESQualityDatabaseDataItem) => {
      // data.complexity += res._source.complexity;
      data.coverage += res._source.coverage;
      data.duplications += res._source.duplications;
      // data.issues += res._source.issues;
      // data.severity += res._source.severity;
      data.maintainability += res._source.maintainability;
      // data.qualityGates += res._source.qualityGates;
      data.reliability += res._source.reliability;
      data.security += res._source.security;
      // data.size += res._source.size;
      // data.tests += res._source.size;
    });

    // data.complexity = data.complexity/result.length;
    data.coverage = data.coverage/result.length;
    data.duplications = data.duplications/result.length;
    // data.issues = data.issues/result.length;
    // data.severity = data.severity/result.length;
    data.maintainability = data.maintainability/result.length;
    // data.qualityGates = data.qualityGates/result.length;
    data.reliability = data.reliability/result.length;
    data.security = data.security/result.length;
    // data.size = data.size/result.length;
    // data.tests = data.size/result.length;

    finalResult.push(data);
  }

  return finalResult;
};
