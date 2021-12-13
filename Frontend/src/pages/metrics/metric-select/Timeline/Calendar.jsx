import React, { Fragment } from 'react';
import DatetimeRangePicker from 'react-datetime-range-picker';
import '../../../../css/metrics/calendar.css';

export default function Calendar(props) {
  const onChangeDateRange = (dateRange) => {
    let { getCustomDates } = props;
    getCustomDates([dateRange.start, dateRange.end]);
  };

  return (
    <Fragment>
      <DatetimeRangePicker
        timeFormat={false}
        dateFormat='DD/MM/YYYY'
        closeOnSelect={true}
        className='calender'
        onChange={onChangeDateRange}
      />
    </Fragment>
  );
}
