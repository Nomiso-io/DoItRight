import React, { Fragment } from 'react';
//import ReactApexChart from 'react-apexcharts';
import Chart from 'react-apexcharts';
import { Box, Typography, Container, Grid } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Loader from '../../loader';
import { Text } from '../../../common/Language';
import '../../../css/metrics/style.css';

export default function SplineAreaChart(props) {
  const { level, aggregateValue, loader, failureMsg } = props;

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
                  <Text tid='changeFailureRate' />
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
                    <Text tid='averageRate' />
                  </span>{' '}
                    <span className='countText'>
                      {aggregateValue && aggregateValue.toFixed(2) + '%'}
                    </span>
                </Grid>
              </Grid>
            </Box>
          </Typography>
          {loader ? (
            <Fragment>
              <Container className='loaderStyle'>
                <Loader />
              </Container>
              <Chart
                options={props.getChangeFailureRate().options}
                series={props.getChangeFailureRate().series}
                type='area'
                height={0}
              />
            </Fragment>
          ) : failureMsg ? (
            <Alert severity='error'>
              <AlertTitle>
                <Text tid='error' />
              </AlertTitle>
              <Text tid='somethingWentWrong' />
            </Alert>
          ) : (
            <Chart
              options={props.getChangeFailureRate().options}
              series={props.getChangeFailureRate().series}
              type='area'
              height={250}
            />
          )}
        </div>
      </div>
    </div>
  );
}
