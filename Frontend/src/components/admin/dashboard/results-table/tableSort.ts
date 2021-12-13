import { IResultsTable, ResultsTableItem } from './resultsTable';

const compare = (a: ResultsTableItem, b: ResultsTableItem) => {
  return a.sortFactor < b.sortFactor ? -1 : 1;
};

export const sortTable = async (
  table: IResultsTable
): Promise<ResultsTableItem[]> => {
  return new Promise((resolve, reject) => {
    const tableArray: ResultsTableItem[] = [];
    Object.keys(table).forEach((el) => {
      tableArray.push(table[el]);
    });
    tableArray.sort(compare);
    return resolve(tableArray);
  });
};
