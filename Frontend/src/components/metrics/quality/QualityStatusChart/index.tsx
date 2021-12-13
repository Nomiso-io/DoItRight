import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Http } from '../../../../utils';
import { IRootState } from '../../../../reducers';
import { ALL } from '../../../../pages/metrics/metric-select';
import { IQualityGraphDataItem } from '../../../../model/metrics/quality';
import LineChart from './LineChart';
import { english } from '../../../../common/apexChartLocales';

export default function QualityReport(props: any) {
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [qualityReportData, setQualityReportData] = useState<
    IQualityGraphDataItem[]
  >([]);
  const [failureMsg, setFailureMsg] = useState(false);
  const [loader, setLoader] = useState(true);
  const [userMsg, setUserMsg] = useState('Loading...');
  const history = useHistory();

  useEffect(() => {
    fetchData();
    setQualityReportData([]);
    setUserMsg('Loading...');
  }, [props.focusTeam, props.focusService, props.focusSubService, props.focusServiceType, props.selectedDateRange]);

  const fetchData = () => {
    let { timeline, focusTeam, focusService, focusSubService, focusServiceType, joinServiceAndSubService, selectedDateRange } = props;
    let url: string = '/api/metrics/quality/graph';
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
          setQualityReportData(
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

  const getQualityReport = () => {
    const reliability: any[] = [];
    const security: any[] = [];
    const maintainabilty: any[] = [];
    const coverage: any[] = [];
    const duplications: any[] = [];

    qualityReportData.map((data: any) => {
      reliability.push({ x: data.timestamp, y: data.reliability });
    });

    qualityReportData.map((data: any) => {
      security.push({ x: data.timestamp, y: data.security });
    });

    qualityReportData.map((data: any) => {
      maintainabilty.push({ x: data.timestamp, y: data.maintainability });
    });

    qualityReportData.map((data: any) => {
      coverage.push({ x: data.timestamp, y: data.coverage });
    });

    qualityReportData.map((data: any) => {
      duplications.push({ x: data.timestamp, y: data.duplications });
    });

    const dataSet = {
      series: [
        {
          name: 'Reliability',
          data: reliability,
        },
        {
          name: 'Security',
          data: security,
        },
        {
          name: 'Maintainabilty',
          data: maintainabilty,
        },
        {
          name: 'Coverage',
          data: coverage,
        },
        {
          name: 'Duplications',
          data: duplications,
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
          locales: [english],
          defaultLocale: 'en',
        },
        colors: ['#CA6F1E', '#f6546a', '#ffa500', '#003366', '#20b2aa'],
        stroke: {
          curve: 'smooth',
          width: 1.5,
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
          title: {
            text: 'Values',
          },
          decimalsInFloat: 2,
        },
        tooltip: {
          x: {
            format: 'dd MMM yyyy',
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
    <LineChart
      getQualityReport={() => getQualityReport()}
      getQualityDateRange={props.getQualityDateRange}
      timeline={props.timeline}
      customDate={props.customDate}
      failureMsg={failureMsg}
      loader={loader}
    />
  );
}
