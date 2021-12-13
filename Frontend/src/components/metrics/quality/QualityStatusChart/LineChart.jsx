import React, { useEffect, Fragment } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Box, Typography, Container, makeStyles } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import Loader from '../../../loader';
import { getFullDate } from '../../../../utils/data';
import { Text } from '../../../../common/Language';
import '../../../../css/metrics/style.css';

export default function LineChart(props) {
  let date = new Date();
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
    let { getQualityDateRange } = props;
    switch (timeline) {
      case 'one_day':
        getQualityDateRange({
          fromDate: new Date(yesterday).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'one_week':
        getQualityDateRange({
          fromDate: new Date(one_week).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'one_month':
        getQualityDateRange({
          fromDate: new Date(one_month).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'six_months':
        getQualityDateRange({
          fromDate: new Date(six_months).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'one_year':
        getQualityDateRange({
          fromDate: new Date(one_year).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'ytd':
        getQualityDateRange({
          fromDate: new Date(ytd).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'all':
        getQualityDateRange({
          fromDate: new Date(one_year).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'custom':
        getQualityDateRange({
          fromDate: new Date(custom_from_date).getTime().toString(),
          toDate: new Date(custom_to_date).getTime().toString(),
        });
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
              <Text tid='qualityReport' />
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
            options={props.getQualityReport().options}
            series={props.getQualityReport().series}
            type='line'
            height={262}
          />
        )}
      </div>
    </div>
  );
}
