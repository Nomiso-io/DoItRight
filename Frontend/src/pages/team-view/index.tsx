// tslint:disable: all

import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Link, Redirect, withRouter } from 'react-router-dom';
import {
  fetchTeamAssessments,
  useActions,
  setAppBarLeftText,
  setAppBarCenterText,
} from '../../actions';
import { Http } from '../../utils';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TableSortLabel,
  Typography,
} from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import 'react-circular-progressbar/dist/styles.css';
import { Loader } from '../../components';
import { ITeamAssessment, IAssessmentListItem } from '../../model';
import Title from '../../components/admin/dashboard/common/title';
import { Text } from '../../common/Language';

export const ALL_TEAMS = 'All';
export const ALL_ASSESSMENTS = 'All';
export const ALL_VERSIONS = 'All';

const useStyles = makeStyles((theme) => ({
  containerRoot: {
    display: 'flex',
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    width: '80%',
    top: '120px',
    paddingBottom: theme.spacing(4),
  },
  formControl: {
    width: '100%',
  },
  label: {
    margin: theme.spacing(15),
  },
  tableHeadCellShort: {
    borderRadius: '0px',
    width: '10%',
  },
  title: {
    paddingBottom: '20px',
    fontSize: '15px',
  },
}));

function ViewTeams(props: any) {
  const classes = useStyles();
  const requestTeamAssessments = useActions(fetchTeamAssessments);
  const teamAssessments = useSelector(
    (state: IRootState) => state.assessment.teamAssessments
  );
  const userRoles = useSelector((state: IRootState) => state.user.roles);
  const setDisplayLeftText = useActions(setAppBarLeftText);
  const setDisplayCenterText = useActions(setAppBarCenterText);
  const [teams, setTeams] = useState<ITeamAssessment[]>([]);
  const [allTeamAssessments, setAllTeamAssessments] = useState<
    ITeamAssessment[]
  >([]);
  const [focusTeam, setFocusTeam] = useState<string>(ALL_TEAMS);
  const [teamList, setTeamList] = useState<Object[]>([]);
  /* Order related changes */
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('assessmentName');
  const [listFailureMsg, setListFailureMsg] = useState(false);
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [questionnaireId, setQuestionnaireId] = useState(ALL_ASSESSMENTS);
  const [assessmentList, setAssessmentList] = useState([{ id: '', name: '' }]);
  const [versionList, setVersionList] = useState([{ id: '', version: '' }]);
  const [questionnaires, setQuestionnaires] = useState<any>([]);
  const [assessmentVersion, setAssessmentVersion] = useState<string>(
    ALL_VERSIONS
  );
  /* Initialization Order related variables ends here */

  useEffect(() => {
    getQuestionnaires();
    getTeams();
    requestTeamAssessments();
    setDisplayLeftText('');
    setDisplayCenterText('');
  }, []);

  const getTeams = () => {
    Http.get({
      url: `/api/v2/teamlist`,
      state: stateVariable,
    })
      .then((response: any) => {
        const teamListCopy = [...response].filter((a: any) => {
          return a.active === 'true';
        });

        /* Doing the sort inside the set function
       this to handle asynchronity of Array.sort()
       Explanation: If the array.sort() will be applied outside
       setTeamList will take the value even when the sort is still running */

        setTeamList(
          teamListCopy.sort((a: any, b: any) => {
            if (a.active === 'true' && b.active === 'true') {
              return a.teamName <= b.teamName ? -1 : 1;
            }
            if (a.active === 'false' && b.active === 'false') {
              return a.teamName <= b.teamName ? -1 : 1;
            }
            return a.active === 'true' ? -1 : 1;
          })
        );
        if (teamListCopy.length === 1) {
          setFocusTeam(teamListCopy[0].teamId);
        }
      })
      .catch((error: any) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          props.history.push('/relogin');
        } else {
          setListFailureMsg(true);
        }
      });
  };

  const getQuestionnaires = () => {
    Http.get({
      url: `/api/v2/assignment?dashboard=true`,
      state: stateVariable,
    })
      .then((response: any) => {
        const filteredQuestionnaires: any = [];
        response.questionnaires.forEach((el: any) => {
          if (response.questionnaireSelected.includes(el.questionnaireId)) {
            filteredQuestionnaires.push(el);
          }
        });
        setQuestionnaires(
          filteredQuestionnaires.sort((a: any, b: any) => {
            return a.displayName.toUpperCase() <= b.displayName.toUpperCase()
              ? -1
              : 1;
          })
        );
      })
      .catch((error) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          props.history.push('/relogin');
        } else {
          setListFailureMsg(true);
          //          props.history.push('/error');
        }
      });
  };

  useEffect(() => {
    if (teamAssessments.status === 'success' && teamAssessments.data !== null) {
      setTeams(teamAssessments.data.teams.sort(compareReverseCronological));
      setAllTeamAssessments(teamAssessments.data.teams.sort(compareReverseCronological));
    }
  }, [teamAssessments]);

  useEffect(() => {
    if (teams) {
      setTeams(teams.sort(compareTeam));
    }
  }, [teams]);

  useEffect(() => {
    const assessments: any[] = [];
    const versions: any[] = [];
    const map = new Map();

    if (questionnaires.length) {
      for (const item of questionnaires) {
        if (!map.has(item.displayName)) {
          map.set(item.displayName, true); // set any value to Map
          assessments.push({
            id: item.questionnaireId,
            name: item.displayName,
          });
        }
      }
    }

    if (assessments) {
      questionnaires.map((item: any) => {
        if (item.displayName === assessments[0].name) {
          versions.push({
            id: item.questionnaireId,
            version: item.version,
          });
        }
      });
    }
    setAssessmentVersion(
      versions.length === 1 ? versions[0].version : ALL_VERSIONS
    );
    setAssessmentList(assessments);
  }, [questionnaires]);

  useEffect(() => {
    const versions: any[] = [];

    if (questionnaireId) {
      questionnaires.map((item: any) => {
        if (item.questionnaireId === questionnaireId) {
          versions.push({
            id: item.questionnaireId,
            version: item.version,
          });
        }
      });
    }

    setVersionList(versions);
    setAssessmentVersion(
      versions.length === 1 ? versions[0].version : ALL_VERSIONS
    );
  }, [questionnaireId]);

  useEffect(() => {
    if (teams !== []) {
      let tempSortedTeamsArray = [...teams];
      if (order === 'asc') {
        if (orderBy === 'level') {
          setTeams(tempSortedTeamsArray.sort(compareLevel));
        }
        if (orderBy === 'assessmentName') {
          setTeams(tempSortedTeamsArray.sort(compareAssessment));
        }
        if (orderBy === 'numberOfAssessments') {
          setTeams(tempSortedTeamsArray.sort(compareNumberOfAssessments));
        }
        if (orderBy === 'team') {
          setTeams(tempSortedTeamsArray.sort(compareTeam));
        }
        if (orderBy === 'percentage') {
          setTeams(tempSortedTeamsArray.sort(comparePercentage));
        }
      }
      if (order === 'desc') {
        if (orderBy === 'level') {
          setTeams(tempSortedTeamsArray.sort(compareLevelD));
        }
        if (orderBy === 'assessmentName') {
          setTeams(tempSortedTeamsArray.sort(compareAssessmentD));
        }
        if (orderBy === 'numberOfAssessments') {
          setTeams(tempSortedTeamsArray.sort(compareNumberOfAssessmentsD));
        }
        if (orderBy === 'team') {
          setTeams(tempSortedTeamsArray.sort(compareTeamD));
        }
        if (orderBy === 'percentage') {
          setTeams(tempSortedTeamsArray.sort(comparePercentageD));
        }
      }
    }
  }, [order, orderBy]);

  const getSelectedList = (event: any) => {
    let selectedTeamAssessment: ITeamAssessment[] = [];

    let selectedItem = event.target.name;
    if (selectedItem === 'assessmentName') {
      let selectedQuestionnaireId = event.target.value;

      setQuestionnaireId(selectedQuestionnaireId);
      allTeamAssessments.map((item: any) => {
        if (item.type === selectedQuestionnaireId) {
          selectedTeamAssessment.push(item);
        }
      });
      if (selectedQuestionnaireId === ALL_ASSESSMENTS) {
        setTeams(allTeamAssessments);
      } else {
        setTeams(selectedTeamAssessment);
        {
          teamList.length !== 1 && setFocusTeam(ALL_TEAMS);
        }
      }
    }
    if (selectedItem === 'assessmentVersion') {
      let selectedAssessmentVersion = event.target.value;
      setAssessmentVersion(selectedAssessmentVersion);
      allTeamAssessments.map((item: any) => {
        if (
          item.type === questionnaireId &&
          item.questionnaireVersion === selectedAssessmentVersion
        ) {
          selectedTeamAssessment.push(item);
        } else if (
          item.type === questionnaireId &&
          selectedAssessmentVersion === ALL_VERSIONS
        ) {
          selectedTeamAssessment.push(item);
        }
      });
      setTeams(selectedTeamAssessment);
    }
    if (selectedItem === 'team') {
      let selectedTeam = event.target.value;
      setFocusTeam(selectedTeam);
      allTeamAssessments.map((item: any) => {
        if (item.teamId === selectedTeam) {
          selectedTeamAssessment.push(item);
        }
      });
      if (selectedTeam === ALL_TEAMS) {
        setTeams(allTeamAssessments);
        setQuestionnaireId(ALL_ASSESSMENTS);
        setAssessmentVersion(ALL_VERSIONS);
      } else {
        setTeams(selectedTeamAssessment);
        setQuestionnaireId(ALL_ASSESSMENTS);
        setAssessmentVersion(ALL_VERSIONS);
      }
    }
  };

  function compareReverseCronological(a: ITeamAssessment, b: ITeamAssessment) {
    if (!a.assessments || a.assessments.length === 0) {
      return -1;
    }
    if (!b.assessments || b.assessments.length === 0) {
      return 1;
    }
    const aDate = a.assessments.map((val: IAssessmentListItem) => val.dateSubmit ? val.dateSubmit : val.date)
      .reduce((maxVal: number, currVal: number) => {
        return (!maxVal || maxVal < currVal) ? currVal : maxVal;
    })

    const bDate = b.assessments.map((val: IAssessmentListItem) => val.dateSubmit ? val.dateSubmit : val.date)
      .reduce((maxVal: number, currVal: number) => {
        return (!maxVal || maxVal < currVal) ? currVal : maxVal;
    })

    return (aDate > bDate) ? -1 : 1 ;
  }

  function compareLevel(a: ITeamAssessment, b: ITeamAssessment) {
    if (a.level < b.level) {
      return -1;
    }
    if (a.level > b.level) {
      return 1;
    }
    return 0;
  }

  function compareNumberOfAssessments(a: ITeamAssessment, b: ITeamAssessment) {
    if (!a.assessments) {
      return -1;
    }
    if (!b.assessments) {
      return 1;
    }
    if (a.assessments.length < b.assessments.length) {
      return -1;
    }
    if (a.assessments.length > b.assessments.length) {
      return 1;
    }
    return 0;
  }

  function compareTeam(a: ITeamAssessment, b: ITeamAssessment) {
    if (a.teamName < b.teamName) {
      return -1;
    }
    if (a.teamName > b.teamName) {
      return 1;
    }
    return 0;
  }

  function compareAssessment(a: ITeamAssessment, b: ITeamAssessment) {
    if (!a.assessmentName) {
      return -1;
    }
    if (!b.assessmentName) {
      return 1;
    }
    if (a.assessmentName < b.assessmentName) {
      return -1;
    }
    if (a.assessmentName > b.assessmentName) {
      return 1;
    }
    if (a.questionnaireVersion < b.questionnaireVersion) {
      return -1;
    }
    if (a.questionnaireVersion > b.questionnaireVersion) {
      return 1;
    }
    return 0;
  }

  function comparePercentage(a: ITeamAssessment, b: ITeamAssessment) {
    if (!a.averageScore) {
      return -1;
    }
    if (!b.averageScore) {
      return 1;
    }
    if (a.averageScore < b.averageScore) {
      return -1;
    }
    if (a.averageScore > b.averageScore) {
      return 1;
    }
    return 0;
  }

  function compareLevelD(a: ITeamAssessment, b: ITeamAssessment) {
    if (a.level < b.level) {
      return 1;
    }
    if (a.level > b.level) {
      return -1;
    }
    return 0;
  }

  function compareNumberOfAssessmentsD(a: ITeamAssessment, b: ITeamAssessment) {
    if (!a.assessments) {
      return 1;
    }
    if (!b.assessments) {
      return -1;
    }
    if (a.assessments.length < b.assessments.length) {
      return 1;
    }
    if (a.assessments.length > b.assessments.length) {
      return -1;
    }
    return 0;
  }

  function compareTeamD(a: ITeamAssessment, b: ITeamAssessment) {
    if (a.teamName < b.teamName) {
      return 1;
    }
    if (a.teamName > b.teamName) {
      return -1;
    }
    return 0;
  }

  function compareAssessmentD(a: ITeamAssessment, b: ITeamAssessment) {
    if (!a.assessmentName) {
      return 1;
    }
    if (!b.assessmentName) {
      return -1;
    }
    if (a.assessmentName < b.assessmentName) {
      return 1;
    }
    if (a.assessmentName > b.assessmentName) {
      return -1;
    }
    if (a.questionnaireVersion < b.questionnaireVersion) {
      return 1;
    }
    if (a.questionnaireVersion > b.questionnaireVersion) {
      return -1;
    }
    return 0;
  }

  function comparePercentageD(a: ITeamAssessment, b: ITeamAssessment) {
    if (!a.averageScore) {
      return 1;
    }
    if (!b.averageScore) {
      return -1;
    }
    if (a.averageScore < b.averageScore) {
      return 1;
    }
    if (a.averageScore > b.averageScore) {
      return -1;
    }
    return 0;
  }

  if (teamAssessments.status === 'start') {
    // setAssessmentHistory(true)
    return (
      <Container
        maxWidth='lg'
        component='div'
        classes={{
          root: classes.containerRoot,
        }}
      >
        <Loader />
      </Container>
    );
  }

  const getLink = (
    teamId: string,
    nameAssessment: string,
    version: string
  ) => {
    return (
      <Link
        to={{
          pathname: `/assessment/teams/${teamId}/${nameAssessment}/${version}`,
          state: { prevPath: props.location.pathname },
        }}
      >
        <Typography>
          <Text tid='viewAssessments' />
        </Typography>
      </Link>
    );
  };

  if (teamAssessments.status === 'fail') {
    let error = JSON.stringify(teamAssessments!.error);
    let object = JSON.parse(error);
    if (object.code) {
      if (object.code === 401) {
        return <Redirect to='/relogin' />;
      }
    }
    return <Redirect to='/error' />;
  }

  const getTeamLevel = (score: number): string => {
    let levelName = '-';
    if (teamAssessments.data) {
      teamAssessments.data.userLevels.forEach((level: any) => {
        if (score >= level.lowerLimit && score <= level.upperLimit) {
          levelName = level.name;
        }
      });
    }
    return levelName;
  };

  const handleRequestSort = (property: string) => {
    if (orderBy === property) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(property);
      setOrder('asc');
    }
  };

  if (teamAssessments.status === 'success' && teamAssessments.data !== null) {
    if (teamAssessments.data.teams.length === 0) {
      if (userRoles && userRoles.includes('Manager')) {
        return (
          <Container
            maxWidth='lg'
            component='div'
            classes={{
              root: classes.containerRoot,
            }}
          >
            <Typography component='h3'>
              <Text tid='noOneInTheTeamHasTakenTheAssessment' />
            </Typography>
          </Container>
        );
      }
      return (
        <Container
          maxWidth='lg'
          component='div'
          classes={{
            root: classes.containerRoot,
          }}
        >
          <Typography component='h3'>
            <Text tid='currentlyNotMappedToTeamAsLead' />
          </Typography>
        </Container>
      );
    }
    return (
      <Container
        maxWidth='lg'
        component='div'
        classes={{
          root: classes.containerRoot,
        }}
      >
        <Grid container spacing={3} className={classes.title}>
          <Grid item xs={4} sm={3} md={3} lg={3}>
            <Title>
              <Text tid='teamAssessments' />:
            </Title>
          </Grid>
          <Grid item xs={4} sm={3} md={3} lg={3}>
            <FormControl className={classes.formControl}>
              <InputLabel id='demo-simple-select-label'>
                <Text tid='chooseAssessment' />
              </InputLabel>
              <Select
                value={questionnaireId}
                name={'assessmentName'}
                onChange={getSelectedList}
              >
                {assessmentList.length > 1 && (
                  <MenuItem value={ALL_ASSESSMENTS}>{ALL_ASSESSMENTS}</MenuItem>
                )}
                {assessmentList &&
                  assessmentList.map((opt: any) => {
                    return (
                      <MenuItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </MenuItem>
                    );
                  })}
              </Select>
              {listFailureMsg && (
                <span style={{ color: '#f44336' }}>
                  <Text tid='errorInLoadingList' />
                </span>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={4} sm={2} md={2} lg={2}>
            <FormControl
              className={classes.formControl}
              disabled={questionnaireId === ALL_ASSESSMENTS}
            >
              <InputLabel id='demo-simple-select-label'>
                {versionList.length <= 1 ||
                questionnaireId === ALL_ASSESSMENTS ? (
                  <Text tid='version' />
                ) : (
                  <Text tid='chooseVersion' />
                )}
              </InputLabel>
              <Select
                value={assessmentVersion}
                name={'assessmentVersion'}
                onChange={getSelectedList}
              >
                {versionList.length > 1 && (
                  <MenuItem value={ALL_VERSIONS}>{ALL_VERSIONS}</MenuItem>
                )}
                {versionList &&
                  versionList.map((opt: any) => {
                    return (
                      <MenuItem
                        key={opt.version}
                        value={opt.version}
                        disabled={versionList.length === 1}
                      >
                        {`v${opt.version}`}
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={1} md={1} lg={1} />
          <Grid item xs={6} sm={3} md={3} lg={3}>
            <FormControl className={classes.formControl}>
              <InputLabel id='demo-simple-select-label'>
                {teamList.length === 1 ? (
                  <Text tid='team' />
                ) : (
                  <Text tid='chooseTeam' />
                )}
              </InputLabel>
              <Select
                value={focusTeam}
                name={'team'}
                onChange={getSelectedList}
              >
                {teamList.length > 1 && (
                  <MenuItem value={ALL_TEAMS}>{ALL_TEAMS}</MenuItem>
                )}
                {teamList.map((opt: any, i: number) => {
                  return (
                    <MenuItem key={i} value={opt.teamId}>
                      {opt.teamName}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Paper style={{ width: '100%' }}>
          <Table className='table'>
            <TableHead className='tableHead'>
              <TableRow>
                <TableCell align='center' className='tableHeadCell'>
                  <TableSortLabel
                    active={orderBy === 'team'}
                    direction={orderBy === 'team' ? order : 'asc'}
                    onClick={() => {
                      handleRequestSort('team');
                    }}
                  >
                    <Typography className='tableHeadText'>
                      <Text tid='teams' />
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell align='center' className='tableHeadCell'>
                  <TableSortLabel
                    active={orderBy === 'assessmentName'}
                    direction={orderBy === 'assessmentName' ? order : 'asc'}
                    onClick={() => {
                      handleRequestSort('assessmentName');
                    }}
                  >
                    <Typography className='tableHeadText'>
                      <Text tid='assessment' />
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align='center'
                  className={classes.tableHeadCellShort}
                >
                  <TableSortLabel
                    active={orderBy === 'numberOfAssessments'}
                    direction={
                      orderBy === 'numberOfAssessments' ? order : 'asc'
                    }
                    onClick={() => {
                      handleRequestSort('numberOfAssessments');
                    }}
                  >
                    <Typography className='tableHeadText'>
                      <Text tid='numberOfAssessments' />
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align='center'
                  className={classes.tableHeadCellShort}
                >
                  <TableSortLabel
                    active={orderBy === 'percentage'}
                    direction={orderBy === 'percentage' ? order : 'asc'}
                    onClick={() => {
                      handleRequestSort('percentage');
                    }}
                  >
                    <Typography className='tableHeadText'>
                      <Text tid='averagePercent' />
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align='center'
                  className={classes.tableHeadCellShort}
                >
                  <Typography className='tableHeadText'>
                    <Text tid='averageLevel' />
                  </Typography>
                </TableCell>
                <TableCell align='center' className='tableHeadCell'>
                  <Typography className='tableHeadText'>
                    <Text tid='linkToAssessments' />
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.length > 0 ? (
                teams.map((row, index) => {
                  return (
                    <TableRow
                      key={index}
                      style={
                        index % 2
                          ? { background: '#EFEFEF' }
                          : { background: 'white' }
                      }
                    >
                      <TableCell align='center' component='th' scope='row'>
                        <Typography className='tableBodyText'>
                          {row.teamName}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography className='tableBodyText'>
                          {`${row.assessmentName} - v${row.questionnaireVersion}`}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography className='tableBodyText'>
                          {row.assessments.length}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography className='tableBodyText'>
                          {`${row.averageScore}%`}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography className='tableBodyText'>
                          {getTeamLevel(row.averageScore)}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        {getLink(
                          row.teamId,
                          row.assessmentName,
                          row.questionnaireVersion
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell align='center' colSpan={6}>
                    <Typography className='tableBodyText'>
                      <Text tid='noOneInTheTeamHasTakenTheAssessment' />
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    );
  }
  return (
    <Container
      maxWidth='lg'
      component='div'
      classes={{
        root: classes.containerRoot,
      }}
    >
      <Loader />
    </Container>
  );
}

export default withRouter(ViewTeams);
