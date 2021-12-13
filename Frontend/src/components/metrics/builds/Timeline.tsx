import React, { Fragment } from 'react';
import TimelineButton from '../../../common/metrics/timelineButton';
import TimelineCalendar from '../../../common/metrics/timelineCalendar';
import { TimelineTooltip } from '../../../common/metrics/timelineTooltip';

export default function BuildsTimeline(props: any) {
  const { buildsTimeline, updateBuildsData, getBuildsCustomDates } = props;
  return (
    <Fragment>
      &nbsp; &nbsp; &nbsp; &nbsp;
      <TimelineButton
        timeline={buildsTimeline}
        updateData={(buildsTimeline: any) => updateBuildsData(buildsTimeline)}
      />
      &nbsp; &nbsp;
      <TimelineCalendar getCustomDates={getBuildsCustomDates} />
      &nbsp;
      {TimelineTooltip}
    </Fragment>
  );
}
