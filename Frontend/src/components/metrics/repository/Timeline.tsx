import React, { Fragment } from 'react';
import TimelineButton from '../../../common/metrics/timelineButton';
import TimelineCalendar from '../../../common/metrics/timelineCalendar';
import { TimelineTooltip } from '../../../common/metrics/timelineTooltip';

export default function ReposTimeline(props: any) {
  const { reposTimeline, updateReposData, getReposCustomDates } = props;
  return (
    <Fragment>
      &nbsp; &nbsp;
      <TimelineButton
        timeline={reposTimeline}
        updateData={(reposTimeline: any) => updateReposData(reposTimeline)}
      />
      &nbsp; &nbsp;
      <TimelineCalendar getCustomDates={getReposCustomDates} />
      &nbsp;
      {TimelineTooltip}
    </Fragment>
  );
}
