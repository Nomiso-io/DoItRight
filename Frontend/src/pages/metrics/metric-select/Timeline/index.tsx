import React, { Fragment } from 'react';
import { Typography, Tooltip, MuiThemeProvider } from '@material-ui/core';
import Calendar from './Calendar';
import InfoIcon from '@material-ui/icons/Info';
import { timelineList, tooltipTheme } from '../../../../common/common';
import { Text } from '../../../../common/Language';
import '../../../../css/metrics/style.css';

export default function DoraMetricsTimeline(props: any) {
  const { updateTimelineData, timeline } = props;
  return (
    <Fragment>
      &nbsp; &nbsp; &nbsp;
      {timelineList.map((timelineData: any, index: number) => {
        return (
          <button
            id={timelineData.id}
            onClick={() => updateTimelineData(timelineData.id)}
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
      &nbsp; &nbsp;
      <Calendar getCustomDates={props.getDoraMetricsCustomDates} />
      {/* &nbsp;
      <MuiThemeProvider theme={tooltipTheme}>
        <Tooltip
          title={
            <Typography className='tooltipTitleStyle'>
              <Text tid='clickChartLegendLabelsToFilterTheRecords' />
            </Typography>
          }
        >
          <InfoIcon className='infoIconStyle' />
        </Tooltip>
      </MuiThemeProvider> */}
    </Fragment>
  );
}
