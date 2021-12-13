import React, { useEffect, useState, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import {
  makeStyles,
  Grid,
  Paper,
  InputLabel,
  Typography,
  Checkbox,
  TextField,
} from '@material-ui/core';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../reducers';
import {
  BuildChart,
  BuildTable,
  BuildsTimeline,
} from '../../../../components/metrics/builds';
import {
  PullRequestChart,
  DelayChart,
  RepositoryTable,
  ReposTimeline,
} from '../../../../components/metrics/repository';
import {
  ReqStatusChart,
  LeadAndCycleTimeChart,
  RequirementsTable,
  RequirementsTimeline,
} from '../../../../components/metrics/requirements';
import {
  QualityTimeline,
  QualityReport,
  QualityTable,
} from '../../../../components/metrics/quality';
import { Http } from '../../../../utils';
// import { IRepoDataItemLists } from '../../../../model/metrics/repositoryData';
// import { IReqDataItemLists } from '../../../../model/metrics/requirementsData';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { ALL } from '../index';
import { Text } from '../../../../common/Language';
import '../../../../css/metrics/style.css';

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />;
const checkedIcon = <CheckBoxIcon fontSize='small' />;

const useStyles = makeStyles((theme) => ({
  // container: {
  //   paddingTop: theme.spacing(2),
  //   paddingBottom: theme.spacing(2),
  //   position: 'relative',
  //   top: '70px',
  // },
  container_1_Style: {
    border: '1px solid #c1c1c1',
    marginTop: '40px',
    paddingTop: '10px',
    paddingBottom: '10px',
    borderRadius: '5px',
    boxShadow: '0px 0px 2px #a2a2a2',
    backgroundColor: '#f1f4ff',
  },
  container_2_Style: {
    border: '1px solid #c1c1c1',
    marginTop: '40px',
    paddingTop: '10px',
    paddingBottom: '10px',
    borderRadius: '5px',
    boxShadow: '0px 0px 2px #a2a2a2',
    backgroundColor: '#e0e0e0',
  },
  container_3_Style: {
    border: '1px solid #c1c1c1',
    marginTop: '20px',
    paddingTop: '10px',
    paddingBottom: '10px',
    borderRadius: '5px',
    boxShadow: '0px 0px 2px #a2a2a2',
    backgroundColor: '#e0e0e0',
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    paddingBottom: 0,
  },
  fixedHeight: {
    height: 315,
  },
  toolbar: {
    fontSize: '12px !important',
    fontWeight: 'bold',
    display: 'initial',
  },
  selectNameBox: {
    color: '#525252',
    fontSize: '14px',
  },
  loadingErrorLabel: {
    color: '#f44336',
    paddingTop: '5px',
  },
  margin_top_10: {
    marginTop: '10px',
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

const MetricsList = (props: any) => {
  const classes = useStyles();
  const [committerName, setCommitterName] = useState<string[]>([ALL]);
  const [itemType, setItemType] = useState<string[]>([ALL]);
  const [itemPriority, setItemPriority] = useState<string[]>([ALL]);
  const [buildStatus, setBuildStatus] = useState({ status: 0 }); // using bitwise operator for 3 bits, all set to 1s.
  const [buildsDateRange, setBuildsDateRange] = useState({});
  const [reposDateRange, setReposDateRange] = useState({
    fromDate: 0,
    toDate: 0,
  });
  const [requirementsDateRange, setRequirementsDateRange] = useState({
    fromDate: 0,
    toDate: 0,
  });
  const [qualityDateRange, setqualityDateRange] = useState({});
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [buildsCustomDate, setBuildsCustomDate] = useState([
    todayBegin,
    todayEnd,
  ]);
  const [reposCustomDate, setReposCustomDate] = useState([
    todayBegin,
    todayEnd,
  ]);
  const [requirementsCustomDate, setRequirementsCustomDate] = useState([
    todayBegin,
    todayEnd,
  ]);
  const [qualityCustomDate, setQualityCustomDate] = useState([
    todayBegin,
    todayEnd,
  ]);
  const [buildsTimeline, setBuildsTimeline] = useState('one_day');
  const [reposTimeline, setReposTimeline] = useState('one_day');
  const [requirementsTimeline, setRequirementsTimeline] = useState('one_day');
  const [qualityTimeline, setQualityTimeline] = useState('one_day');
  const [committersList, setCommittersList] = useState<string[]>([]);
  const [committersListFailureMsg, setCommittersListFailureMsg] = useState(false);
  //  const [reqItemData, setReqItemData] = useState<IReqDataItem[]>([]);
  const [itemTypesList, setItemTypesList] = useState<string[]>([]);
  const [itemPrioritiesList, setItemPrioritiesList] = useState<string[]>([]);
  const [itemListFailureMsg, setItemListFailureMsg] = useState(false);

  // useEffect(() => {
  //   //    getRequirementItemTypePriority();
  // }, [props.focusTeam, itemType, itemPriority, requirementsDateRange]);

  useEffect(() => {
    window.scrollTo(0, props.verticalScroll);
  }, [props.verticalScroll]);

  useEffect(() => {
    getCommittersList();
    getRequirementItemTypePriority();
  }, []);

  /*  useEffect(() => {
    let itemType = [];
    let itemPriority = [];
    if (reqItemData.length) {
      for (let item of reqItemData[0].itemType) {
        itemType.push({
          type: item,
        });
      }
      for (let item of reqItemData[0].itemPriority) {
        itemPriority.push({
          priority: item,
        });
      }
    }
    setItemTypeList(
      itemType.sort((a: any, b: any) => {
        if(! a.type) {
          return -1;
        }
        if(! b.type) {
          return 1;
        }
        return a.type.localeCompare(b.type);
      })
    );
    setItemPriorityList(
      itemPriority.sort((a: any, b: any) => {
        if(! a.priority) {
          return -1;
        }
        if(! b.priority) {
          return 1;
        }
        return a.priority - b.priority;
      })
    );
  }, [reqItemData]);
*/
  const handleLegendClick = (seriesIndex: any) => {
    const temp = { ...buildStatus };
    if (seriesIndex === 0) {
      //toggle the first bit for pass builds status
      temp.status = temp.status ^ 1;
    }
    if (seriesIndex === 1) {
      //toggle the second bit for fail builds status
      temp.status = temp.status ^ 2;
    }
    if (seriesIndex === 2) {
      //toggle the third bit for in-progress builds status
      temp.status = temp.status ^ 4;
    }
    setBuildStatus(temp);
  };

  const getCommittersList = () => {
    let url: string = '/api/metrics/repos/committersList';

    Http.get({
      url,
      state: stateVariable,
    })
      .then((response: any) => {
        setCommittersList(
          response.committerName.sort((a: string, b: string) => {
            return a.localeCompare(b);
          })
        );
      })
      .catch((error) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          props.history.push('/relogin');
        } else {
          setCommittersListFailureMsg(true);
        }
      });
  };

  const getRequirementItemTypePriority = () => {
    let url: string = '/api/metrics/reqs/itip';

    Http.get({
      url,
      state: stateVariable,
    })
      .then((response: any) => {
        //        setReqItemData(response);
        setItemTypesList(
          response.itemType.sort((a: string, b: string) => {
            return a.localeCompare(b);
          })
        );
        setItemPrioritiesList(
          response.itemPriority.sort((a: string, b: string) => {
            return a.localeCompare(b);
          })
        );
      })
      .catch((error) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          props.history.push('/relogin');
        } else {
          setItemListFailureMsg(true);
        }
      });
  };

  const getCommitterName = (event: any, values: any) => {
    /*    let names = values.map((value: any) => {
      return value.committerName;
    });
    if (names.length === 0) {
      names.push('All');
      setCommitterName(names);
    } else if (names[0] === 'All' && names.length > 1) {
      names.shift();
      setCommitterName(names);
    } else {
      setCommitterName(names);
    }
  */
    if (values.length === 0) {
      values.push('All');
      setCommitterName(values);
    } else if (values[0] === 'All' && values.length > 1) {
      values.shift();
      setCommitterName(values);
    } else {
      setCommitterName(values);
    }
  };

  const getItemType = (event: any, values: any) => {
    /*    let types = values.map((item: any) => {
      return item.type;
    });
    if (types.length === 0) {
      types.push('All');
      setItemType(types);
    } else if (types[0] === 'All' && types.length > 1) {
      types.shift();
      setItemType(types);
    } else {
      setItemType(types);
    }
  */
    if (values.length === 0) {
      values.push('All');
      setItemType(values);
    } else if (values[0] === 'All' && values.length > 1) {
      values.shift();
      setItemType(values);
    } else {
      setItemType(values);
    }
  };

  const getItemPriority = (event: any, values: any) => {
    /*    let priority = values.map((item: any) => {
      return item.priority;
    });
    if (priority.length === 0) {
      priority.push('All');
      setItemPriority(priority);
    } else if (priority[0] === 'All' && priority.length > 1) {
      priority.shift();
      setItemPriority(priority);
    } else {
      setItemPriority(priority);
    }
*/
    if (values.length === 0) {
      values.push('All');
      setItemPriority(values);
    } else if (values[0] === 'All' && values.length > 1) {
      values.shift();
      setItemPriority(values);
    } else {
      setItemPriority(values);
    }
  };

  const getBuildsCustomDates = (dateRange: any) => {
    setBuildsCustomDate(dateRange);
    setBuildsTimeline('custom');
  };

  const getReposCustomDates = (dateRange: any) => {
    setReposCustomDate(dateRange);
    setReposTimeline('custom');
  };

  const getRequirementsCustomDates = (dateRange: any) => {
    setRequirementsCustomDate(dateRange);
    setRequirementsTimeline('custom');
  };

  const getQualityCustomDates = (dateRange: any) => {
    setQualityCustomDate(dateRange);
    setQualityTimeline('custom');
  };

  const updateBuildsData = (buildsTimeline: any) => {
    setBuildsTimeline(buildsTimeline);
    setBuildsCustomDate([todayBegin, todayEnd]);
  };

  const updateReposData = (reposTimeline: any) => {
    setReposTimeline(reposTimeline);
    setReposCustomDate([todayBegin, todayEnd]);
  };

  const updateRequirementsData = (requirementsTimeline: any) => {
    setRequirementsTimeline(requirementsTimeline);
    setRequirementsCustomDate([todayBegin, todayEnd]);
  };

  const updateQualityData = (qualityTimeline: any) => {
    setQualityTimeline(qualityTimeline);
    setQualityCustomDate([todayBegin, todayEnd]);
  };

  return (
    <Grid container spacing={1}>
      <Grid container className={classes.container_3_Style} spacing={2}>
        <Grid
          item
          xs={12}
          md={6}
          lg={6}
        >
          <Typography variant='h6'>
            <Text tid='buildCICD' />:
            <div className={classes.toolbar}>
              <BuildsTimeline
                buildsTimeline={buildsTimeline}
                //                buildsCustomDate={buildsCustomDate}
                updateBuildsData={(buildsTimeline: any) =>
                  updateBuildsData(buildsTimeline)
                }
                getBuildsCustomDates={(dateRange: any) =>
                  getBuildsCustomDates(dateRange)
                }
              />
            </div>
          </Typography>
        </Grid>
        <Grid item xs={12} md={6} lg={6}></Grid>
        <Grid item xs={12} md={5} lg={5}>
          <Paper className={fixedHeightPaper}>
            <BuildChart
              focusTeam={props.focusTeam}
              focusService={props.focusService}
              //              serviceAndSubService={props.serviceAndSubService}
              focusSubService={props.focusSubService}
              focusServiceType={props.focusServiceType}
              joinServiceAndSubService={props.joinServiceAndSubService}
              getBuildsDateRange={(dateRange: any) =>
                setBuildsDateRange(dateRange)
              }
              customDate={buildsCustomDate}
              handleLegendClick={(seriesIndex: any) =>
                handleLegendClick(seriesIndex)
              }
              timeline={buildsTimeline}
              selectedDateRange={buildsDateRange}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={7} lg={7}>
          <Paper className={fixedHeightPaper}>
            <BuildTable
              focusTeam={props.focusTeam}
              focusService={props.focusService}
              //              serviceAndSubService={props.serviceAndSubService}
              focusSubService={props.focusSubService}
              focusServiceType={props.focusServiceType}
              joinServiceAndSubService={props.joinServiceAndSubService}
              buildStatus={buildStatus}
              timeline={buildsTimeline}
              selectedDateRange={buildsDateRange}
            />
          </Paper>
        </Grid>
      </Grid>

      <Grid container className={classes.container_1_Style} spacing={2}>
        <Grid
          item
          xs={12}
          md={6}
          lg={6}
        >
          <Typography variant='h6'>
            <Text tid='gitRepository' />:
            <div className={classes.toolbar}>
              <ReposTimeline
                reposTimeline={reposTimeline}
                //                reposCustomDate={reposCustomDate}
                updateReposData={(reposTimeline: any) =>
                  updateReposData(reposTimeline)
                }
                getReposCustomDates={(dateRange: any) =>
                  getReposCustomDates(dateRange)
                }
              />
            </div>
          </Typography>
        </Grid>
        <Grid item xs={12} md={2} lg={2} className={classes.margin_top_10}>
          <InputLabel className={classes.selectNameBox}>
            <Text tid='filterByCommitter' />
          </InputLabel>
        </Grid>
        <Grid item xs={12} md={3} lg={3}>
          <Autocomplete
            multiple
            id='checkboxes-filterByCommitter'
            limitTags={1}
            options={committersList}
            disableCloseOnSelect
            getOptionLabel={(option) => option}
            onChange={getCommitterName}
            renderOption={(option, { selected }) => (
              <Fragment>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option}
              </Fragment>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                variant='outlined'
                placeholder='Select Committers'
              />
            )}
          />
          {committersListFailureMsg && (
            <InputLabel className={classes.loadingErrorLabel}>
              <Text tid='errorInLoadingList' />
            </InputLabel>
          )}
        </Grid>

        <Grid item xs={12} md={3} lg={3}>
          <Paper className={fixedHeightPaper} style={{ overflowX: 'hidden' }}>
            <PullRequestChart
              focusTeam={props.focusTeam}
              focusService={props.focusService}
              //              serviceAndSubService={props.serviceAndSubService}
              focusSubService={props.focusSubService}
              focusServiceType={props.focusServiceType}
              joinServiceAndSubService={props.joinServiceAndSubService}
              committerName={committerName}
              customDate={reposCustomDate}
              timeline={reposTimeline}
              getReposDateRange={(dateRange: any) =>
                setReposDateRange(dateRange)
              }
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={3} lg={3}>
          <Paper className={fixedHeightPaper}>
            <DelayChart
              focusTeam={props.focusTeam}
              focusService={props.focusService}
              //              serviceAndSubService={props.serviceAndSubService}
              focusSubService={props.focusSubService}
              focusServiceType={props.focusServiceType}
              joinServiceAndSubService={props.joinServiceAndSubService}
              committerName={committerName}
              timeline={reposTimeline}
              selectedDateRange={reposDateRange}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Paper className={fixedHeightPaper}>
            <RepositoryTable
              focusTeam={props.focusTeam}
              focusService={props.focusService}
              //              serviceAndSubService={props.serviceAndSubService}
              focusSubService={props.focusSubService}
              focusServiceType={props.focusServiceType}
              joinServiceAndSubService={props.joinServiceAndSubService}
              committerName={committerName}
              timeline={reposTimeline}
              selectedDateRange={reposDateRange}
            />
          </Paper>
        </Grid>
      </Grid>

      <Grid container className={classes.container_2_Style} spacing={2}>
        <Grid
          item
          xs={12}
          md={6}
          lg={6}
        >
          <Typography variant='h6'>
            <Text tid='requirements' />:
            <div className={classes.toolbar}>
              <RequirementsTimeline
                requirementsTimeline={requirementsTimeline}
                //                requirementsCustomDate={requirementsCustomDate}
                updateRequirementsData={(requirementsTimeline: any) =>
                  updateRequirementsData(requirementsTimeline)
                }
                getRequirementsCustomDates={(dateRange: any) =>
                  getRequirementsCustomDates(dateRange)
                }
              />
            </div>
          </Typography>
        </Grid>
        <Grid item xs={6} md={1} lg={1} className={classes.margin_top_10}>
          <InputLabel className={classes.selectNameBox}>
            <Text tid='itemType' />:
          </InputLabel>
        </Grid>
        <Grid item xs={6} md={2} lg={2}>
          <Autocomplete
            multiple
            id='checkboxes-itemType'
            limitTags={1}
            options={itemTypesList}
            disableCloseOnSelect
            getOptionLabel={(option) => option}
            onChange={getItemType}
            renderOption={(option, { selected }) => (
              <Fragment>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option}
              </Fragment>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                variant='outlined'
                placeholder='Select Type'
              />
            )}
          />
          {itemListFailureMsg && (
            <InputLabel className={classes.loadingErrorLabel}>
              <Text tid='errorInLoadingList' />
            </InputLabel>
          )}
        </Grid>
        <Grid item xs={6} md={1} lg={1} className={classes.margin_top_10}>
          <InputLabel className={classes.selectNameBox}>
            <Text tid='itemPriority' />:
          </InputLabel>
        </Grid>
        <Grid item xs={6} md={2} lg={2}>
          <Autocomplete
            multiple
            id='checkboxes-itemPriority'
            limitTags={1}
            options={itemPrioritiesList}
            disableCloseOnSelect
            getOptionLabel={(option) => option}
            onChange={getItemPriority}
            renderOption={(option, { selected }) => (
              <Fragment>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option}
              </Fragment>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                variant='outlined'
                placeholder='Select Priority'
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={6}>
          <Paper className={fixedHeightPaper} style={{ overflowX: 'hidden' }}>
            <ReqStatusChart
              focusTeam={props.focusTeam}
              focusService={props.focusService}
              //              serviceAndSubService={props.serviceAndSubService}
              focusSubService={props.focusSubService}
              focusServiceType={props.focusServiceType}
              joinServiceAndSubService={props.joinServiceAndSubService}
              itemType={itemType}
              itemPriority={itemPriority}
              customDate={requirementsCustomDate}
              getRequirementsDateRange={(dateRange: any) =>
                setRequirementsDateRange(dateRange)
              }
              timeline={requirementsTimeline}
              selectedDateRange={requirementsDateRange}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Paper className={fixedHeightPaper}>
            <LeadAndCycleTimeChart
              focusTeam={props.focusTeam}
              focusService={props.focusService}
              //              serviceAndSubService={props.serviceAndSubService}
              focusSubService={props.focusSubService}
              focusServiceType={props.focusServiceType}
              joinServiceAndSubService={props.joinServiceAndSubService}
              itemType={itemType}
              itemPriority={itemPriority}
              timeline={requirementsTimeline}
              selectedDateRange={requirementsDateRange}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={fixedHeightPaper}>
            <RequirementsTable
              focusTeam={props.focusTeam}
              focusService={props.focusService}
              //              serviceAndSubService={props.serviceAndSubService}
              focusSubService={props.focusSubService}
              focusServiceType={props.focusServiceType}
              joinServiceAndSubService={props.joinServiceAndSubService}
              itemType={itemType}
              itemPriority={itemPriority}
              timeline={requirementsTimeline}
              selectedDateRange={requirementsDateRange}
            />
          </Paper>
        </Grid>
      </Grid>

      <Grid container className={classes.container_1_Style} spacing={2}>
        <Grid
          item
          xs={12}
          md={6}
          lg={6}
        >
          <Typography variant='h6'>
            <Text tid='quality' />:
            <div className={classes.toolbar}>
              <QualityTimeline
                qualityTimeline={qualityTimeline}
                //                qualityCustomDate={qualityCustomDate}
                updateQualityData={(qualityTimeline: any) =>
                  updateQualityData(qualityTimeline)
                }
                getQualityCustomDates={(dateRange: any) =>
                  getQualityCustomDates(dateRange)
                }
              />
            </div>
          </Typography>
        </Grid>
        <Grid item xs={12} md={6} lg={6} style={{ marginTop: '40px' }}></Grid>

        <Grid item xs={6} md={6} lg={6}>
          <Paper className={fixedHeightPaper} style={{ overflowX: 'hidden' }}>
            <QualityReport
              focusTeam={props.focusTeam}
              focusService={props.focusService}
              //              serviceAndSubService={props.serviceAndSubService}
              focusSubService={props.focusSubService}
              focusServiceType={props.focusServiceType}
              joinServiceAndSubService={props.joinServiceAndSubService}
              customDate={qualityCustomDate}
              getQualityDateRange={(dateRange: any) =>
                setqualityDateRange(dateRange)
              }
              timeline={qualityTimeline}
              selectedDateRange={qualityDateRange}
            />
          </Paper>
        </Grid>
        <Grid item xs={6} md={6} lg={6}>
          <Paper className={fixedHeightPaper}>
            <QualityTable
              focusTeam={props.focusTeam}
              focusService={props.focusService}
              //              serviceAndSubService={props.serviceAndSubService}
              focusSubService={props.focusSubService}
              focusServiceType={props.focusServiceType}
              joinServiceAndSubService={props.joinServiceAndSubService}
              timeline={qualityTimeline}
              selectedDateRange={qualityDateRange}
            />
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default withRouter(MetricsList);
