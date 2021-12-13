import React from 'react';
import { MuiThemeProvider, Typography, Tooltip } from '@material-ui/core';
import { tooltipTheme } from '../common';
import InfoIcon from '@material-ui/icons/Info';
import { Text } from '../Language';
import '../../css/metrics/style.css';

export const TimelineTooltip = (
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
  </MuiThemeProvider>
);
