import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
//import ReactApexChart from 'react-apexcharts';
import Chart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { Http } from '../../../utils';
import { IRootState } from '../../../reducers';
import { IMeanTimeToRestoreDataItem, ITrendDataItem } from '../../../model/metrics/doraData';
import Loader from '../../loader';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { Text } from '../../../common/Language';
import '../../../css/metrics/style.css';

export default function MTTR(props: any) {
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [mttrGraphData, setMttrGraphData] = useState<
    IMeanTimeToRestoreDataItem[]
  >([]);
  const [trendData, setTrendData] = useState<
    ITrendDataItem[]
  >([]);
  const [failureMsg, setFailureMsg] = useState(false);
  const [loader, setLoader] = useState(true);
  const [averageTime, setAverageTime] = useState('');
  const [level, setLevel] = useState('');
  const history = useHistory();

  useEffect(() => {
    fetchData();
    setMttrGraphData([]);
    setTrendData([]);
  }, [props.queryParams]);

  const fetchData = () => {
    let { queryParams } = props;
    let url: string = '';
    url = queryParams ? `/api/metrics/dora/mttr${queryParams}` : `/api/metrics/dora/mttr`;

    Http.get({
      url,
      state: stateVariable,
    })
      .then((response: any) => {
        if (response) {
          setMttrGraphData(
            response.graphData.sort((a: IMeanTimeToRestoreDataItem, b: IMeanTimeToRestoreDataItem) => {
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

  const getMttrCount = () => {
    const mttr: any[] = [];
    const trends: any[] = [];

    mttrGraphData.map((data: IMeanTimeToRestoreDataItem) => {
      mttr.push([
        data.timestamp,
        data.issueCount > 0
          ? Math.round(data.totalRestoreTime / (data.issueCount * 60)) //convert to average hours
          : 0,
      ]);
    });

    trendData.map((data: ITrendDataItem) => {
      trends.push([
        data.timestamp,
        Math.round(data.value / 60) //converting to hours
      ]);
    });

    let dataSet = {
      series: [
        {
          name: 'Mean Time to Restore',
          type: 'area',
          data: mttr,
        },
        {
          name: 'Trends',
          type: 'line',
          data: trends,
        },
      ],
      options: {
        chart: {
          id: 'mttr',
          type: 'area',
          stacked: false,
          height: 230,
          toolbar: {
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
            text: 'Mean Time (in hours)',
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
                  <Text tid='meanTimeToRestore' />
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
              options={getMttrCount().options}
              series={getMttrCount().series}
              type='area'
              height={250}
            />
          )}
        </div>
      </div>
    </div>
  );
}
