import React, { Fragment } from 'react';
import TimelineButton from '../../../common/metrics/timelineButton';
import TimelineCalendar from '../../../common/metrics/timelineCalendar';
import { TimelineTooltip } from '../../../common/metrics/timelineTooltip';

export default function qualityTimeline(props: any) {
  const { qualityTimeline, updateQualityData, getQualityCustomDates } = props;
  return (
    <Fragment>
      &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
      <TimelineButton
        timeline={qualityTimeline}
        updateData={(qualityTimeline: any) =>
          updateQualityData(qualityTimeline)
        }
      />
      &nbsp; &nbsp;
      <TimelineCalendar getCustomDates={getQualityCustomDates} />
      &nbsp;
      {TimelineTooltip}
    </Fragment>
  );
}
