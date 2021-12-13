import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Http } from '../../../utils';
import { IRootState } from '../../../reducers';
import { IDeploymentDataItem, ITrendDataItem } from '../../../model/metrics/doraData';
import AreaChart from './AreaChart';

export default function DeploymentFrequency(props: any) {
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [deploymentGraphData, setDeploymentGraphData] = useState<
    IDeploymentDataItem[]
  >([]);
  const [trendData, setTrendData] = useState<
    ITrendDataItem[]
  >([]);
  const [failureMsg, setFailureMsg] = useState(false);
  const [loader, setLoader] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [level, setLevel] = useState('');
  const history = useHistory();

  useEffect(() => {
    fetchData();
    setDeploymentGraphData([]);
    setTrendData([]);
  }, [props.queryParams]);

  const fetchData = () => {
    let { queryParams } = props;
    let url : string = '';
    url = queryParams ? `/api/metrics/dora/deployment${queryParams}` : `/api/metrics/dora/deployment`;
    Http.get({
      url,
      state: stateVariable,
    })
      .then((response: any) => {
        if (response) {
          setDeploymentGraphData(
            response.graphData.sort((a: IDeploymentDataItem, b: IDeploymentDataItem) => {
              return a.timestamp - b.timestamp;
            })
          );
          setTrendData(
            response.trendData.sort((a: ITrendDataItem, b: ITrendDataItem) => {
              return a.timestamp - b.timestamp;
            })
          );
          setLoader(false);
          setTotalCount(response.aggregateValue);
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

  const getCount = () => {
    const deployments: any[] = [];
    const trends: any[] = [];

    deploymentGraphData.map((data: IDeploymentDataItem) => {
      deployments.push([data.timestamp, data.countBuilds]);
    });

    trendData.map((data: ITrendDataItem) => {
      trends.push([data.timestamp, data.value]);
    });
//    console.log(trendData);
//    console.log(deploymentGraphData);

    const dataSet = {
      series: [
        {
          name: 'Deployments Frequency',
          type: 'area',
          data: deployments,
        },
        {
          name: 'Trends',
          type: 'line',
          data: trends,
        },
      ],

      options: {
        chart: {
          id: 'deplopment_frequency',
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
            text: 'Number of Deployments',
          },
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
              return value;
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
    <AreaChart
      getCount={() => getCount()}
      getDateRange={props.getDateRange}
      timeline={props.timeline}
      customDate={props.customDate}
      failureMsg={failureMsg}
      loader={loader}
      totalCount={totalCount}
      level={level}
    />
  );
}
