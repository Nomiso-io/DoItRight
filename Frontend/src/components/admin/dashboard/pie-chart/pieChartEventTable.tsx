// tslint:disable: all

import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {
  MuiThemeProvider,
  Typography,
  Tooltip,
  TableSortLabel,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
} from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import 'react-circular-progressbar/dist/styles.css';
import { default as MaterialLink } from '@material-ui/core/Link';
import { IAssessmentListItem } from '../../../../model';
// import { IResponseData } from '../common/common';
import { withRouter } from 'react-router-dom';
import AssessmentDetails from '../../../../pages/assessment-detail';
import CloseIcon from '@material-ui/icons/Close';
import { getDateTime } from '../../../../utils/data';
import { tooltipTheme } from '../../../../common/common';
import { Text } from '../../../../common/Language';
import '../../../../css/assessments/style.css';

// interface IProps {
//   responseData: IResponseData;
//   focusTeam: string;
//   levelIndex: number;
// }

interface IAssessmentArrayItem {
  data: IAssessmentListItem;
  team: string;
}

const useStyles = makeStyles((theme) => ({
  scoreContainer: {
    marginTop: '20px',
    width: '300px',
    marginBottom: '40px',
  },
  scoreIndexContainer: {
    width: '100%',
    display: 'flex',
  },
  label: {
    margin: theme.spacing(15),
  },
  userLevelScores: {
    color: '#808080',
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
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

function PieChartEvent(props: any) {
  const classes = useStyles();
  const [assessmentArray, setAssessmentArray] = useState<
    IAssessmentArrayItem[]
  >([]);
  const [sortedAssessmentArray, setSortedAssessmentArray] = useState<
    IAssessmentArrayItem[]
  >([]);
  //    const sortedUserLevels = Object.keys(props.responseData.userLevels);
  const [focusAssessment, setFocusAssessment] = useState('');
  /** Sorting the user levels as they can come in any order */
  //    sortedUserLevels.sort((a: any, b: any) => {
  //        return props.responseData.userLevels[a].lowerLimit > props.responseData.userLevels[b].lowerLimit ? 1 : -1
  //    })
  const sortedUserLevels = props.responseData.userLevels.sort(
    (a: any, b: any) => {
      return a.lowerLimit > b.lowerLimit ? 1 : -1;
    }
  );

  /* Order related changes */
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState('date');
  /* Initialization Order related variables ends here */

  useEffect(() => {
    let tempAssessmentArray: IAssessmentArrayItem[] = [];
    Object.keys(props.responseData.teams).forEach((team: string) => {
      if (props.focusTeam === 'all' || team === props.focusTeam) {
        props.responseData.teams[team].assessments.forEach(
          (assessment: IAssessmentListItem) => {
            if (
              assessment &&
              assessment.result &&
              assessment.result.percentage
            ) {
              //                        if (assessment.result.percentage >= props.responseData.userLevels[sortedUserLevels[props.levelIndex]].lowerLimit &&
              //                            assessment.result.percentage <= props.responseData.userLevels[sortedUserLevels[props.levelIndex]].upperLimit) {
              if (
                assessment.result.percentage >=
                  sortedUserLevels[props.levelIndex].lowerLimit &&
                assessment.result.percentage <=
                  sortedUserLevels[props.levelIndex].upperLimit
              ) {
                let item: IAssessmentArrayItem = {
                  data: assessment,
                  team: team,
                };
                tempAssessmentArray.push(item);
              }
            }
          }
        );
      }
    });
    setAssessmentArray(tempAssessmentArray);
  }, []);

  useEffect(() => {
    if (assessmentArray !== []) {
      let tempSortedAssessmentArray = [...sortedAssessmentArray];
      if (order === 'asc') {
        if (orderBy === 'name') {
          setSortedAssessmentArray(tempSortedAssessmentArray.sort(compareName));
        }
        if (orderBy === 'date') {
          setSortedAssessmentArray(tempSortedAssessmentArray.sort(compareDate));
        }
        if (orderBy === 'team') {
          setSortedAssessmentArray(tempSortedAssessmentArray.sort(compareTeam));
        }
        if (orderBy === 'score') {
          setSortedAssessmentArray(
            tempSortedAssessmentArray.sort(compareScore)
          );
        }
      }
      if (order === 'desc') {
        if (orderBy === 'name') {
          setSortedAssessmentArray(
            tempSortedAssessmentArray.sort(compareNameD)
          );
        }
        if (orderBy === 'date') {
          setSortedAssessmentArray(
            tempSortedAssessmentArray.sort(compareDateD)
          );
        }
        if (orderBy === 'team') {
          setSortedAssessmentArray(
            tempSortedAssessmentArray.sort(compareTeamD)
          );
        }
        if (orderBy === 'score') {
          setSortedAssessmentArray(
            tempSortedAssessmentArray.sort(compareScoreD)
          );
        }
      }
    }
  }, [order, orderBy]);

  function compareName(a: any, b: any) {
    if (a.data.userId < b.data.userId) {
      return -1;
    }
    if (a.data.userId > b.data.userId) {
      return 1;
    }
    return 0;
  }

  function compareDate(a: any, b: any) {
    if (a.data.dateSubmit < b.data.dateSubmit) {
      return -1;
    }
    if (a.data.dateSubmit > b.data.dateSubmit) {
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
    if (a.data.result!.percentage < b.data.result!.percentage) {
      return -1;
    }
    if (a.data.result!.percentage > b.data.result!.percentage) {
      return 1;
    }
    return 0;
  }

  function compareNameD(a: any, b: any) {
    if (a.data.userId < b.data.userId) {
      return 1;
    }
    if (a.data.userId > b.data.userId) {
      return -1;
    }
    return 0;
  }

  function compareDateD(a: any, b: any) {
    if (a.data.dateSubmit < b.data.dateSubmit) {
      return 1;
    }
    if (a.data.dateSubmit > b.data.dateSubmit) {
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
    if (a.data.result!.percentage < b.data.result!.percentage) {
      return 1;
    }
    if (a.data.result!.percentage > b.data.result!.percentage) {
      return -1;
    }
    return 0;
  }

  useEffect(() => {
    if (assessmentArray !== []) {
      let tempSortedAssessmentArray = assessmentArray;
      tempSortedAssessmentArray.sort(compareDateD);
      setSortedAssessmentArray(tempSortedAssessmentArray);
    }
  }, [assessmentArray]);

  const handleRequestSort = (property: string) => {
    if (orderBy === property) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrder('asc');
      setOrderBy(property);
    }
  };

  const handleViewAssessment = (assessmentId: string) => {
    setFocusAssessment(assessmentId);
  };

  const handleClose = () => {
    setFocusAssessment('');
  };

  return (
    <Container maxWidth='md' component='div' className='containerRoot'>
      <Paper className={classes.root}>
        <Table className='table'>
          <TableHead className='tableHead'>
            <TableRow>
              <TableCell className='tableHeadCell'>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => {
                    handleRequestSort('name');
                  }}
                >
                  <Typography className='tableHeadText'>
                    <Text tid='takenBy' />
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
              </TableCell>
              <TableCell align='center' className='tableHeadCell'>
                <Typography className='tableHeadText'>
                  <Text tid='action' />
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAssessmentArray.map((row, index) => (
              <TableRow
                key={index}
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
                  <MuiThemeProvider theme={tooltipTheme}>
                    <Tooltip
                      title={
                        <Typography className='tooltipTitleStyle'>
                          {row.data.userId ? row.data.userId : 'NA'}
                        </Typography>
                      }
                    >
                      <Typography className='tableBodyText'>
                        {row.data.userId ? row.data.userId : 'NA'}
                      </Typography>
                    </Tooltip>
                  </MuiThemeProvider>
                </TableCell>
                <TableCell align='center'>
                  <Typography className='tableBodyText'>
                    {row.data.dateSubmit
                      ? getDateTime(row.data.dateSubmit)
                      : row.data.date
                      ? getDateTime(row.data.date)
                      : '-'}
                  </Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography className='tableBodyText'>{row.team}</Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography className='tableBodyText'>
                    {row.data.result ? `${row.data.result!.percentage}%` : 'NA'}
                  </Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography className='tableBodyText'>
                    {row.data.result ? row.data.result!.level : 'NA'}
                  </Typography>
                </TableCell>
                <TableCell align='center'>
                  <MaterialLink
                    href='#'
                    onClick={() => {
                      handleViewAssessment(row.data.assessmentId);
                    }}
                  >
                    <Text tid='viewAssessment' />
                  </MaterialLink>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      {focusAssessment !== '' && (
        <Dialog
          fullScreen
          open={focusAssessment !== ''}
          onClose={handleClose} /* TransitionComponent={Transition} */
        >
          <AppBar className={classes.appBar}>
            <Toolbar>
              <IconButton
                edge='start'
                color='inherit'
                onClick={handleClose}
                aria-label='close'
              >
                <CloseIcon />
              </IconButton>
              <Typography variant='h6' className={classes.title}>
                <Text tid='assessment' />
              </Typography>
            </Toolbar>
          </AppBar>
          <AssessmentDetails assessmentId={focusAssessment} />
        </Dialog>
      )}
    </Container>
  );
}

export default withRouter(PieChartEvent);
