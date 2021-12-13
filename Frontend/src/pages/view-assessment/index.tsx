// tslint:disable: all

import React, { useEffect, useState } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import {
  useActions,
  setSelectedAssessmentType,
  setAppBarLeftText,
  setAppBarCenterText,
  saveUserTeam,
} from '../../actions';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import {
  Container,
  makeStyles,
  MuiThemeProvider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { fetchAssessmentHistory } from '../../actions';
import 'react-circular-progressbar/dist/styles.css';
import { Loader } from '../../components';
import { IAssessmentListItem } from '../../model';
import { default as MaterialLink } from '@material-ui/core/Link';
// import { orderBy } from 'lodash';
import { getDateTime } from '../../utils/data';
import Title from '../../components/admin/dashboard/common/title';
import { tooltipTheme } from '../../common/common';
import { Text } from '../../common/Language';
import '../../css/assessments/style.css';

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
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    overflowX: 'auto',
    border: '18px',
  },
  firstColumn: {
    maxWidth: '200px',
    overflow: 'hidden',
  },
  title: {
    minWidth: '100%',
    fontSize: '15px',
  },
}));

function ViewAssessment(props: any) {
  const classes = useStyles();
  const fetchUserAssessmentHistory = useActions(fetchAssessmentHistory);
  const assessmentHistory = useSelector(
    (state: IRootState) => state.assessment.assessmentHistory
  );
  // const assessmentTypes = useSelector(
  //   (state: IRootState) => state.assessment.assessmentType
  // );
  const setAssessmentType = useActions(setSelectedAssessmentType);
  const setDisplayTextLeft = useActions(setAppBarLeftText);
  const setDisplayTextCenter = useActions(setAppBarCenterText);
  const [assessmentArray, setAssessmentArray] = useState<IAssessmentListItem[]>(
    []
  );
  const setUserTeam = useActions(saveUserTeam);
  /* Order related changes */
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState('date');
  /* Initialization Order related variables ends here */

  useEffect(() => {
    setDisplayTextCenter('');
    setDisplayTextLeft('');
    fetchUserAssessmentHistory();
  }, []);

  useEffect(() => {
    if (assessmentArray !== []) {
      let tempSortedAssessmentArray = [...assessmentArray];
      if (order === 'asc') {
        if (orderBy === 'name') {
          setAssessmentArray(tempSortedAssessmentArray.sort(compareName));
        }
        if (orderBy === 'date') {
          setAssessmentArray(tempSortedAssessmentArray.sort(compareDate));
        }
        if (orderBy === 'team') {
          setAssessmentArray(tempSortedAssessmentArray.sort(compareTeam));
        }
        if (orderBy === 'score') {
          setAssessmentArray(tempSortedAssessmentArray.sort(compareScore));
        }
      }
      if (order === 'desc') {
        if (orderBy === 'name') {
          setAssessmentArray(tempSortedAssessmentArray.sort(compareNameD));
        }
        if (orderBy === 'date') {
          setAssessmentArray(tempSortedAssessmentArray.sort(compareDateD));
        }
        if (orderBy === 'team') {
          setAssessmentArray(tempSortedAssessmentArray.sort(compareTeamD));
        }
        if (orderBy === 'score') {
          setAssessmentArray(tempSortedAssessmentArray.sort(compareScoreD));
        }
      }
    }
  }, [order, orderBy]);

  useEffect(() => {
    if (assessmentHistory.data && assessmentHistory.data.assessments) {
      const tempAssessmentsArray = assessmentHistory.data.assessments;

      const tempAssessmentArray: IAssessmentListItem[] = Object.keys(
        tempAssessmentsArray
      ).reduce((acc: IAssessmentListItem[], id) => {
        return acc.concat(tempAssessmentsArray[id]);
      }, []);

      /* Sorting the array in descending order of the date */
      setAssessmentArray(tempAssessmentArray.sort(compareDateD));
    }
  }, [assessmentHistory.data]);

  function compareName(a: any, b: any) {
    if (a.assessmentName < b.assessmentName) {
      return -1;
    }
    if (a.assessmentName > b.assessmentName) {
      return 1;
    }
    return 0;
  }

  function compareDate(a: any, b: any) {
    if (!a.dateSubmit) {
      if (!b.dateSubmit) {
        return a.date < b.date ? -1 : 1;
      } else {
        return a.date < b.dateSubmit ? -1 : 1;
      }
    }
    if (!b.dateSubmit) {
      if (!a.dateSubmit) {
        return a.date < b.date ? -1 : 1;
      } else {
        return a.dateSubmit < b.date ? -1 : 1;
      }
    }
    if (a.dateSubmit < b.dateSubmit) {
      return -1;
    }
    if (a.dateSubmit > b.dateSubmit) {
      return 1;
    }
    return 0;
  }

  function compareTeam(a: any, b: any) {
    if (a.team < b.team) {
      return -1;
    }
    if (a.team > b.team) {
      return 1;
    }
    return 0;
  }

  function compareScore(a: any, b: any) {
    if (!a.result) {
      return -1;
    }
    if (!b.result) {
      return 1;
    }
    if (a.result!.percentage < b.result!.percentage) {
      return -1;
    }
    if (a.result!.percentage > b.result!.percentage) {
      return 1;
    }
    return 0;
  }

  function compareNameD(a: any, b: any) {
    if (a.assessmentName < b.assessmentName) {
      return 1;
    }
    if (a.assessmentName > b.assessmentName) {
      return -1;
    }
    return 0;
  }

  function compareDateD(a: any, b: any) {
    if (!a.dateSubmit) {
      if (!b.dateSubmit) {
        return a.date < b.date ? 1 : -1;
      } else {
        return a.date < b.dateSubmit ? 1 : -1;
      }
    }
    if (!b.dateSubmit) {
      if (!a.dateSubmit) {
        return a.date < b.date ? 1 : -1;
      } else {
        return a.dateSubmit < b.date ? 1 : -1;
      }
    }
    if (a.dateSubmit < b.dateSubmit) {
      return 1;
    }
    if (a.dateSubmit > b.dateSubmit) {
      return -1;
    }
    return 0;
  }

  function compareTeamD(a: any, b: any) {
    if (a.team < b.team) {
      return 1;
    }
    if (a.team > b.team) {
      return -1;
    }
    return 0;
  }

  function compareScoreD(a: any, b: any) {
    if (!a.result) {
      return 1;
    }
    if (!b.result) {
      return -1;
    }
    if (a.result!.percentage < b.result!.percentage) {
      return 1;
    }
    if (a.result!.percentage > b.result!.percentage) {
      return -1;
    }
    return 0;
  }

  if (assessmentHistory.status === 'start') {
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

  const redirectToContinueAssessment = (
    questionnaireId: string,
    version: string
  ) => {
    setAssessmentType({ questionnaireId, version });
    props.history.push(`/assessment`);
  };

  const getLink = (row: IAssessmentListItem) => {
    return row.result ? (
      <MaterialLink
        href='#'
        onClick={() => {
          setDisplayTextLeft(row.assessmentName);
          setDisplayTextCenter(`Team: ${row.teamName}`);
          setUserTeam(row.teamId);
          props.history.push({
            pathname: `/assessment/detail/${row.assessmentId}`,
            state: { prevPath: props.location.pathname },
          });
        }}
      >
        <Typography>
          <Text tid='viewAssessment' />
        </Typography>
      </MaterialLink>
    ) : (
      <MaterialLink
        href='#'
        onClick={() => {
          setDisplayTextLeft(row.assessmentName);
          setDisplayTextCenter(`Team: ${row.teamName}`);
          setUserTeam(row.teamId);
          redirectToContinueAssessment(row.type, row.questionnaireVersion);
        }}
      >
        <Typography>
          <Text tid='continueAssessment' />
        </Typography>
      </MaterialLink>
    );
  };

  if (assessmentHistory.status === 'fail') {
    let error = JSON.stringify(assessmentHistory!.error);
    let object = JSON.parse(error);
    if (object.code) {
      if (object.code === 401) {
        return <Redirect to='/relogin' />;
      }
    }
    return <Redirect to='/error' />;
  }

  const handleRequestSort = (property: string) => {
    if (orderBy === property) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrder('asc');
      setOrderBy(property);
    }
  };

  if (
    assessmentHistory.status === 'success' &&
    assessmentHistory.data !== null
  ) {
    if (Object.keys(assessmentHistory.data.assessments).length === 0) {
      return (
        <Container
          maxWidth='lg'
          component='div'
          classes={{
            root: classes.containerRoot,
          }}
        >
          <Typography component='h3'>
            <Text tid='notGivenAssessmentYet' />
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
        <div className={classes.title}>
          <Title>
            <Text tid='myAssessments' />:
          </Title>
        </div>
        <Paper className={classes.root}>
          <Table className='table'>
            <TableHead className='tableHead'>
              <TableRow>
                <TableCell className='tableHeadCell'>
                  <TableSortLabel
                    active={orderBy === 'team'}
                    direction={orderBy === 'team' ? order : 'asc'}
                    onClick={() => {
                      handleRequestSort('team');
                    }}
                  >
                    <Typography className='tableHeadText'>
                      <Text tid='team' />
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell align='center' className='tableHeadCell'>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => {
                      handleRequestSort('name');
                    }}
                  >
                    <Typography className='tableHeadText'>
                      <Text tid='assessment' />
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell align='center' className='tableHeadCell'>
                  <TableSortLabel
                    active={orderBy === 'date'}
                    direction={orderBy === 'date' ? order : 'asc'}
                    onClick={() => {
                      handleRequestSort('date');
                    }}
                  >
                    <Typography className='tableHeadText'>
                      <Text tid='dateSubmitted' />
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell align='center' className='tableHeadCell'>
                  <TableSortLabel
                    active={orderBy === 'score'}
                    direction={orderBy === 'score' ? order : 'asc'}
                    onClick={() => {
                      handleRequestSort('score');
                    }}
                  >
                    <Typography className='tableHeadText'>
                      <Text tid='score' />
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell align='center' className='tableHeadCell'>
                  <Typography className='tableHeadText'>
                    <Text tid='level' />
                  </Typography>
                  {/* </TableSortLabel> */}
                </TableCell>
                <TableCell align='center' className='tableHeadCell'>
                  <Typography className='tableHeadText'>
                    <Text tid='linkToAssessment' />
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assessmentArray.map((row: IAssessmentListItem, index: number) => {
                if (!row.hideResult) {
                  return (
                    <TableRow
                      key={row.assessmentId}
                      style={
                        index % 2
                          ? { background: '#EFEFEF' }
                          : { background: 'white' }
                      }
                    >
                      <TableCell
                        component='th'
                        scope='row'
                        className={classes.firstColumn}
                      >
                        <Typography className='tableBodyText'>
                          {row.teamName ? row.teamName : 'NA'}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <MuiThemeProvider theme={tooltipTheme}>
                          <Tooltip
                            title={
                              <Typography className='tooltipTitleStyle'>
                                {row.assessmentName ? row.assessmentName : 'NA'}
                              </Typography>
                            }
                          >
                            <Typography className='tableBodyText'>
                              {row.assessmentName ? row.assessmentName : 'NA'}
                            </Typography>
                          </Tooltip>
                        </MuiThemeProvider>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography className='tableBodyText'>
                          {row.dateSubmit ? getDateTime(row.dateSubmit) : 'NA'}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography className='tableBodyText'>
                          {row.result ? `${row.result!.percentage}%` : 'NA'}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography className='tableBodyText'>
                          {row.result ? row.result!.level : 'NA'}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>{getLink(row)}</TableCell>
                    </TableRow>
                  );
                }
              })}
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

export default withRouter(ViewAssessment);
