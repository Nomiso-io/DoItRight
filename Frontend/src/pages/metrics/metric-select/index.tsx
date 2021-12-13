import React, { Fragment, useEffect, useState } from 'react';
import {
  Container,
  makeStyles,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  Input,
  ListItemText,
  Checkbox,
  Typography,
  Paper,
} from '@material-ui/core';
import {
  DeploymentFrequency,
  LeadTime,
  MTTR,
  ChangeFailureRate,
} from '../../../components/doraMetrics';
import DoraMetricsTimeline from './Timeline';
import { withRouter } from 'react-router-dom';
import clsx from 'clsx';
import MetricsList from './metricsList';
import { useSelector } from 'react-redux';
import { Http } from '../../../utils';
import { IRootState } from '../../../reducers';
import { Text } from '../../../common/Language';
import '../../../css/metrics/style.css';
import { IServiceInfo, ITeamInfo } from '../../../model';

export const ALL = 'All';

const useStyles = makeStyles((theme) => ({
  containerTop: {
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    position: 'fixed',
    top: '100px',
    zIndex: 100,
    backgroundColor: '#ffffff'
  },
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(3),
    position: 'relative',
    top: '120px',
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    paddingBottom: 0,
    border: '1px solid #b6b6b6',
  },
  doraMetricsContainer: {
    border: '1px solid #b1b1b1',
    marginTop: '20px',
    paddingTop: '10px',
    paddingBottom: '10px',
    borderRadius: '5px',
    boxShadow: '0px 0px 2px #a2a2a2',
    backgroundColor: '#e0e0e0',
  },
  fixedHeight: {
    height: 350,
  },
  toolbar: {
    fontSize: '12px !important',
    fontWeight: 'bold',
    display: 'initial',
  },
  viewMoreText: {
    color: 'blue',
    cursor: 'pointer',
    fontSize: '14px',
  },
  doraMetricsLinkText: {
    color: 'blue',
    cursor: 'pointer',
    float: 'right',
  },
}));

let now = new Date();
let todayBegin = new Date(now.getFullYear(), now.getMonth(), now.getDate());
let todayEnd = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate(),
  23,
  59,
  59,
  999
);

const MetricDetails = (props: any) => {

  const classes = useStyles();
  const [dateRange, setDateRange] = useState({ fromDate: '', toDate: '' });
  const [focusTeam, setFocusTeam] = useState<string[]>([ALL]);
  const [focusService, setFocusService] = useState<string[]>([ALL]);
  const [focusSubService, setFocusSubService] = useState<string[]>([ALL]);
  const [focusServiceType, setFocusServiceType] = useState<string[]>([ALL]);
  const [teamList, setTeamList] = useState<ITeamInfo[]>([]);
  const [serviceList, setServiceList] = useState<IServiceInfo[]>([]);
  const [subServiceList, setSubServiceList] = useState<IServiceInfo[]>([]);
  const [serviceTypeList, setServiceTypeList] = useState<Object[]>([]);
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [customDate, setCustomDate] = useState([todayBegin, todayEnd]);
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [teamsFailureMsg, setTeamsListFailureMsg] = useState(false);
  const [metricType, setMetricType] = useState('doraMetrics');
  const [timeline, setTimeline] = useState('one_day');
  const [queryParams, setQueryParams] = useState('')
  const [verticalScroll, setVerticalScroll] = useState(0);

  useEffect(() => {
    getTeams();
    window.scrollTo(0, 0);
    setMetricType(props.metricType);
  }, []);

  useEffect(() => {
    getQueryParams()
  }, [dateRange, focusTeam, focusService, focusSubService, focusServiceType])

  const getQueryParams = () => {
    let params: string = '';
    let joiner = '?';
    if (focusTeam[0] !== ALL) {
      params = `${params}${joiner}teamId=${focusTeam.join()}`;
      joiner = '&';
    }
    if (focusService[0] !== ALL && focusSubService[0] !== ALL) {
      params = `${params}${joiner}service=${joinServiceAndSubService()}`;
      joiner = '&';
    } else if (focusService[0] !== ALL) {
      params = `${params}${joiner}service=${focusService.join()}`;
      joiner = '&';
    } else if (focusSubService[0] !== ALL) {
      params = `${params}${joiner}service=${focusSubService.join()}`;
      joiner = '&';
    }
    if (focusServiceType[0] !== ALL) {
      params = `${params}${joiner}serviceType=${focusServiceType.join()}`;
      joiner = '&';
    }
    if (timeline !== 'one_day') {
      params = `${params}${joiner}fromDate=${dateRange.fromDate}&toDate=${dateRange.toDate}`;
      joiner = '&';
    }
    setQueryParams(params);
  }

  useEffect(() => {
    updateSubServiceList(serviceList);
    setFocusSubService([ALL]);
  }, [focusService]);

  useEffect(() => {
    let tempServiceList = updateServiceList(teamList);
    updateSubServiceList(tempServiceList);
    setFocusService([ALL]);
    setFocusSubService([ALL]);
  }, [focusTeam]);

  useEffect(() => {
    setMetricType(props.metricType);
    window.scrollTo(0, 0);
    switch (props.metricType) {
      case 'build':
        setVerticalScroll(0);
        break;
      case 'requirements':
        setVerticalScroll(870);
        break;
      case 'quality':
        setVerticalScroll(1650);
        break;
      case 'repository':
        setVerticalScroll(436);
        break;
      default:
      // code block
    }
  }, [props.metricType, props.metricSelection]);

  const getTeams = () => {
    Http.get({
      url: `/api/v2/teamlist`,
      state: stateVariable,
    })
      .then((response: any) => {
        const teamListCopy = [...response].filter((a: any) => {
          return a.active === 'true';
        });
        setTeamList(
          teamListCopy.sort((a: any, b: any) => {
            return a.teamName.localeCompare(b.teamName);
          })
        );
        let serviceListCopy = updateServiceList(teamListCopy);
        updateSubServiceList(serviceListCopy);
      })
      .catch((error: any) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          props.history.push('/relogin');
        } else {
          setTeamsListFailureMsg(true);
        }
      });
  };

  const joinServiceAndSubService = (): string => {
    let dataList: string[] = [];
    focusService.forEach((serviceId: string) => {
      let service: any = serviceList.find((elem: any) => elem.id === serviceId);
      if ((service !== undefined) && service.services) {
        service.services.forEach((subService: any) => {
          if (focusSubService.indexOf(subService.id) > -1) {
            dataList.push(`${serviceId}/${subService.id}`);
          }
        });
      } else {
        dataList.push(serviceId);
      }
    });
    return dataList.join();
  };

  const updateServiceList = (tempTeamList: any[]): any[] => {
    let tempServiceList: any[] = [];
    tempTeamList.forEach((team: any) => {
      if ((team.services) && ((focusTeam[0] === ALL) || (focusTeam.indexOf(team.teamId) > -1))) {
        tempServiceList = tempServiceList.concat(team.services);
      }
    });
    setServiceList(tempServiceList);

    return tempServiceList;
  };

  const updateSubServiceList = (tempServiceList: any[]): any[] => {
    let tempSubServiceList: any[] = [];
    tempServiceList.forEach((service: any) => {
      if ((service.services) && ((focusService[0] === ALL) || (focusService.indexOf(service.id) > -1))) {
        tempSubServiceList = tempSubServiceList.concat(service.services);
      }
    });
    setSubServiceList(tempSubServiceList);

    return tempSubServiceList;
  };

  const updateFocusTeam = (event: any) => {
    let selectedTeams: string[] = event.target.value;

    if (selectedTeams.length === 0) {
      selectedTeams.push(ALL);
    } else if (selectedTeams[0] === ALL && selectedTeams.length > 1) {
      selectedTeams.shift();
    }
    setFocusTeam(selectedTeams);
  };

  const updateFocusService = (event: any) => {
    let selectedServices: string[] = event.target.value;

    if (selectedServices.length === 0) {
      selectedServices.push(ALL);
    } else if (selectedServices[0] === ALL && selectedServices.length > 1) {
      selectedServices.shift();
    }
    setFocusService(selectedServices);
  };

  const updateFocusSubService = (event: any) => {
    let selectedSubServices: string[] = event.target.value;

    if (selectedSubServices.length === 0) {
      selectedSubServices.push(ALL);
    } else if (selectedSubServices[0] === ALL && selectedSubServices.length > 1) {
      selectedSubServices.shift();
    }
    setFocusSubService(selectedSubServices);
  };

  const updateFocusServiceType = (event: any) => {
    let selectedServiceType: string[] = event.target.value;
    if (selectedServiceType.length === 0) {
      selectedServiceType.push(ALL);
    } else if (selectedServiceType[0] === ALL && selectedServiceType.length > 1) {
      selectedServiceType.shift();
    }
    setFocusServiceType(selectedServiceType);
  };

  const getDoraMetricsCustomDates = (dateRange: any) => {
    setCustomDate(dateRange);
    setTimeline('custom');
  };

  const updateTimelineData = (timeline: any) => {
    setTimeline(timeline);
    setCustomDate([todayBegin, todayEnd]);
  };

  const renderSelectedTeams = (selected: any, objList: ITeamInfo[]) => {
    return (selected as string[]).map((val: string) => {
      const selObj: ITeamInfo | undefined = objList.find((t: ITeamInfo) => t.teamId === val);
      return selObj ? selObj.teamName : val;
    }).join(', ');
  }

  const renderSelectedServices = (selected: any, objList: IServiceInfo[]) => {
    return (selected as string[]).map((val: string) => {
      const selObj: IServiceInfo | undefined = objList.find((t: IServiceInfo) => t.id === val);
      return selObj ? selObj.name : val;
    }).join(', ');
  }

  const teamServiceSelection = () => {
    return (
      <Grid container spacing={2} className={classes.containerTop}>
        <Grid item xs={12} md={2} lg={2}>
          <InputLabel
            id='team-select-label'
            style={{ color: '#525252', fontSize: '14px' }}
          >
            <Text tid='team' />: &nbsp;
            <Select
              labelId='team-multi-checkbox-label'
              id='team-multi-checkbox'
              multiple
              value={focusTeam}
              onChange={updateFocusTeam}
              input={<Input />}
              renderValue={(selected) => renderSelectedTeams(selected, teamList)}
              MenuProps={MenuProps}
              style={{ width: '70%' }}
            >
              {teamList.map((opt: any, i: number) => {
                return (
                  <MenuItem key={i} value={opt.teamId}>
                    <Checkbox
                      checked={focusTeam.indexOf(opt.teamId) > -1}
                    />
                    <ListItemText primary={opt.teamName} />
                  </MenuItem>
                );
              })}
            </Select>
            {teamsFailureMsg && (
              <span style={{ color: '#f44336' }}>
                <Text tid='errorInLoadingTeamList' />
              </span>
            )}
          </InputLabel>
        </Grid>
        <Grid item xs={12} md={4} lg={4}>
          <InputLabel
            id='service-select-label'
            style={{ color: '#525252', fontSize: '14px' }}
          >
            <Text tid='serviceComponents' />: &nbsp;
            <Select
              labelId='service-multi-checkbox-label'
              id='service-multi-checkbox'
              multiple
              value={focusService}
              onChange={updateFocusService}
              input={<Input />}
              renderValue={(selected) => renderSelectedServices(selected, serviceList)}
              MenuProps={MenuProps}
              style={{ width: '60%' }}
            >
              {serviceList.map((opt: any, i: number) => {
                return (
                  <MenuItem key={i} value={opt.id}>
                    <Checkbox
                      checked={focusService.indexOf(opt.id) > -1}
                    />
                    <ListItemText primary={opt.name} />
                  </MenuItem>
                );
              })}
            </Select>
          </InputLabel>
        </Grid>
        <Grid item xs={12} md={4} lg={4}>
          <InputLabel
            id='subservice-select-label'
            style={{ color: '#525252', fontSize: '14px' }}
          >
            <Text tid='serviceSubComponents' />: &nbsp;
            <Select
              labelId='subservice-multi-checkbox-label'
              id='subservice-multi-checkbox'
              multiple
              value={focusSubService}
              onChange={updateFocusSubService}
              input={<Input />}
              renderValue={(selected) => renderSelectedServices(selected, subServiceList)}
              MenuProps={MenuProps}
              style={{ width: '55%' }}
            >
              {subServiceList.map((opt: any, i: number) => {
                return (
                  <MenuItem key={i} value={opt.id}>
                    <Checkbox
                      checked={focusSubService.indexOf(opt.id) > -1}
                    />
                    <ListItemText primary={opt.name} />
                  </MenuItem>
                );
              })}
            </Select>
          </InputLabel>
        </Grid>
        <Grid item xs={12} md={2} lg={2}>
          <InputLabel
            id='servicetype-select-label'
            style={{ color: '#525252', fontSize: '14px' }}
          >
            Service Type: &nbsp;
            <Select
              labelId='servicetype-multi-checkbox-label'
              id='servicetype-multi-checkbox'
              multiple
              value={focusServiceType}
              onChange={updateFocusServiceType}
              input={<Input />}
              renderValue={(selected) => (selected as string[]).join(', ')}
              MenuProps={MenuProps}
              style={{ width: '50%' }}
            >
              {serviceTypeList.map((opt: any, i: number) => {
                return (
                  <MenuItem key={i} value={opt.id}>
                    <Checkbox
                      checked={focusServiceType.indexOf(opt.id) > -1}
                    />
                    <ListItemText primary={opt.name} />
                  </MenuItem>
                );
              })}
            </Select>
          </InputLabel>
        </Grid>
      </Grid>
    )
  }

  const doraMetricsPage = () => {
    return (
      <Grid container>
        <Grid container className={classes.doraMetricsContainer} spacing={3}>
          <Grid
            item
            xs={12}
            md={6}
            lg={6}
          >
            <Typography variant='h6'>
              <Text tid='doraMetrics' />:
              <div className={classes.toolbar}>
                <DoraMetricsTimeline
                  timeline={timeline}
                  updateTimelineData={(timeline: any) =>
                    updateTimelineData(timeline)
                  }
                  getDoraMetricsCustomDates={(dateRange: any) =>
                    getDoraMetricsCustomDates(dateRange)
                  }
                  customDate={customDate}
                />
              </div>
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} lg={6}></Grid>
          <Grid item xs={12} md={6} lg={6}>
            <Paper
              className={fixedHeightPaper}
              style={{ backgroundColor: '#f1f4ff' }}
            >
              <DeploymentFrequency
                timeline={timeline}
                customDate={customDate}
                queryParams={queryParams}
                getDateRange={(dateRange: any) => setDateRange(dateRange)}
              />
              <InputLabel
                onClick={() => {
                  setMetricType('build');
                  setVerticalScroll(0);
                }}
                className={classes.viewMoreText}
              >
                <Text tid='viewMore' />
              </InputLabel>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <Paper className={fixedHeightPaper}>
              <LeadTime queryParams={queryParams} />
              <InputLabel
                onClick={() => {
                  setMetricType('requirements');
                  setVerticalScroll(870);
                }}
                className={classes.viewMoreText}
              >
                <Text tid='viewMore' />
              </InputLabel>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <Paper className={fixedHeightPaper}>
              <MTTR queryParams={queryParams} />
              <InputLabel
                onClick={() => {
                  setMetricType('quality');
                  setVerticalScroll(1650);
                }}
                className={classes.viewMoreText}
              >
                <Text tid='viewMore' />
              </InputLabel>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <Paper
              className={fixedHeightPaper}
              style={{ backgroundColor: '#f1f4ff' }}
            >
              <ChangeFailureRate queryParams={queryParams} />
              <InputLabel
                onClick={() => {
                  setMetricType('gitRepository');
                  setVerticalScroll(436);
                }}
                className={classes.viewMoreText}
              >
                <Text tid='viewMore' />
              </InputLabel>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  return (
    <Fragment>
      {teamServiceSelection()}
      <Container maxWidth='lg' className={classes.container}>
        {metricType === 'doraMetrics' && props.metricType === 'doraMetrics' ? (
          doraMetricsPage()
        ) : (
          <MetricsList
            focusTeam={focusTeam}
            focusService={focusService}
            focusSubService={focusSubService}
            focusServiceType={focusServiceType}
            joinServiceAndSubService={joinServiceAndSubService}
            verticalScroll={verticalScroll}
          />
        )}
      </Container>
    </Fragment>
  );
};

export default withRouter(MetricDetails);
