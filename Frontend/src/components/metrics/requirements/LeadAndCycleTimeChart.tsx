import React, { useState, useEffect, Fragment } from 'react';
import { Box, Typography, Container, makeStyles } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { Http } from '../../../utils';
import { IRootState } from '../../../reducers';
import { ALL } from '../../../pages/metrics/metric-select';
import { IReqLTCTDataItem } from '../../../model/metrics/requirementsData';
import Loader from '../../loader';
import { Alert, AlertTitle } from '@material-ui/lab';
import { Text } from '../../../common/Language';
import '../../../css/metrics/style.css';

export default function LeadAndCycleTimeChart(props: any) {
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [ltctData, setLtCtData] = useState<IReqLTCTDataItem[]>([]);
  const [failureMsg, setFailureMsg] = useState(false);
  const [loader, setLoader] = useState(true);
  const [userMsg, setUserMsg] = useState('Loading...');
  const history = useHistory();

  useEffect(() => {
    fetchData();
    setLtCtData([]);
    setUserMsg('Loading...');
  }, [
    props.focusTeam,
    props.focusService,
    props.focusSubService,
    props.focusServiceType,
    props.selectedDateRange,
    props.itemType,
    props.itemPriority,
  ]);

  const fetchData = () => {
    let { timeline, focusTeam, focusService, focusSubService, focusServiceType, joinServiceAndSubService, itemType, itemPriority, selectedDateRange } = props;
    
    let url: string = '/api/metrics/reqs/ltct';
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
    if (itemType[0] !== ALL) {
      url = `${url}${joiner}type=${itemType.toString()}`;
      joiner = '&';
    }
    if (itemPriority[0] !== ALL) {
      url = `${url}${joiner}priority=${itemPriority.toString()}`;
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
          setLtCtData(
            response.sort((a: any, b: any) => {
              return a.timestamp - b.timestamp;
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

  const getLtCtCount = () => {
    const totalLeadTime: any[] = [];
    const totalCycleTime: any[] = [];

    ltctData.map((data: any) => {
      totalLeadTime.push([
        data.timestamp,
        data.issueCount
          ? Math.round(data.totalLeadTime / (data.issueCount * 60))
          : 0, //converting to average hours
      ]);
    });

    ltctData.map((data: any) => {
      totalCycleTime.push([
        data.timestamp,
        data.issueCount
          ? Math.round(data.totalCycleTime / (data.issueCount * 60))
          : 0, //converting to average hours
      ]);
    });

    const dataSet = {
      series: [
        {
          name: 'Lead Time',
          data: totalLeadTime,
        },
        {
          name: 'Cycle Time',
          data: totalCycleTime,
        },
      ],
      options: {
        chart: {
          id: 'chart2',
          type: 'line',
          height: 230,
          toolbar: {
            autoSelected: 'pan',
            show: false,
          },
        },
        colors: ['#FFC300', '#CA6F1E', '#F26A1E', '#EDD041'],
        stroke: {
          curve: 'smooth',
          width: 2,
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
        },
        dataLabels: {
          enabled: false,
        },
        fill: {
          opacity: 1,
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
              return value.toFixed();
            },
          },
          title: {
            text: 'Time in Hours',
          },
        },
        tooltip: {
          x: {
            format: 'dd MMM yyyy',
          },
          y: {
            formatter: function (value: number) {
              if (value > 24) {
                let days: string = (value / 24).toFixed();
                let hrs: string = (value % 24).toFixed();
                return days + ' days ' + hrs + ' hrs';
              } else {
                return value.toFixed() + ' hrs';
              }
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
    return dataSet;
  };

  return (
    <div id='chart'>
      <div id='chart-timeline'>
        <Fragment>
          <Typography variant='subtitle2' className='subTitleMetricStyle'>
            <Box fontWeight={700} mb={loader || failureMsg ? 1.5 : 0}>
              <Text tid='leadTime-CycleTime' />
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
            options={getLtCtCount().options}
            series={getLtCtCount().series}
            type='line'
            height={260}
          />
        )}
      </div>
    </div>
  );
}
