import React, { Fragment } from 'react';
import { timelineList } from '../common';
import '../../css/metrics/style.css';

export default function TimelineButton(props: any) {
  const { timeline, updateData } = props;
  return (
    <Fragment>
      {timelineList.map((timelineData: any, index: number) => {
        return (
          <button
            id={timelineData.id}
            onClick={() => updateData(timelineData.id)}
            className={
              timeline === timelineData.id ? 'selected' : 'durationBtn'
            }
            disabled={timeline === timelineData.id}
            key={index}
          >
            {timelineData.name}
          </button>
        );
      })}
    </Fragment>
  );
}
