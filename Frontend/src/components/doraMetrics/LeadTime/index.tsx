import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
//import ReactApexChart from 'react-apexcharts';
import Chart from 'react-apexcharts';
import { Box, Typography, Container, Grid } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import Loader from '../../loader';
import { useSelector } from 'react-redux';
import { Http } from '../../../utils';
import { IRootState } from '../../../reducers';
import { ILeadTimeDataItem, ITrendDataItem } from '../../../model/metrics/doraData';
import { Text } from '../../../common/Language';
import '../../../css/metrics/style.css';

export default function LeadTime(props: any) {
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [leadTimeGraphData, setLeadTimeGraphData] = useState<
    ILeadTimeDataItem[]
  >([]);
  const [trendData, setTrendData] = useState<
    ITrendDataItem[]
  >([]);
  const [loader, setLoader] = useState(true);
  const [failureMsg, setFailureMsg] = useState(false);
  const [averageTime, setAverageTime] = useState('');
  const [level, setLevel] = useState('');
  const history = useHistory();

  useEffect(() => {
    fetchData();
    setLeadTimeGraphData([]);
    setTrendData([]);
  }, [props.queryParams]);

  const fetchData = () => {
    let { queryParams } = props;
    let url: string = '';
    url = queryParams ? `/api/metrics/dora/leadTime${queryParams}` : `/api/metrics/dora/leadTime`;
    Http.get({
      url,
      state: stateVariable,
    })
      .then((response: any) => {
        if (response) {
          setLeadTimeGraphData(
            response.graphData.sort((a: ILeadTimeDataItem, b: ILeadTimeDataItem) => {
              return a.timestamp - b.timestamp;
            })
          );
          setTrendData(
            response.trendData.sort((a: ITrendDataItem, b: ITrendDataItem) => {
              return a.timestamp - b.timestamp;
            })
          );
          setLoader(false);
          getAverageTimeInHours(response.aggregateValue);
          setLevel(response.level);
        } else {
          setLoader(false);
          setFailureMsg(true);
        }
      })
      .catch((error) => {
        setLoader(false);
        setFailureMsg(true);
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          history.push('/relogin')
        } else {
          history.push('/error')
        }
      });
  };

  const getAverageTimeInHours = (totalMinutes: number) => {
    let hours: number = (totalMinutes / 60);
    let minutes: string = (totalMinutes % 60).toFixed(0);

    if (hours >= 24) {
      let days: string = (hours / 24).toFixed(0);
      let hrs: string = (hours % 24).toFixed(0);
      setAverageTime(`${days} days ${hrs}:${minutes} hrs`);
    } else {
      setAverageTime(`${hours.toFixed(0)}:${minutes} hrs`);
    }
  };

  const getLeadCount = () => {
    const totalLeadTime: any[] = [];
    const trends: any[] = [];

    leadTimeGraphData.map((data: ILeadTimeDataItem) => {
      totalLeadTime.push([
        data.timestamp,
        data.issueCount > 0
          ? Math.round(data.totalLeadTime / (data.issueCount * 60)) //converting to average hours
          : 0,
      ]);
    });

    trendData.map((data: ITrendDataItem) => {
      trends.push([
        data.timestamp,
        Math.round(data.value / 60) //converting to hours
      ]);
    });

    const dataSet = {
      series: [
        {
          name: 'Lead Time for Changes',
          type: 'area',
          data: totalLeadTime,
        },
        {
          name: 'Trends',
          type: 'line',
          data: trends,
        },
      ],
      options: {
        chart: {
          id: 'lead_time',
          type: 'area',
          stacked: false,
          height: 230,
          toolbar: {
//            autoSelected: 'pan',
            show: false,
          },
        },
        colors: ['#FFC300', '#7000b5'],
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'smooth',
          width: 1,
        },
        fill: {
          type: 'solid',
          opacity: 2,
        },
        legend: {
          show: false,
        },
        markers: {
          size: 0,
        },
        xaxis: {
          type: 'datetime',
          tooltip: {
            enabled: false,
          },
        },
        yaxis: {
          labels: {
            formatter: (value: number) => {
              return value.toFixed(2);
            },
          },
          title: {
            text: 'Avg. Lead Time (in hours)',
          },
        },
        tooltip: {
          enabledOnSeries:[0],
          x: {
            format: 'dd MMM yyyy',
          },
          y: {
            formatter: function (value: number) {
              if (value > 24) {
                let days: string = (value / 24).toFixed(0);
                let hrs: string = (value % 24).toFixed(2);
                return days + ' days ' + hrs + ' hrs';
              } else {
                return value.toFixed(2) + ' hrs';
              }
            },
          },
        },
        noData: {
          text: 'Loading...',
          align: 'center',
          verticalAlign: 'middle',
          offsetX: 0,
          offsetY: 0,
          style: {
            color: '#000000',
            fontSize: '12.5px',
            fontFamily: 'Helvetica, Arial, sans-serif',
          },
        },
      },
    };
    return dataSet;
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
                  <Text tid='leadTimeForChanges' />
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
                    <Text tid='averageTime' />
                  </span>{' '}
                  <span className='countText'>
                    {averageTime && averageTime}
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
              options={getLeadCount().options}
              series={getLeadCount().series}
              type='area'
              height={250}
            />
          )}
        </div>
      </div>
    </div>
  );
}
