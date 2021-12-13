import React, { useState, useEffect, Fragment } from 'react';
import { Box, Typography, Container } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { Http } from '../../../utils';
import { IRootState } from '../../../reducers';
import { ALL } from '../../../pages/metrics/metric-select';
import { IRepoPullReqWaitTimeDataItem } from '../../../model/metrics/repositoryData';
import Loader from '../../loader';
import { Alert, AlertTitle } from '@material-ui/lab';
import { Text } from '../../../common/Language';
import '../../../css/metrics/style.css';

export default function DelayChart(props: any) {
  const [delayCount, setDelayCount] = useState<Object[]>([]);
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [displayData, setDisplayData] = useState<
    IRepoPullReqWaitTimeDataItem[]
  >([]);
  const [failureMsg, setFailureMsg] = useState(false);
  const [loader, setLoader] = useState(true);
  const [userMsg, setUserMsg] = useState('Loading...');
  const history = useHistory();

  useEffect(() => {
    fetchData();
    setDisplayData([]);
    setUserMsg('Loading...');
  }, [props.focusTeam, props.focusService, props.focusSubService, props.focusServiceType, props.committerName, props.selectedDateRange]);

  useEffect(() => {
    var delayCount = displayData.map((data: any) => {
      return [
        data.timestampEnd,
        data.closedPullReqCount > 0
          ? Math.trunc(data.totalClosureTime / data.closedPullReqCount)
          : 0,
      ];
    });
    setDelayCount(delayCount);
  }, [displayData]);

  const fetchData = () => {
    let { selectedDateRange, timeline, focusTeam, focusService, focusSubService, focusServiceType, joinServiceAndSubService, committerName } = props;
    let url: string = '/api/metrics/repos/delayGraph';
    let joiner = '?';
    if (focusTeam[0] !== ALL) {
      url = `${url}${joiner}teamId=${focusTeam.toString()}`;
      joiner = '&';
    }
    if (focusService[0] !== ALL && focusSubService[0] !== ALL) {
      url = `${url}${joiner}service=${joinServiceAndSubService()}`;
      joiner = '&';
    } else if (focusService[0] !== ALL) {
      url = `${url}${joiner}service=${focusService.join()}`;
      joiner = '&';
    } else if (focusSubService[0] !== ALL) {
      url = `${url}${joiner}service=${focusSubService.join()}`;
      joiner = '&';
    }
    if (focusServiceType[0] !== ALL) {
      url = `${url}${joiner}serviceType=${focusServiceType.join()}`;
      joiner = '&';
    }
    if (committerName[0] !== ALL) {
      url = `${url}${joiner}committer=${committerName.toString()}`;
      joiner = '&';
    }
    if (timeline !== 'one_day') {
      url = `${url}${joiner}fromDate=${selectedDateRange.fromDate}&toDate=${selectedDateRange.toDate}`;
      joiner = '&';
    }

    Http.get({
      url,
      state: stateVariable,
    })
      .then((response: any) => {
        if (response) {
          setTimeout(() => {
            setUserMsg('');
          }, 10000);
          setDisplayData(
            response.sort((a: any, b: any) => {
              return a.timestampEnd - b.timestampEnd;
            })
          );
          setLoader(false);
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
        }
      });
  };

  let delayData = {
    series: [
      {
        name: 'Wait Time',
        data: delayCount,
      },
    ],
    options: {
      chart: {
        id: 'areachart-2',
        type: 'line',
        height: 230,
        toolbar: {
          show: false,
        },
      },
      colors: ['#CA6F1E'],
      stroke: {
        curve: 'smooth',
        width: 1.5,
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        opacity: 1,
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
            return (value / 60).toFixed();
          },
        },
        title: {
          text: 'Number of Hours',
        },
      },
      tooltip: {
        x: {
          format: 'dd MMM yyyy',
        },
        y: {
          formatter: function (value: number) {
            return (value / 60).toFixed() + ' ' + 'Hrs';
          },
        },
      },
      noData: {
        text: userMsg,
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

  return (
    <div id='chart'>
      <div id='chart-timeline'>
        <Fragment>
          <Typography variant='subtitle2' className='subTitleMetricStyle'>
            <Box fontWeight={700} mb={loader || failureMsg ? 1.5 : 0}>
              <Text tid='waitTime' />
            </Box>
          </Typography>
        </Fragment>
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
          <ReactApexChart
            options={delayData.options}
            series={delayData.series}
            type='line'
            height={260}
          />
        )}
      </div>
    </div>
  );
}
