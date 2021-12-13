import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Http } from '../../../../utils';
import { IRootState } from '../../../../reducers';
import { ALL } from '../../../../pages/metrics/metric-select';
import { IBuildsGraphDataItem } from '../../../../model/metrics/buildsData';
import AreaChart from './AreaChart';

export default function BuildChart(props: any) {
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [buildsData, setBuildsData] = useState<IBuildsGraphDataItem[]>([]);
  const [failureMsg, setFailureMsg] = useState(false);
  const [loader, setLoader] = useState(true);
  const [userMsg, setUserMsg] = useState('Loading...');
  const history = useHistory();

  useEffect(() => {  
    fetchData();
    setBuildsData([]);
    setUserMsg('Loading...');
  }, [props.focusTeam, props.focusService, props.focusSubService, props.focusServiceType/*props.serviceAndSubService*/, props.selectedDateRange]);

  const fetchData = () => {
    let { timeline, focusTeam, focusService, focusSubService, focusServiceType, joinServiceAndSubService/*serviceAndSubService*/, selectedDateRange } = props;
    let url: string = '/api/metrics/builds/graph';
    let joiner = '?';
    if (focusTeam[0] !== ALL) {
      url = `${url}${joiner}teamId=${focusTeam.join()}`;
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
          setBuildsData(
            response.sort((a: IBuildsGraphDataItem, b: IBuildsGraphDataItem) => {
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
        } else {
          history.push('/error')
        }
      });
  };

  const getBuildsCount = () => {
    const successBuilds: any[] = [];
    const failureBuilds: any[] = [];
    const inprogressBuilds: any[] = [];
//    const otherBuilds: any[] = [];

    let totalSuccessBuilds: number = 0;
    let totalFailedBuilds: number = 0;
    let totalInProgressBuilds: number = 0;

    buildsData.map((data: IBuildsGraphDataItem) => {
      successBuilds.push([data.timestampEnd, data.countSuccessBuilds]);
      totalSuccessBuilds += data.countSuccessBuilds;

      failureBuilds.push([data.timestampEnd, data.countFailBuilds]);
      totalFailedBuilds += data.countFailBuilds;

      inprogressBuilds.push([data.timestampEnd, data.countInProgressBuilds]);
      totalInProgressBuilds += data.countInProgressBuilds;
    });

//    buildsData.map((data: IBuildsGraphDataItem) => {
//      otherBuilds.push([data.timestampEnd, data.countOtherBuilds]);
//    });

    const dataSet = {
      series: [
        {
          name: `Successful (${totalSuccessBuilds})`,
          data: successBuilds,
        },
        {
          name: `Failed (${totalFailedBuilds})`,
          data: failureBuilds,
        },
        {
          name: `In Progress (${totalInProgressBuilds})`,
          data: inprogressBuilds,
        },
//        {
//          name: 'Other Build',
//          data: otherBuilds,
//        },
      ],

      options: {
        chart: {
          id: 'area-datetime',
          type: 'area',
          stacked: true,
          zoom: {
            autoScaleYaxis: true,
          },
          toolbar: {
            show: false,
          },
          events: {
            legendClick: function (chartContext: any, seriesIndex: any) {
              // chartContext attribute need to be keep as per the syntax
              props.handleLegendClick(seriesIndex);
            },
          },
        },
        colors: ['#00ad6b', '#fc0d05',/* '#fc7f26',*/ '#edb500'],
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'smooth',
          width: 1,
        },
        fill: {
          type: 'solid',
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
        },
        xaxis: {
          type: 'datetime',
          tooltip: {
            enabled: false,
          },
        },
        yaxis: {
          floating: false,
          title: {
            text: 'Counts',
          },
        },
        tooltip: {
          inverseOrder: true,
          x: {
            format: 'dd MMM yyyy',
          },
          y: {
            formatter: function (value: number) {
              return value;
            },
            title: {
              formatter: (seriesName: string) => {
                let name = seriesName.split(' (')[0];
                return `${name}:`;
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
    <AreaChart
      getBuildsCount={() => getBuildsCount()}
      getBuildsDateRange={props.getBuildsDateRange}
      timeline={props.timeline}
      customDate={props.customDate}
      failureMsg={failureMsg}
      loader={loader}
    />
  );
}
