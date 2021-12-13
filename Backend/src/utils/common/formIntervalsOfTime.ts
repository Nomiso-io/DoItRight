export function formIntervals(fromDate: Date, toDate: Date): Date[] {
  const intervals: Date[] = [];
  const oneHourInMS = 3600000;
  const oneDayInMS = 24 * 3600000;
//  const oneWeekInMS = 7 * 24 * 3600000;
//  const oneMonthInMS = 30 * 24 * 3600000;
//  const oneQuarterInMS = 91 * 24 * 3600000;
//  const oneYearInMS = 365 * 24 * 3600000;
  const gap =
    toDate.getTime() - fromDate.getTime() > oneDayInMS
      ? oneDayInMS
      : oneHourInMS;

  let date = new Date(fromDate.getTime());
  while (date.getTime() <= toDate.getTime()) {
    intervals.push(date);
    date = new Date(date.getTime() + gap);
  }

  return intervals;
}
