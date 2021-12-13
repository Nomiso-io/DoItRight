import React, { Fragment } from 'react';
import TimelineButton from '../../../common/metrics/timelineButton';
import TimelineCalendar from '../../../common/metrics/timelineCalendar';
import { TimelineTooltip } from '../../../common/metrics/timelineTooltip';

export default function RequirementsTimeline(props: any) {
  const { requirementsTimeline, updateRequirementsData, getRequirementsCustomDates } = props;
  return (
    <Fragment>
      &nbsp; &nbsp;
      <TimelineButton
        timeline={requirementsTimeline}
        updateData={(requirementsTimeline: any) => updateRequirementsData(requirementsTimeline)}
      />
      &nbsp; &nbsp;
      <TimelineCalendar getCustomDates={getRequirementsCustomDates} />
      &nbsp;
      {TimelineTooltip}
    </Fragment>
  );
}
