import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Http } from '../../../../utils';
import { IRootState } from '../../../../reducers';
import { getFullDate } from '../../../../utils/data';
import { ALL } from '../../../../pages/metrics/metric-select';
import { IRepoPullReqsDataItem } from '../../../../model/metrics/repositoryData';
import PieChart from './PieChart';

let selectedDateRange = { fromDate: 0, toDate: 0 };
let initialPullRequestData = [
  {
    commitsAccepted: 0,
    commitsCreated: 0,
    commitsPending: 0,
    commitsRejected: 0,
    committerName: '',
    projectName: '',
    teamId: '',
    timestampEnd: 0,
    url: '',
  },
];

export default function PullRequestChart(props: any) {
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [displayData, setDisplayData] = useState<IRepoPullReqsDataItem[]>(
    initialPullRequestData
  );
  const [loader, setLoader] = useState(true);
  const [failureMsg, setFailureMsg] = useState(false);
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
    fetchData();
    setDisplayData(initialPullRequestData);
    // setUserMsg('Loading...');
  }, [props.customDate, props.timeline, props.committerName]);

  useEffect(() => {
    fetchData();
    setDisplayData(initialPullRequestData);
  }, [props.focusTeam, props.focusService, props.focusSubService, props.focusServiceType]);

  useEffect(() => {
    let acceptedCount = displayData
      .map((a: any) => a.commitsAccepted)
      .reduce(function (a: any, b: any) {
        return a + b;
      });
    let rejectedCount = displayData
      .map((a: any) => a.commitsRejected)
      .reduce(function (a: any, b: any) {
        return a + b;
      });
    let pendingCount = displayData
      .map((a: any) => a.commitsPending)
      .reduce(function (a: any, b: any) {
        return a + b;
      });
    setAcceptedCount(acceptedCount);
    setRejectedCount(rejectedCount);
    setPendingCount(pendingCount);
    setLoader(true);
  }, [displayData]);

  const getDateRange = (dateRange: any) => {
    let { getReposDateRange } = props;
    selectedDateRange = dateRange;
    getReposDateRange(dateRange);
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

  const fetchData = () => {
    let { timeline, focusTeam, focusService, focusSubService, focusServiceType, joinServiceAndSubService, committerName } = props;
    let url: string = '/api/metrics/repos/pullRequestsGraph';
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
          // setTimeout(() => {
          //   setUserMsg('');
          // }, 10000);
          getPullRequestStatus(response);
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

  const getPullRequestStatus = (pullRequestStatus: any) => {
    setDisplayData(
      pullRequestStatus.length > 0 ? pullRequestStatus : initialPullRequestData
    );
  };

  let repositoryData = {
    series: [acceptedCount, rejectedCount, pendingCount],
    labels: [acceptedCount, rejectedCount, pendingCount],
    options: {
      chart: {
        type: 'pie',
      },
      chartOptions: {
        labels: [acceptedCount, rejectedCount, pendingCount],
      },
      legend: {
        position: 'bottom',
      },
      colors: ['#00ad6b', '#fc6a26', '#FFC300'],
      labels: ['Accepted', 'Rejected', 'Pending'],
      states: {
        hover: {
          filter: {
            type: 'none',
            value: 0.15,
          },
        },
      },
    },
  };

  return (
    <PieChart
      repositoryData={repositoryData}
      failureMsg={failureMsg}
      loader={loader}
    />
  );
}
