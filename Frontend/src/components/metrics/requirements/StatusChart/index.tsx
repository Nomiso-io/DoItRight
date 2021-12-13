import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getFullDate } from '../../../../utils/data';
import { IRootState } from '../../../../reducers';
import { IReqStatusDataItem } from '../../../../model/metrics/requirementsData';
import { Http } from '../../../../utils';
import { ALL } from '../../../../pages/metrics/metric-select';
import SplineAreaChart from './SplineAreaChart';

export default function ReqStatusChart(props: any) {
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [requirementStatusData, setRequirementStatusData] = useState<
    IReqStatusDataItem[]
  >([]);
  const [failureMsg, setFailureMsg] = useState(false);
  const [loader, setLoader] = useState(true);
  const [userMsg, setUserMsg] = useState('Loading...');
  const history = useHistory();

  let date = new Date();
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
    updateData(props.timeline);
  }, [props.customDate, props.timeline]);

  useEffect(() => {
    setRequirementStatusData([]);
    setUserMsg('Loading...');
    fetchData();
  }, [props.focusTeam, props.focusService, props.focusSubService, props.focusServiceType, props.itemType, props.itemPriority, props.selectedDateRange]);

  const fetchData = () => {
    let { timeline, focusTeam, focusService, focusSubService, focusServiceType, joinServiceAndSubService, itemType, itemPriority, selectedDateRange } = props;
    let url: string = '/api/metrics/reqs/status';
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
          setRequirementStatusData(
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

  const getDateRange = (dateRange: any) => {
    let { getRequirementsDateRange } = props;
    getRequirementsDateRange(dateRange);
  };

  const updateData = (timeline: string) => {
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
  };

  const getIssueCount = () => {
    const countNew: any[] = [];
    const countInProgress: any[] = [];
    const countResolved: any[] = [];

    requirementStatusData.map((data: any) => {
      countNew.push({ x: data.timestamp, y: data.countNew });
    });

    requirementStatusData.map((data: any) => {
      countInProgress.push({ x: data.timestamp, y: data.countInProgress });
    });

    requirementStatusData.map((data: any) => {
      countResolved.push({ x: data.timestamp, y: data.countResolved });
    });

    const dataSet = {
      series: [
        {
          name: 'Resolved',
          data: countResolved,
        },
        {
          name: 'In Progress',
          data: countInProgress,
        },
        {
          name: 'Open',
          data: countNew,
        },
      ],
      options: {
        chart: {
          height: 250,
          type: 'area',
          toolbar: {
            show: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'smooth',
          width: 2,
        },
        colors: ['#00ad6b', '#FFC300', '#808080'],
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
          title: {
            text: 'Counts',
          },
        },
        tooltip: {
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
    <SplineAreaChart
      getIssueCount={() => getIssueCount()}
      failureMsg={failureMsg}
      loader={loader}
    />
  );
}
