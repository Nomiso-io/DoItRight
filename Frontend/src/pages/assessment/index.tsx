import React, { useEffect, useState, Fragment } from 'react';
import { RouteComponentProps, withRouter, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import Container from '@material-ui/core/Container';
import {
  fetchAssessmentData,
  resetAssessmentDetail,
  unsetContinueAssessmentNotificationShown,
  fetchAssessmentQuestionInitialize,
} from '../../actions/assessment';
import {
  useActions,
  resetResultState,
  setAppBarLeftText,
  setAppBarCenterText,
} from '../../actions';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactGA from 'react-ga';
import {
  Button,
  Paper,
  TextField,
  Typography,
  Snackbar,
  SnackbarContent,
} from '@material-ui/core';
import './style.css';
import { buttonStyle } from '../../common/common';
import { setAssessmentStartTime } from '../../actions/assessment/assessment-time';
import * as constantValues from '../../common/constantValues';
import { Text } from '../../common/Language';
import { ITeamInfo } from '../../model';

interface IAssessmentProps extends RouteComponentProps { }

const defaultAssessmentId: string | null = null;

const useStyles = makeStyles((theme) => ({
  containerRoot: {
    textAlign: 'center',
    alignContent: 'center',
    height: '60vh',
    width: '100%',
    position: 'relative',
    top: '120px',
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: '80px 100px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'inherit',
  },
  info1: {
    textAlign: 'justify',
    fontSize: '16px',
    color: '#444',
    fontWeight: 300,
  },
  info2: {
    textAlign: 'justify',
    fontSize: '16px',
    color: '#444',
    fontWeight: 300,
    minWidth: '100%',
  },
  info3: {
    textAlign: 'left',
    fontSize: '16px',
    color: '#444',
    fontWeight: 300,
    minWidth: '100%',
  },
  progress: {
    margin: theme.spacing(4),
  },
  bottomButton: {
    margin: theme.spacing(6),
    marginBottom: '0px',
    ...buttonStyle,
  },
  textField: {
    borderBottom: 'none!important',
    boxShadow: 'none!important',
    width: '80%',
  },
}));

function Assessment(props: IAssessmentProps) {
  const classes = useStyles();
  const fetchAssessmentSummary = useActions(fetchAssessmentData);
  const info1 =
    'This assessment focuses on measuring your maturity in following categories XXYYZZ.  In order to get accurate picture, we recommend you to take this assessment without peer help and in one go. We also recommend not to overthink while answering the questions.';
  const info2 =
    ' This is a multiple choice assessment and should take approximately 20-30 min.';
  // const assessmentQuestion = useSelector((state: IRootState) =>
  // state.assessment.assessmentQuestion);
  const assessmentSummary = useSelector(
    (state: IRootState) => state.assessment.assessmentSummary
  );
  const assessmentMarkedAnswers = useSelector(
    (state: IRootState) => state.assessment.markedAnswers
  );
  const selectedAssessmentType = useSelector(
    (state: IRootState) => state.assessment.selectedAssessmentType
  );
  const assessmentTypeData = useSelector(
    (state: IRootState) => state.assessment.assessmentType
  );
  const userTeam = useSelector((state: IRootState) => state.user.team);
  const userAllTeams = useSelector((state: IRootState) => state.user.teams);
  const [assessmentId, setAssessmentId] = useState(defaultAssessmentId);
  const [startAssessment, setStartAssessment] = useState(false);
  const resetResult = useActions(resetResultState);
  const resetAssessmentDetailState = useActions(resetAssessmentDetail);
  const resetAssessmentQuestion = useActions(fetchAssessmentQuestionInitialize);
  const [categoryString, setCategoryString] = useState('');
  const [fetchStatus, setFetchStatus] = useState(false);
  const setLeftDisplayText = useActions(setAppBarLeftText);
  const setCenterDisplayText = useActions(setAppBarCenterText);
  const unsetContinueAssessmentModalDisplayed = useActions(
    unsetContinueAssessmentNotificationShown
  );
  const startTimers = useActions(setAssessmentStartTime);
  const systemDetails = useSelector((state: IRootState) => state.systemDetails);
  const [trialUserEmail, setTrialUserEmail] = useState<string>('');
  const [failure, setFailure] = useState(false);
  const [failureMessage, setFailureMessage] = useState(
    <Text tid='somethingWentWrong' />
  );
  let msgFailure = failureMessage;

  useEffect(() => {
    unsetContinueAssessmentModalDisplayed();
    resetAssessmentQuestion();
    fetchAssessmentSummary(selectedAssessmentType, userTeam);
    if (assessmentTypeData.status === 'success') {
      assessmentTypeData.data.questionnaires.forEach((el: any) => {
        if (el.questionnaireId === selectedAssessmentType.questionnaireId) {
          setLeftDisplayText(el.displayName);
          const team: ITeamInfo[] = userAllTeams.filter((team: ITeamInfo) => team.teamId === userTeam)
          setCenterDisplayText(`Team: ${team[0].teamName}`);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (assessmentSummary.status === 'success' && startAssessment) {
      const assessmentId = assessmentSummary.data!.assessmentId;
      resetResult();
      resetAssessmentDetailState();
      setAssessmentId(assessmentId);
      startTimers();
    }
  }, [startAssessment, assessmentSummary.status]);

  useEffect(() => {
    if (
      assessmentSummary.status === 'success' &&
      Object.keys(assessmentSummary.data!.categoryList).length > 0
    ) {
      let categories = '';
      Object.keys(assessmentSummary.data!.categoryList).forEach((el, i) => {
        if (i === 0) {
          categories = el + ', ';
        } else if (
          i ===
          Object.keys(assessmentSummary.data!.categoryList).length - 1
        ) {
          categories = categories + el;
        } else {
          categories = categories + el + ', ';
        }
      });
      setCategoryString(categories);
    }
  }, [assessmentSummary.status]);

  useEffect(() => {
    if (assessmentId !== null) {
      props.history.push(`${props.match.url}/${assessmentId}/question/1`);
    }
  }, [assessmentId]);

  useEffect(() => {
    if (
      assessmentSummary.status === 'success' ||
      assessmentSummary.status === 'fail'
    ) {
      setFetchStatus(true);
    }
  }, [assessmentSummary.status]);

  const handleClose = () => {
    setFailure(false);
  };

  const handleEmailChange = (event: any) => {
    setTrialUserEmail(event.target.value);
  };

  const getAssessmentDataAndRedirect = () => {
    ReactGA.event({
      category: 'Assessment',
      action: 'Assessment started',
      label: assessmentId ? assessmentId : '',
    });
    if (systemDetails.mode === constantValues.TRIAL_MODE) {
      if (trialUserEmail === '') {
        setFailureMessage(<Text tid='enterValidEmailToStartTrial' />);
        setFailure(true);
      } else {
        //TODO: overwrite the email in user state object to this email
        setStartAssessment(true);
      }
    } else {
      setStartAssessment(true);
    }
  };

  const renderStartAssessmentComponent = () => {
    let tempo: any[] = [];
    if (
      assessmentSummary!.data!.description &&
      assessmentSummary!.data!.description !== 'false'
    ) {
      tempo = assessmentSummary!.data!.description.split('\n');
    }
    return (
      <Fragment>
        <div className='start-assessment'>
          <Paper className={classes.paper}>
            {tempo.length > 0 ? (
              <div>
                {tempo.map((el, i) => {
                  return (
                    <div key={i}>
                      <Typography className={classes.info1} variant='body1'>
                        {el}
                      </Typography>
                      <br />
                    </div>
                  );
                })}
                <Typography className={classes.info3} variant='body1'>
                  <Text tid='numberOfQuestions' />
                  {assessmentSummary!.data!.numberOfQuestions}
                </Typography>
                {assessmentSummary!.data!.timeOut && (
                  <Typography className={classes.info3} variant='body1'>
                    <Text tid='time' />
                    {assessmentSummary!.data!.timeOutTime} minutes
                  </Typography>
                )}
              </div>
            ) : (
              <div>
                <Typography className={classes.info1} variant='body1'>
                  {info1.replace('XXYYZZ', categoryString)}
                </Typography>
                <br />
                <Typography className={classes.info2} variant='body1'>
                  {info2}
                </Typography>
                <br />
                <Typography className={classes.info3} variant='body1'>
                  <Text tid='numberOfQuestions' />
                  {assessmentSummary!.data!.numberOfQuestions}
                </Typography>
                {assessmentSummary!.data!.timeOut && (
                  <Typography className={classes.info3} variant='body1'>
                    <Text tid='time' />
                    {assessmentSummary!.data!.timeOutTime} minutes
                  </Typography>
                )}
              </div>
            )}
            {systemDetails.mode === constantValues.TRIAL_MODE ? (
              <div>
                <Typography className={classes.info3} variant='body1'>
                  <Text tid='enterEmailAndClickStartButton' />
                </Typography>
                <TextField
                  required={true}
                  type='string'
                  id='email'
                  name='email'
                  value={trialUserEmail}
                  label='Your Email'
                  onChange={handleEmailChange}
                  autoComplete='off'
                  className={classes.textField}
                />
              </div>
            ) : (
              <div />
            )}
            <Button
              onClick={getAssessmentDataAndRedirect}
              variant='outlined'
              size='large'
              className={classes.bottomButton}
            >
              {Object.keys(assessmentMarkedAnswers).length === 0 ? (
                <Text tid='startAssessment' />
              ) : (
                <Text tid='continueAssessment' />
              )}
            </Button>
          </Paper>
          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={failure}
            onClose={handleClose}
            autoHideDuration={9000}
          >
            <SnackbarContent
              style={{
                backgroundColor: '#dd0000',
              }}
              message={msgFailure}
            />
          </Snackbar>
        </div>
      </Fragment>
    );
  };

  const summaryApiWaitLoading = () => {
    return (
      <Fragment>
        <CircularProgress className={classes.progress} />
        <Typography>
          <Text tid='loadingAssessment' />
        </Typography>
      </Fragment>
    );
  };

  const renderAssessmentSummary = (match: any) => {
    // console.log(
    //   assessmentSummary.status,
    //   'userAllTeams.length',
    //   userAllTeams.length
    // );
    return (
      <Fragment>
        {assessmentSummary.status === 'success' && userAllTeams.length > 0
          ? renderStartAssessmentComponent()
          : summaryApiWaitLoading()}
      </Fragment>
    );
  };

  const redirectToLogin = () => {
    const error = JSON.stringify(assessmentSummary!.error);
    const object = JSON.parse(error);
    if (object.code) {
      if (object.code === 401) {
        return <Redirect to='/relogin' />;
      }
    }
    return <Redirect to='/error' />;
  };

  return (
    <Container className={classes.containerRoot}>
      {assessmentSummary.status === 'fail' && fetchStatus
        ? redirectToLogin()
        : renderAssessmentSummary(props.match)}
    </Container>
  );
}

export default withRouter(Assessment);
