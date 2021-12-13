import React, { Fragment } from 'react';
import DatetimeRangePicker from 'react-datetime-range-picker';
import '../../css/metrics/calendar.css';

export default function Calendar(props) {
  const { getCustomDates } = props;

  return (
    <Fragment>
      <DatetimeRangePicker
        timeFormat={false}
        dateFormat='DD/MM/YYYY'
        closeOnSelect={true}
        className='calender'
        onChange={(dateRange) =>
          getCustomDates([dateRange.start, dateRange.end])
        }
      />
    </Fragment>
  );
}
