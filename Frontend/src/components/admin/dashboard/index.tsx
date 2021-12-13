import React, { useEffect, useState, Fragment } from 'react';
import clsx from 'clsx';
import {
  Container,
  Grid,
  Paper,
  makeStyles,
  MuiThemeProvider,
  Typography,
  Link,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
} from '@material-ui/core';
import Title from './common/title';
import { PieChart, IPieDisplayData } from './pie-chart/pie';
import { BarChart, IBarDisplayData } from './category-bar-chart/bar';
import {
  useActions,
  setAppBarCenterText,
  setAppBarLeftText,
} from '../../../actions';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../reducers';
import { Http } from '../../../utils';
import { withRouter } from 'react-router-dom';
import { months, hexColors } from './common/common';
import { Loader } from '../..';
import { HorizontalBarChart } from './questions-chart/horizontal_bar_graph';
import PieChartEvent from './pie-chart/pieChartEventTable';
import CategoryBarChartEvent from './category-bar-chart/categoryBarChartEventTable';
import { buttonStyle, tooltipTheme } from '../../../common/common';
import QuestionChartEvent from './questions-chart/questionChartEventTable';
import Scroll from 'react-scroll';
import CSVicon from '../../../logo/iconcsv.png';
import InfoIcon from '@material-ui/icons/Info';
import ResultsTable, { IResultsTable } from './results-table/resultsTable';
import { processBarGraphData } from './category-bar-chart/processBarGraphData';
import { processPieChartData } from './pie-chart/processPieChartData';
import { processAverageScore } from './common/manipulate_data';
import { processResultsTableData } from './results-table/processResultsTableData';
import { processQuestionReportData } from './questions-chart/processQuestionReportData';
import { HtmlTooltip } from '../../common/htmlTooltip';
import { Text } from '../../../common/Language';
import '../../../css/assessments/style.css';

const scroll = Scroll.animateScroll;

export interface IAverageScore {
  average: number;
  total: number;
}

export interface IQuestionIdentifier {
  id: string;
  version: number;
}

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    position: 'relative',
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  scorePaper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    alignItems: 'center',
  },
  fixedHeight: {
    minHeight: '100%',
  },
  depositContext: {
    flex: 1,
  },
  formControl: {
    minWidth: '80%',
  },
  questionFormControl: {
    maxWidth: '50%',
  },
  title: {
    paddingBottom: '20px',
    display: 'flex',
  },
  messagePage: {
    marginTop: '20%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  colorReviewBox: {
    width: '10px',
    height: '10px',
    margin: '6px',
  },
  backButton: {
    position: 'relative',
    marginTop: '20px',
    marginBottom: '10px',
    ...buttonStyle,
  },
  flexCenterAlignContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  infoIconStyle: {
    margin: '3px 6px',
    float: 'right',
    cursor: 'pointer',
  },
}));

const Dashboard = (props: any) => {
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.scorePaper, classes.fixedHeight);
  const [barChartData, setBarChartData] = useState<IBarDisplayData | null>();
  const [
    questionReportData,
    setQuestionReportData,
  ] = useState<IBarDisplayData | null>();
  const [pieChartData, setPieChartData] = useState<IPieDisplayData | null>();
  const [averageScore, setAverageScore] = useState<IAverageScore | null>();
  const [
    resultsTableData,
    setResultsTableData,
  ] = useState<IResultsTable | null>();
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [questionnairesFetch, setQuestionnairesFetch] = useState(false);
  const [
    assessmentReportsFetched,
    setAssessmentReportsFetched,
  ] = React.useState(false);
  const [assessmentReports, setAssessmentReports] = useState<any | null>(null);
  const [assessmentTypeAndVersion, setAssessmentTypeAndVersion] = useState('');
  const [questionnaires, setQuestionnaires] = useState<any>(null);
  const userDetails = useSelector((state: IRootState) => {
    return state.user;
  });
  const [teamList, setTeamList] = useState<Object[]>([]);
  const [mappedTeams, setMappedTeams] = useState<string[]>([]);
  const [focusTeam, setFocusTeam] = useState('all');
  const [focusQuestion, setFocusQuestion] = useState<IQuestionIdentifier>({
    id: '',
    version: 0,
  });
  const [questionList, setQuestionList] = useState<any>(null);
  const [pieChartEventClicked, setPieChartEventClicked] = useState(false);
  const [
    categoryBarChartEventClicked,
    setCategoryBarChartEventClicked,
  ] = useState(false);
  const [questionChartEventClicked, setQuestionChartEventClicked] = useState(
    false
  );
  const [pieLevelIndex, setPieLevelIndex] = useState(0);
  const [barChartCategory, setBarChartCategory] = useState('');
  const [questionChartAnswerIndex, setQuestionChartAnswerIndex] = useState(0);
  const date = new Date();
  const setDisplayTextCenter = useActions(setAppBarCenterText);
  const setDisplayTextLeft = useActions(setAppBarLeftText);
  const dashboardTypeFromProps = props.location.state
    ? props.location.state.type
      ? props.location.state.type
      : ''
    : '';
  const bestPerformingTooltipText =
    'These are the questions where the teams have performed well. The goal should be to continue to excel in these areas.';
  const areasNeedingFocusTooltipText =
    'These are the questions where teams have scored low scores. These areas need focused attention to increase maturity.';

  useEffect(() => {
    getQuestionnaires();
    getTeams();
    setDisplayTextCenter('');
    setDisplayTextLeft('');
  }, []);

  useEffect(() => {}, [dashboardTypeFromProps]);

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
      })
      .catch((error: any) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          props.history.push('/relogin');
        }
      });
  };

  const getQuestionnaires = () => {
    Http.get({
      //      url: `/api/v2/assignment?teamId=${userDetails.team}&dashboard=true`,
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
        setQuestionnairesFetch(true);
        setQuestionnaires(filteredQuestionnaires);
      })
      .catch((error) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          props.history.push('/relogin');
        } else {
          props.history.push('/error');
        }
      });
  };

  useEffect(() => {
    if (questionnaires && questionnaires.length > 0) {
      let type: string;
      let version: string;
      if (assessmentTypeAndVersion === '') {
        type = questionnaires[0].questionnaireId;
        version = questionnaires[0].version;
      } else {
        const assessmentTypeAndVersionSplitArray = assessmentTypeAndVersion.split(
          '+'
        );
        type = assessmentTypeAndVersionSplitArray[0];
        version = assessmentTypeAndVersionSplitArray[1];
      }
      Http.get({
        url: `/api/v2/assessment/history?type=team&questionnaireId=${type}&questionnaireVersion=${version}`,
        state: stateVariable,
      })
        .then((response: any) => {
          setAssessmentReportsFetched(true);
          setAssessmentReports(response);
          setMappedTeams(response.mappedTeams);
        })
        .catch((error) => {
          const perror = JSON.stringify(error);
          const object = JSON.parse(perror);
          if (object.code === 401) {
            props.history.push('/relogin');
          }
        });
    }
  }, [assessmentTypeAndVersion, questionnaires]);

  const downloadCSV = (data: any) => {
    const blob = new Blob([data], { type: 'txt/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'opsai.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const objectToCsv = (data: any) => {
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));

    for (const rows of data) {
      const values = headers.map((header) => {
        const escaped = ('' + rows[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  };

  const teamReport = () => {
    const typeAndVersion =
      assessmentTypeAndVersion !== ''
        ? assessmentTypeAndVersion
        : questionnaires
        ? questionnaires.length > 0
          ? `${questionnaires[0].questionnaireId}+${questionnaires[0].version}`
          : ''
        : '';
    if (typeAndVersion !== '') {
      const typeAndVersionSplit = typeAndVersion.split('+');
      const type = typeAndVersionSplit[0];
      const version = typeAndVersionSplit[1];
      Http.get({
        url: `/api/v2/downloadReports/assessments-data-csv?type=${type}&version=${version}`,
        state: stateVariable,
      })
        .then((response: any) => {
          const csvData = objectToCsv(response);
          downloadCSV(csvData);
        })
        .catch((error) => {
          const perror = JSON.stringify(error);
          const object = JSON.parse(perror);
          if (object.code === 401) {
            props.history.push('/relogin');
          }
        });
    }
  };

  useEffect(() => {
    if (
      assessmentReports &&
      assessmentReports.teams &&
      assessmentReports.userLevels &&
      Object.keys(assessmentReports.teams).length > 0 &&
      assessmentReports.userLevels.length > 0
    ) {
      //          (Object.keys(assessmentReports.userLevels).length > 0)) {
      setBarChartData(processBarGraphData(assessmentReports, focusTeam));
      setPieChartData(processPieChartData(assessmentReports, focusTeam));
      setAverageScore(processAverageScore(assessmentReports, focusTeam));
      setResultsTableData(
        processResultsTableData(assessmentReports, focusTeam)
      );
    }
  }, [assessmentReports, focusTeam]);

  useEffect(() => {
    if (
      assessmentReports &&
      assessmentReports.teams &&
      assessmentReports.userLevels &&
      assessmentReports.questionsDetails &&
      Object.keys(assessmentReports.teams).length > 0 &&
      Object.keys(assessmentReports.questionsDetails).length
    ) {
      setQuestionList(assessmentReports.questionsDetails);
      const questionId = Object.keys(assessmentReports.questionsDetails)[0];
      const questionIdentifier = {
        id: questionId,
        version: assessmentReports.questionsDetails[questionId].version,
      };
      setFocusQuestion(questionIdentifier);
    }
  }, [assessmentReports]);

  useEffect(() => {
    if (
      assessmentReports &&
      assessmentReports.teams &&
      assessmentReports.userLevels &&
      assessmentReports.questionsDetails &&
      Object.keys(assessmentReports.teams).length > 0 &&
      Object.keys(assessmentReports.questionsDetails).length
    ) {
      setQuestionReportData(
        processQuestionReportData(
          assessmentReports,
          focusTeam,
          focusQuestion,
          questionList
        )
      );
    }
  }, [focusQuestion, focusTeam]);

  const handleChangeQuestonnaireValue = (event: any) => {
    if (event.target.value !== assessmentTypeAndVersion) {
      setPieChartEventClicked(false);
      setCategoryBarChartEventClicked(false);
      setAssessmentReportsFetched(false);
      setFocusTeam('all');
      setAssessmentTypeAndVersion(event.target.value);
    }
  };

  const handleChangeFocusTeamValue = (event: any) => {
    setPieChartEventClicked(false);
    setCategoryBarChartEventClicked(false);
    setFocusTeam(event.target.value);
  };

  const changeQuestion = (event: any) => {
    const questionId = event.target.value;
    const questionIdentifier = {
      id: questionId,
      version: questionList[questionId].version,
    };
    setFocusQuestion(questionIdentifier);
  };

  function viewTeamAssessmentClicked(event: any) {
    props.history.push('/assessment/teams');
  }

  const pieChartClickHandler = (event: any) => {
    if (event[0] && event[0]._index !== null) {
      setPieLevelIndex(event[0]._index);
      scroll.scrollToTop();
      setPieChartEventClicked(true);
    }
  };

  const categoryBarChartClickHandler = (event: any) => {
    if (event[0] && event[0]._index !== null) {
      setBarChartCategory(event[0]._chart.data.labels[event[0]._index]);
      scroll.scrollToTop();
      setCategoryBarChartEventClicked(true);
    }
  };

  const questionChartClickHandler = (event: any) => {
    if (event[0] && event[0]._index != null) {
      setQuestionChartAnswerIndex(event[0]._index);
      setQuestionChartEventClicked(true);
      scroll.scrollToTop();
    }
  };

  /* const changeTopBottomCount = (event: any) => {
    setTopBottomCount(event.target.value);
  } */

  const renderOverallMaturity = () => {
    return (
      <Grid
        container
        spacing={3}
        className='topScrollContainerAsssessment'
        id='overallMaturity'
      >
        <Grid item xs={12} sm={8} md={8} lg={9}>
          <Paper className={classes.paper}>
            <div className={classes.title}>
              <Title>
                <Text tid='overallMaturity' />
                <MuiThemeProvider theme={tooltipTheme}>
                  <Tooltip
                    title={
                      <Typography className='tooltipTitleStyle'>
                        <Text tid='interactWithChart' />
                      </Typography>
                    }
                    placement='right'
                  >
                    <InfoIcon className={classes.infoIconStyle} />
                  </Tooltip>
                </MuiThemeProvider>
              </Title>
            </div>
            <div>
              <PieChart
                data={pieChartData}
                clickHandler={pieChartClickHandler}
              />
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={4} lg={3}>
          <Paper className={fixedHeightPaper}>
            <Title>
              <Text tid='averageScore' />
            </Title>
            <Typography component='p' variant='h4'>
              {averageScore
                ? isNaN(averageScore.average)
                  ? 'NA'
                  : `${averageScore.average}%`
                : 'NA'}
            </Typography>
            <Title>
              <Text tid='totalAssessment' />
            </Title>
            <Typography component='p' variant='h4'>
              {averageScore
                ? isNaN(averageScore.total)
                  ? 'NA'
                  : averageScore.total
                : 'NA'}
            </Typography>
            <Typography
              color='textSecondary'
              className={classes.depositContext}
            >
              as on{' '}
              {`${date.getDate()} ${
                months[date.getMonth()]
              }, ${date.getFullYear()}`}
            </Typography>
            <MuiThemeProvider theme={tooltipTheme}>
              <Tooltip
                title={
                  <Typography className='tooltipTitleStyle'>
                    <Text tid='downloadReport' />
                  </Typography>
                }
              >
                <div>
                  <img
                    src={CSVicon}
                    style={{ cursor: 'pointer' }}
                    onClick={teamReport}
                  />
                </div>
              </Tooltip>
            </MuiThemeProvider>

            <br />
            <div
              style={{
                width: '100%',
                marginTop: '10px',
                marginBottom: '16px',
              }}
            >
              <Divider />
            </div>
            <div>
              <Link
                color='primary'
                style={{ cursor: 'pointer' }}
                onClick={viewTeamAssessmentClicked}
              >
                <Text tid='viewTeamAssessment' />
              </Link>
            </div>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderBarGraph = () => {
    return (
      <Grid
        container
        spacing={3}
        className='topScrollContainerAsssessment'
        id='categorywiseMaturity'
      >
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <div className={classes.title}>
              <Title>
                <Text tid='categoryWiseMaturity' />
                <MuiThemeProvider theme={tooltipTheme}>
                  <Tooltip
                    title={
                      <Typography className='tooltipTitleStyle'>
                        <Text tid='interactWithChart' />
                      </Typography>
                    }
                    placement='right'
                  >
                    <InfoIcon className={classes.infoIconStyle} />
                  </Tooltip>
                </MuiThemeProvider>
              </Title>
            </div>
            <BarChart
              data={barChartData}
              yAxisLabel={'Number of Assessments'}
              clickHandler={categoryBarChartClickHandler}
            />
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderAnswersLegend = () => {
    let answerArray = Object.keys(questionList[focusQuestion.id].answers);
    if (
      questionList[focusQuestion.id] &&
      !questionList[focusQuestion.id]!.randomize
    ) {
      answerArray = answerArray.sort((a, b) => {
        return questionList[focusQuestion.id].answers[a].weightageFactor >
          questionList[focusQuestion.id].answers[b].weightageFactor
          ? 1
          : -1;
      });
    }
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper variant='outlined' square style={{ maxWidth: '50%' }}>
            {answerArray.map((el: string, i: number) => {
              return (
                <Fragment key={i}>
                  <div style={{ display: 'flex' }}>
                    <Paper
                      variant='outlined'
                      square
                      className={classes.colorReviewBox}
                      style={{ backgroundColor: hexColors[i] }}
                    />
                    <Typography style={{ fontSize: '16px' }}>
                      <strong>{`Answer ${i + 1}`}</strong>
                      {` - ${
                        questionList[focusQuestion.id].answers[el].answer
                      }`}
                    </Typography>
                  </div>
                </Fragment>
              );
            })}
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderResultsTable = () => {
    return (
      <Grid
        container
        spacing={3}
        className='topScrollContainerAsssessment'
        id='performanceMetrics'
      >
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <div className={classes.title}>
                  <Title>
                    <Text tid='performanceMetrics' />
                  </Title>
                  <HtmlTooltip
                    title={
                      <Fragment>
                        <Typography>
                          <strong>
                            <Text tid='bestPerformingAreas' /> &nbsp;
                          </strong>
                          {bestPerformingTooltipText}
                        </Typography>
                        <Typography>
                          <strong>
                            <Text tid='areasForImprovement' /> &nbsp;
                          </strong>
                          {areasNeedingFocusTooltipText}
                        </Typography>
                      </Fragment>
                    }
                  >
                    <InfoIcon className={classes.infoIconStyle} />
                  </HtmlTooltip>
                </div>
              </Grid>
            </Grid>
            <ResultsTable
              data={resultsTableData}
              focusTeam={focusTeam}
              constant={assessmentReports.performanceMetricsConstant}
            />
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderQuestionReportGraph = () => {
    return (
      <Grid
        container
        spacing={3}
        className='topScrollContainerAsssessment'
        id='questionwiseMetrics'
      >
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <div className={classes.title}>
              <Title>
                <Text tid='questionWiseMetrics' />
                <MuiThemeProvider theme={tooltipTheme}>
                  <Tooltip
                    title={
                      <Typography className='tooltipTitleStyle'>
                        <Text tid='interactWithChart' />
                      </Typography>
                    }
                    placement='right'
                  >
                    <InfoIcon className={classes.infoIconStyle} />
                  </Tooltip>
                </MuiThemeProvider>
              </Title>
            </div>
            <FormControl className={classes.questionFormControl}>
              <InputLabel id='demo-simple-select-label'>
                <Text tid='chooseQuestion' />
              </InputLabel>
              <Select value={focusQuestion.id} onChange={changeQuestion}>
                {Object.keys(questionList).map((opt: any) => {
                  return (
                    <MenuItem key={opt} value={opt}>
                      {questionList[opt].question}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <br />
            {questionReportData ? (
              <Fragment>
                <HorizontalBarChart
                  data={questionReportData}
                  xAxisLabel={'Number of answers'}
                  clickHandler={questionChartClickHandler}
                />
                <br />
                {renderAnswersLegend()}
              </Fragment>
            ) : (
              <div />
            )}
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderDashBoardLayout = () => {
    if (assessmentReports === {}) {
      return (
        <div className={classes.messagePage}>
          <Typography variant='h5'>
            <Text tid='noAssessmentDataForQuestionnaire' />
          </Typography>
        </div>
      );
    }
    if (focusTeam === 'all') {
      if (!assessmentReports.teams) {
        return (
          <div className={classes.messagePage}>
            <Typography variant='h5'>
              <Text tid='noAssessmentDataForQuestionnaire' />
            </Typography>
          </div>
        );
      }
      if (
        assessmentReports.teams &&
        Object.keys(assessmentReports.teams).length === 0
      ) {
        return (
          <div className={classes.messagePage}>
            <Typography variant='h5'>
              <Text tid='noAssessmentDataForQuestionnaire' />
            </Typography>
          </div>
        );
      }
    } else {
      if (!assessmentReports.teams) {
        return (
          <div className={classes.messagePage}>
            <Typography variant='h5'>
              <Text tid='noAssessmentDataForQuestionnaire' />
            </Typography>
          </div>
        );
      }
      if (Object.keys(assessmentReports.teams).length === 0) {
        return (
          <div className={classes.messagePage}>
            <Typography variant='h5'>
              <Text tid='noAssessmentDataForQuestionnaire' />
            </Typography>
          </div>
        );
      }
      if (
        !(
          assessmentReports.teams[focusTeam] &&
          assessmentReports.teams[focusTeam].assessments &&
          assessmentReports.teams[focusTeam].assessments.length > 0
        )
      ) {
        return (
          <div className={classes.messagePage}>
            <Typography variant='h5'>
              <Text tid='noAssessmentDataForTeam' />
            </Typography>
          </div>
        );
      }
    }
    return (
      <Fragment>
        {renderOverallMaturity()}
        {renderBarGraph()}
        {renderResultsTable()}
        {questionList && Object.keys(questionList).length > 0 ? (
          renderQuestionReportGraph()
        ) : (
          <div />
        )}
      </Fragment>
    );
  };

  const renderLoader = () => {
    return (
      <Container maxWidth='md' component='div' className='loaderStyle'>
        <Loader />
      </Container>
    );
  };

  const renderPieChartTable = () => {
    return (
      <Fragment>
        <PieChartEvent
          responseData={assessmentReports}
          focusTeam={focusTeam}
          levelIndex={pieLevelIndex}
        />
        <div className={classes.flexCenterAlignContainer}>
          <Button
            variant='outlined'
            className={classes.backButton}
            // tslint:disable-next-line: jsx-no-lambda
            onClick={() => {
              setPieChartEventClicked(false);
              scroll.scrollToTop();
            }}
          >
            <Text tid='goBack' />
          </Button>
        </div>
      </Fragment>
    );
  };

  const renderCategoryBarChartTable = () => {
    return (
      <Fragment>
        <CategoryBarChartEvent
          responseData={assessmentReports}
          focusTeam={focusTeam}
          focusCategory={barChartCategory}
        />
        <div className={classes.flexCenterAlignContainer}>
          <Button
            variant='outlined'
            className={classes.backButton}
            // tslint:disable-next-line: jsx-no-lambda
            onClick={() => {
              setCategoryBarChartEventClicked(false);
              scroll.scrollToTop();
            }}
          >
            <Text tid='goBack' />
          </Button>
        </div>
      </Fragment>
    );
  };

  const renderQuestionBarChartTable = () => {
    return (
      <Fragment>
        <QuestionChartEvent
          responseData={assessmentReports}
          focusQuestion={focusQuestion}
          focusAnswerIndex={questionChartAnswerIndex}
          focusTeam={focusTeam}
        />
        <div className={classes.flexCenterAlignContainer}>
          <Button
            variant='outlined'
            className={classes.backButton}
            // tslint:disable-next-line: jsx-no-lambda
            onClick={() => {
              setQuestionChartEventClicked(false);
              scroll.scrollToTop();
            }}
          >
            <Text tid='goBack' />
          </Button>
        </div>
      </Fragment>
    );
  };

  const renderUnmappedAssessmentDashboard = () => {
    return (
      <Container maxWidth='md' component='div'>
        <div style={{ display: 'flex' }}>
          <Typography variant='h6'>
            <Text tid='teamIsCurrentlyNotMappedAssessment' />
          </Typography>
        </div>
      </Container>
    );
  };

  const renderMainDashboard = () => {
    return (
      <Fragment>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={6} lg={6}>
            <FormControl className={classes.formControl}>
              <InputLabel id='demo-simple-select-label'>
                <Text tid='chooseAssessment' />
              </InputLabel>
              <Select
                value={
                  assessmentTypeAndVersion !== ''
                    ? assessmentTypeAndVersion
                    : questionnaires
                    ? questionnaires.length > 0
                      ? `${questionnaires[0].questionnaireId}+${questionnaires[0].version}`
                      : ''
                    : ''
                }
                onChange={handleChangeQuestonnaireValue}
              >
                {questionnaires &&
                  questionnaires.map((opt: any) => {
                    return (
                      <MenuItem
                        key={`${opt.questionnaireId}+${opt.version}`}
                        value={`${opt.questionnaireId}+${opt.version}`}
                      >
                        {`${opt.displayName} - v${opt.version}`}
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={6}>
            <FormControl className={classes.formControl}>
              <InputLabel id='demo-simple-select-label'>
                <Text tid='chooseTeam' />
              </InputLabel>
              <Select
                value={focusTeam !== '' ? focusTeam : ''}
                onChange={handleChangeFocusTeamValue}
              >
                {teamList.length > 0 &&
                  mappedTeams.length > 0 &&
                  teamList.map((opt: any, i: number) => {
                    if (!mappedTeams.includes(opt.teamId)) {
                      return;
                    }
                    return (
                      <MenuItem key={i} value={opt.teamId}>
                        {opt.teamName}
                      </MenuItem>
                    );
                  })}
                <MenuItem key={'all'} value={'all'}>
                  <Text tid='all' />
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        {renderDashBoardLayout()}
      </Fragment>
    );
  };

  return (
    // tslinassessmentReports.teamt:disable-next-line: jsx-wrap-multiline
    <Fragment>
      <Container maxWidth='md' className={classes.container} style={{ top: props.sideMenu ? '0px' : '100px' }}>
        {questionnairesFetch && questionnaires && questionnaires.length <= 0
          ? renderUnmappedAssessmentDashboard()
          : assessmentReportsFetched && assessmentReports
          ? pieChartEventClicked
            ? renderPieChartTable()
            : categoryBarChartEventClicked
            ? renderCategoryBarChartTable()
            : questionChartEventClicked
            ? renderQuestionBarChartTable()
            : renderMainDashboard()
          : renderLoader()}
      </Container>
    </Fragment>
  );
};

export default withRouter(Dashboard);
