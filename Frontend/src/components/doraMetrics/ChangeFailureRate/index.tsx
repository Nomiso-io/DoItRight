import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IRootState } from '../../../reducers';
import { IChangeFailureRateDataItem, ITrendDataItem } from '../../../model/metrics/doraData';
import { Http } from '../../../utils';
import SplineAreaChart from './SplineAreaChart';

export default function ChangeFailureRate(props: any) {
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [failureRateGraphData, setFailureRateGraphData] = useState<
    IChangeFailureRateDataItem[]
  >([]);
  const [trendData, setTrendData] = useState<
    ITrendDataItem[]
  >([]);
  const [failureMsg, setFailureMsg] = useState(false);
  const [loader, setLoader] = useState(true);
  const [aggregateValue, setAggregateValue] = useState(0);
  const [level, setLevel] = useState('');
  const history = useHistory();
  
  useEffect(() => {
    fetchData();
    setFailureRateGraphData([]);
    setTrendData([]);
  }, [props.queryParams]);

  const fetchData = () => {
    let { queryParams } = props;
    let url: string = '';
    url = queryParams ? `/api/metrics/dora/changeFailureRate${queryParams}` : `/api/metrics/dora/changeFailureRate`;
    
    Http.get({
      url,
      state: stateVariable,
    })
      .then((response: any) => {
        if (response) {
          setFailureRateGraphData(
            response.graphData.sort((a: IChangeFailureRateDataItem, b: IChangeFailureRateDataItem) => {
              return a.timestamp - b.timestamp;
            })
          );
          setTrendData(
            response.trendData.sort((a: ITrendDataItem, b: ITrendDataItem) => {
              return a.timestamp - b.timestamp;
            })
          );
          setLoader(false);
          setAggregateValue(response.aggregateValue);
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

  const getChangeFailureRate = () => {
    const failureRate: any[] = [];
    const trends: any[] = [];

    failureRateGraphData.map((data: IChangeFailureRateDataItem) => {
      failureRate.push([
        data.timestamp,
        data.totalBuilds > 0
          ? Math.round((data.countFailBuilds / data.totalBuilds) * 100)
          : 0,
      ]);
    });

    trendData.map((data: ITrendDataItem) => {
      trends.push([data.timestamp, data.value]);
    });

    const dataSet = {
      series: [
        {
          name: 'Failure Rate',
          type: 'area',
          data: failureRate,
        },
        {
          name: 'Trends',
          type: 'line',
          data: trends,
        },
      ],
      options: {
        chart: {
          id: 'change-fail-rate',
          type: 'area',
          stacked: false,
          height: 230,
          toolbar: {
            show: false,
          },
        },
        colors: ['#017a78', '#7000b5'],
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
          title: {
            text: 'Failure Rate (in %)',
          },
          decimalsInFloat: 0,
          labels: {
            formatter: function (value: number) {
              return value.toFixed(2);
            }
          },
        },
        tooltip: {
          enabledOnSeries:[0],
          x: {
            format: 'dd MMM yyyy',
          },
          y: {
            formatter: function (value: number) {
              return value.toFixed(2) + '%';
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
    <SplineAreaChart
      getChangeFailureRate={() => getChangeFailureRate()}
      failureMsg={failureMsg}
      loader={loader}
      aggregateValue={aggregateValue}
      level={level}
    />
  );
}
