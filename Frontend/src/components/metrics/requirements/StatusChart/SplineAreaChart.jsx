import React, { Fragment } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Box, Typography, Container } from '@material-ui/core';
import Loader from '../../../loader';
import { Alert, AlertTitle } from '@material-ui/lab';
import { Text } from '../../../../common/Language';
import '../../../../css/metrics/style.css';

export default function SplineAreaChart(props) {
  return (
    <div id='chart'>
      <div id='chart-timeline'>
        <Fragment>
          <Typography variant='subtitle2' className='subTitleMetricStyle'>
            <Box
              fontWeight={700}
              mb={props.loader || props.failureMsg ? 1.5 : 0}
            >
              <Text tid='issueCount' />
            </Box>
          </Typography>
        </Fragment>
        {props.loader ? (
          <Container className='loaderStyle'>
            <Loader />
          </Container>
        ) : props.failureMsg ? (
          <Alert severity='error'>
            <AlertTitle>
              <Text tid='error' />
            </AlertTitle>
            <Text tid='somethingWentWrong' />
          </Alert>
        ) : (
          <ReactApexChart
            options={props.getIssueCount().options}
            series={props.getIssueCount().series}
            type='area'
            height={260}
          />
        )}
      </div>
    </div>
  );
}
