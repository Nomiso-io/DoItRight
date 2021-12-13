import React, { useEffect } from 'react';
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';
import { Box, Typography, Container, Grid } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Loader from '../../loader';
import { getFullDate } from '../../../utils/data';
import { Text } from '../../../common/Language';
import '../../../css/metrics/style.css';

export default function AreaChart(props) {
  const { level, totalCount, loader, failureMsg } = props;

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
    let { getDateRange } = props;
    switch (timeline) {
      case 'one_day':
        getDateRange({
          fromDate: new Date(yesterday).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'one_week':
        getDateRange({
          fromDate: new Date(one_week).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'one_month':
        getDateRange({
          fromDate: new Date(one_month).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'six_months':
        getDateRange({
          fromDate: new Date(six_months).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'one_year':
        getDateRange({
          fromDate: new Date(one_year).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'ytd':
        getDateRange({
          fromDate: new Date(ytd).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'all':
        getDateRange({
          fromDate: new Date(one_year).getTime().toString(),
          toDate: new Date(date).getTime().toString(),
        });
        break;
      case 'custom':
        getDateRange({
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
        <div className={loader || failureMsg ? 'chartArea' : ''}>
          <Typography
            variant='subtitle2'
            style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
          >
            <Box fontWeight={700} mb={2}>
              <Grid container spacing={3}>
                <Grid item xs={5}>
                  <Text tid='deploymentFrequency' />
                </Grid>
                <Grid item xs={3}>
                  <span className='doraSubTitles'>
                    <Text tid='level' />:
                  </span>{' '}
                  <span
                    className={
                      level === 'Elite'
                        ? 'levelEliteColor'
                        : level === 'High'
                        ? 'levelHighColor'
                        : level === 'Medium'
                        ? 'levelMediumColor'
                        : level === 'low'
                        ? 'levelLowColor'
                        : 'levelNAColor'
                    }
                  >
                    {level}
                  </span>
                </Grid>
                <Grid item xs={4}>
                  <span className='doraSubTitles'>
                    <Text tid='totalCount' />
                   </span>{' '}
                  <span className='countText'>
                    {totalCount && totalCount.toFixed(2)}
                  </span>{' '}
                  <span  className='countText'>
                    <Text tid={level === 'Elite'
                        ? 'levelPerDay'
                        : level === 'High'
                        ? 'levelPerWeek'
                        : level === 'Medium'
                        ? 'levelPerMonth'
                        : level === 'low'
                        ? 'levelPerMonth'
                        : 'levelPerDay'
                    }/>
                  </span>
                </Grid>
              </Grid>
            </Box>
          </Typography>
          {loader ? (
            <Container className='loaderStyle'>
              <Loader />
            </Container>
          ) : failureMsg ? (
            <Alert severity='error'>
              <AlertTitle>
                <Text tid='error' />
              </AlertTitle>
              <Text tid='somethingWentWrong' />
            </Alert>
          ) : (
            <Chart
              options={props.getCount().options}
              series={props.getCount().series}
              type='area'
              height={250}
            />
          )}
        </div>
      </div>
    </div>
  );
}
