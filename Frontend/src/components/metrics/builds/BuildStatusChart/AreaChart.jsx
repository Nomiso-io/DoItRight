import React, { useEffect, Fragment } from 'react';
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';
import { Box, Typography, Container, makeStyles } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import Loader from '../../../loader';
import { getFullDate } from '../../../../utils/data';
import { Text } from '../../../../common/Language';
import '../../../../css/metrics/style.css';

export default function AreaChart(props) {
  let date = new Date();
  let today = getFullDate(date);
  let yesterday = new Date(date.getTime() - 1 * 24 * 60 * 60 * 1000);
  let one_week = getFullDate(
    new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000)
  );
  let one_month = getFullDate(
    new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000)
  );
  let six_months = getFullDate(
    new Date(date.getTime() - 182 * 24 * 60 * 60 * 1000)
  );
  let one_year = getFullDate(
    new Date(date.getTime() - 365 * 24 * 60 * 60 * 1000)
  );
  let ytd = `01 Jan ${date.getFullYear()}`;
  let custom_from_date = getFullDate(props.customDate[0]);
  let custom_to_date = getFullDate(props.customDate[1]);

  useEffect(() => {
    updateData('custom');
  }, [props.customDate]);

  useEffect(() => {
    updateData(props.timeline);
  }, [props.timeline]);

  const updateData = (timeline) => {
    let { getBuildsDateRange } = props;
    switch (timeline) {
      case 'one_day':
        getBuildsDateRange({
          fromDate: new Date(yesterday).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'one_week':
        getBuildsDateRange({
          fromDate: new Date(one_week).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'one_month':
        getBuildsDateRange({
          fromDate: new Date(one_month).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'six_months':
        getBuildsDateRange({
          fromDate: new Date(six_months).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'one_year':
        getBuildsDateRange({
          fromDate: new Date(one_year).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'ytd':
        getBuildsDateRange({
          fromDate: new Date(ytd).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'all':
        getBuildsDateRange({
          fromDate: new Date(one_year).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'custom':
        getBuildsDateRange({
          fromDate: new Date(custom_from_date).getTime().toString(),
          toDate: new Date(custom_to_date).getTime().toString(),
        });
        break;
      default:
    }

    switch (timeline) {
      case 'one_day':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date(getFullDate(yesterday)).getTime(),
          new Date(today).getTime()
        );
        break;
      case 'one_week':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date(one_week).getTime(),
          new Date(today).getTime()
        );
        break;
      case 'one_month':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date(one_month).getTime(),
          new Date(today).getTime()
        );
        break;
      case 'six_months':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date(six_months).getTime(),
          new Date(today).getTime()
        );
        break;
      case 'one_year':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date(one_year).getTime(),
          new Date(today).getTime()
        );
        break;
      case 'ytd':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date(ytd).getTime(),
          new Date(today).getTime()
        );
        break;
      case 'all':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date(ytd).getTime(),
          new Date(today).getTime()
        );
        break;
      case 'custom':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date(custom_from_date).getTime(),
          new Date(custom_to_date).getTime()
        );
        break;
      default:
    }
  };

  return (
    <div id='chart'>
      <div id='chart-timeline'>
        <Fragment>
          <Typography variant='subtitle2' className='subTitleMetricStyle'>
            <Box
              fontWeight={700}
              mb={props.loader || props.failureMsg ? 1.5 : 0}
            >
              <Text tid='buildStatus' />
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
          <Chart
            options={props.getBuildsCount().options}
            series={props.getBuildsCount().series}
            type='area'
            height={260}
          />
        )}
      </div>
    </div>
  );
}
