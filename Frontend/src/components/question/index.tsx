import React, { useEffect, useState, Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import './style.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { useActions, setAppBarCenterText, setCurrentPage } from '../../actions';
import {
  fetchAssessmentQuestion,
  postSelectedOption as postSelectedOptionAction,
  fetchAssessmentQuestionInitialize,
  setContinueAssessmentNotificationShown,
} from '../../actions/assessment';
import QuestionComponent from './question-component';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import { Typography, Popper, Fade, Paper, Grid } from '@material-ui/core';
import _ from 'lodash';
import Pagination from 'react-js-pagination';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import ReactGA from 'react-ga';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { buttonStyle } from '../../common/common';
import { ModalComponent } from '../modal';
import {
  IAssessmentPostResponse,
  IAnswerPayload,
  ISelectedOption,
  IAssessmentAnswersMap,
} from '../../model';
import { Http } from '../../utils';
import { default as MaterialLink } from '@material-ui/core/Link';
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';
import { getQuestionIdFromCompositeQuestionId } from '../../utils/data';
import { QontoStepIcon, QontoConnector } from './qontoStepIcon';
import SnackbarBottomLeft from '../snackbar';
import * as constantValues from '../../common/constantValues';
import ReactPlayer from 'react-player';
import { Text } from '../../common/Language';

let timeLeftTimer: NodeJS.Timeout;

interface IQuestionRouteParams {
  assessmentId: string;
  index: string;
}

type IQuestionProps = RouteComponentProps<IQuestionRouteParams>;

const useStyles = makeStyles((theme) => ({
  containerRoot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '100%',
    paddingBottom: theme.spacing(4),
  },
  progress: {
    margin: theme.spacing(4),
  },
  navContainer: {
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'center',
    padding: 0,
  },
  selected: {
    '&$selected': {
      '&:hover': {
        backgroundColor: 'yellow',
      },
      backgroundColor: 'yellow',
    },
  },
  bottomButtons: {
    ...buttonStyle,
  },
  active: {
    color: '#FFFFFF',
    backgroundColor: '#4054B5',
  },
  stepper: {
    backgroundColor: '#f0f2f5',
    minWidth: '50%',
    maxWidth: '100%',
    width: '100%',
    paddingLeft: '0px',
    paddingRight: '0px',
  },
  pagination: {
    marginTop: '10px',
    marginBottom: '10px',
  },
  paper: {
    width: 400,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginTop: '8px',
    marginRight: '5px',
  },
  stepperAndHelpContainer: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
    marginTop: '120px',
  },
  sideHelp: {
    height: 'auto',
    width: '100%',
    backgroundColor: '#F0F2F5',
    marginTop: '10%',
    padding: '10%',
  },
  centerAlignedDiv: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintUrl: {
    overflowWrap: 'break-word',
  },
}));

const checkIfMappedQuestionExistForTheIndex = (
  index: string,
  mappedQuestions: IAssessmentAnswersMap
) => {
  let mappedQuestionId = '';
  Object.keys(mappedQuestions).forEach((key: string) => {
    if (typeof mappedQuestions[key].index !== 'undefined') {
      if (mappedQuestions[key].index === parseInt(index, 10) - 1) {
        mappedQuestionId = key;
      }
    }
  });
  return mappedQuestionId;
};

const hasTimerExpired = (startTime: number, timeOutTime: number) => {
  const currentTime = new Date().getTime();
  const timeSinceAssessmentStarted = currentTime - startTime;
  if (timeSinceAssessmentStarted > timeOutTime * 60 * 1000) {
    return true;
  }
  return false;
};

const getTimerValues = (
  startTime: number,
  currentTime: number,
  timeOutTime: number
) => {
  const timeLeftTotalSeconds = Math.floor(
    (startTime + timeOutTime * 60 * 1000 - currentTime) / 1000
  );
  const timeLeftMinutes = Math.floor(timeLeftTotalSeconds / 60);
  const timeLeftSeconds = timeLeftTotalSeconds % 60;
  if (timeLeftTotalSeconds <= 0) {
    return `Time Left: 00:00`;
  }
  return `Time Left: ${
    timeLeftMinutes < 10 ? `0${timeLeftMinutes}` : timeLeftMinutes
  }:${timeLeftSeconds < 10 ? `0${timeLeftSeconds}` : timeLeftSeconds}`;
};

const getTimerWarningInfo = (
  startTime: number,
  currentTime: number,
  timeOutTime: number,
  warningTimePercentage: number
) => {
  const timeSinceAssessmentStarted = currentTime - startTime;
  const timeLeft = timeOutTime * 60 * 1000 - timeSinceAssessmentStarted;
  const percentageOfTimeOver = (timeLeft * 100) / (timeOutTime * 60 * 1000);
  if (warningTimePercentage > 0) {
    let warningTimeMinutes = 0;
    if (
      warningTimePercentage &&
      timeOutTime &&
      warningTimePercentage > 0 &&
      timeOutTime > 0
    ) {
      warningTimeMinutes = (warningTimePercentage / 100) * timeOutTime;
    }
    warningTimeMinutes = Math.floor(warningTimeMinutes);
    if (warningTimeMinutes !== 0 && timeLeft < warningTimeMinutes * 60 * 1000) {
      return {
        message: `Less than ${warningTimeMinutes} ${
          warningTimeMinutes === 1 ? 'minute is' : 'minutes are'
        } left.`,
        showWarning: true,
      };
    }
  } else {
    if (timeLeft < 5 * 60 * 1000) {
      return {
        message: 'Less than 5 minutes are left.',
        showWarning: true,
      };
    }
    if (percentageOfTimeOver <= 50) {
      return {
        message: 'Half of your time is up.',
        showWarning: true,
      };
    }
  }
  return {
    message: '',
    showWarning: false,
  };
};

function QuestionRender(props: IQuestionProps) {
  const classes = useStyles();
  const getAssessmentQuestion = useActions(fetchAssessmentQuestion);
  const resetAssessmentQuestion = useActions(fetchAssessmentQuestionInitialize);
  const setCurrentPageValue = useActions(setCurrentPage);
  const postSelectedOption = useActions(postSelectedOptionAction);
  const { assessmentId, index } = props.match!.params;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const previousMarkedAnswers = useSelector(
    (state: IRootState) => state.assessment.markedAnswers
  );
  const [saveAndCloseState, setSaveAndCloseState] = useState<any>({});
  const numberOfQuestions = useSelector(
    (state: IRootState) =>
      state.assessment.assessmentSummary.data!.numberOfQuestions
  );
  const categories = useSelector(
    (state: IRootState) => state.assessment.assessmentSummary.data!.categoryList
  );
  const assessmentType = useSelector(
    (state: IRootState) => state.assessment.assessmentSummary.data!.type
  );
  const questionnaireVersion = useSelector(
    (state: IRootState) => state.assessment.assessmentSummary.data!.version
  );
  const stateVariable = useSelector((state: IRootState) => state);
  const team = useSelector((state: IRootState) => state.user.team);
  const [lastAnswerSubmitStatus, setLastAnswerSubmitStatus] = useState('start');
  const defaultErrorMessage = {
    error: false,
    message: '',
  };
  const [errorMessage, setErrorMessage] = useState(defaultErrorMessage);
  const [selectedOption, setSelectedOption] = useState<any>({});
  const [nextUrl, setNextUrl] = useState('');
  const [prevUrl, setPrevUrl] = useState('');
  const [nextQuesIndex, setNextQuesIndex] = useState(0);
  const [prevQuesIndex, setPrevQuesIndex] = useState(0);
  const [openToast, setOpenToast] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openContinueModal, setOpenContinueModal] = useState(false);
  const steps = Object.keys(categories);
  const [activeStep, setActiveStep] = useState(
    Math.floor(parseInt(index, 10) / 5)
  );
  const [completedStep, setCompletedStep] = useState(-1);
  const assessmentQuestion = useSelector(
    (state: IRootState) => state.assessment.assessmentQuestion
  );
  const assessmentResult = useSelector(
    (state: IRootState) => state.assessment.result
  );
  const maxAssessmentQuestions = useSelector(
    (state: IRootState) =>
      state.assessment.assessmentSummary.data!.numberOfQuestions
  );
  // Continue Assessment Modal changes start here
  const continueAssessmentModalNotified = useSelector(
    (state: IRootState) =>
      state.assessment.misc.continueAssessmentNotificationShown
  );
  const setContinueAssessmentModalDisplayed = useActions(
    setContinueAssessmentNotificationShown
  );
  // Assessment time related changes
  const timeOut = useSelector(
    (state: IRootState) => state.assessment.assessmentSummary.data!.timeOut
  );
  const timeOutTime = useSelector(
    (state: IRootState) => state.assessment.assessmentSummary.data!.timeOutTime
  );
  const warningTimePercentage = useSelector(
    (state: IRootState) =>
      state.assessment.assessmentSummary.data!.warningTimePercentage
  );
  const startTime = useSelector(
    (state: IRootState) => state.assessment.assessmentTime.startTime
  );
  const setCenterDisplayText = useActions(setAppBarCenterText);
  const [timerExpiry, setTimerExpiry] = useState(false);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const [timerWarningMessage, setTimerWarningMessage] = useState('');
  const [focusClickEvent, setFocusClickEvent] = useState<any>();
  const [submitNotifyModal, setSubmitNotifyModal] = useState(false);
  const userTeam = useSelector((state: IRootState) => state.user.team);
  const systemDetails = useSelector((state: IRootState) => state.systemDetails);

  useEffect(() => {
    if (timeOut) {
      const timer = setInterval(() => {
        const currentTime = new Date().getTime();
        setCenterDisplayText(
          getTimerValues(startTime, currentTime, timeOutTime)
        );
      }, 1000);
      timeLeftTimer = timer;
    }
    return () => {
      if (timeLeftTimer) {
        clearInterval(timeLeftTimer);
        setCenterDisplayText(`Team: ${userTeam}`);
      }
    };
  }, []);

  if (timeOut) {
    const currentTime = new Date().getTime();
    const { message, showWarning } = getTimerWarningInfo(
      startTime,
      currentTime,
      timeOutTime,
      warningTimePercentage
    );
    if (showWarning) {
      if (message !== timerWarningMessage) {
        if (!showTimerWarning) {
          setTimerWarningMessage(message);
          setShowTimerWarning(true);
        } else {
          setTimerWarningMessage(message);
        }
      }
      if (!timerWarningMessage) {
        setTimerWarningMessage(message);
        setShowTimerWarning(true);
      }
    }
  }

  useEffect(() => {
    if (assessmentQuestion.status === 'success') {
      if (
        Object.keys(previousMarkedAnswers).length > 0 &&
        !continueAssessmentModalNotified
      ) {
        setOpenContinueModal(true);
      } else {
        setContinueAssessmentModalDisplayed();
      }
    }
  }, [previousMarkedAnswers, assessmentQuestion.status]);

  const handleContinueModalYesClicked = () => {
    setOpenContinueModal(false);
    setContinueAssessmentModalDisplayed();
    let continueQuestionIndex = Object.keys(previousMarkedAnswers).length;
    let url = '';
    if (continueQuestionIndex + 1 <= maxAssessmentQuestions) {
      continueQuestionIndex = continueQuestionIndex + 1;
    }
    url = `/assessment/${assessmentId}/question/${continueQuestionIndex}`;
    resetAssessmentQuestion();
    setCurrentNavigationItem(continueQuestionIndex.toString());
    props.history.push(url);
  };

  const handleContinueModalNoClicked = () => {
    setContinueAssessmentModalDisplayed();
    setOpenContinueModal(false);
  };
  // Continue Assessment Modal changes end here

  const handleSubmitNotifyModalYesClicked = () => {
    processSubmit(focusClickEvent);
    setSubmitNotifyModal(false);
  };

  const handleSubmitNotifyModalNoClicked = () => {
    setSubmitNotifyModal(false);
  };

  const generateNextUrl = (assessmentId: string, currentIndex: number) => {
    return currentIndex + 1 <= maxAssessmentQuestions
      ? `/assessment/${assessmentId}/question/${currentIndex + 1}`
      : `/result/${assessmentId}`;
  };

  const generatePrevUrl = (assessmentId: string, currentIndex: number) => {
    return currentIndex - 1 >= 1
      ? `/assessment/${assessmentId}/question/${currentIndex - 1}`
      : `/assessment`;
  };

  const handleNext = (
    hasSelectionChanged: boolean,
    url: string,
    event: any
  ) => {
    const isUserResponseValid = validateSelectedOption(selectedOption);
    if (isUserResponseValid) {
      if (hasSelectionChanged) {
        ReactGA.event({
          category: 'Assessment',
          action: 'Answer submitted',
          label: selectedOption.answers.join(';'),
        });
        postSelectedOption(assessmentId, selectedOption);
      }
      if (url === '') {
        resetAssessmentQuestion();
        props.history.push(nextUrl);
        setCurrentNavigationItem(nextQuesIndex.toString());
      } else {
        props.history.push(url);
      }
    } else {
      openToastEvent(event);
    }
  };

  const openToastEvent = (event: any) => {
    setOpenToast(true);
    setAnchorEl(event.currentTarget);
    setInterval(() => {
      setOpenToast(false);
    }, 4000);
  };

  function postLastSelectedOption(
    assessmentId: string,
    payload: IAnswerPayload
  ) {
    Http.post<IAssessmentPostResponse, IAnswerPayload>({
      url: `/api/v2/assessment/${assessmentId}/answer`,
      body: {
        ...payload,
      },
      state: stateVariable,
    })
      .then((response: IAssessmentPostResponse) => {
        setLastAnswerSubmitStatus('success');
      })
      .catch((error) => {
        setLastAnswerSubmitStatus('fail');
      });
  }

  useEffect(() => {
    if (lastAnswerSubmitStatus === 'success') {
      setCenterDisplayText(`Team: ${userTeam}`);
      clearInterval(timeLeftTimer);
      props.history.push({
        pathname: nextUrl,
        state: { timerExpiry },
      });
    }
  }, [lastAnswerSubmitStatus]);

  const processSubmit = (event?: any) => {
    const questionData = assessmentQuestion.data;
    const { id } = questionData!;
    const defaultSelectedOption:
      | ISelectedOption
      | undefined = getDefaultSelectedOption(id);
    const hasSelectionChanged = getHasSelectionChanged(defaultSelectedOption);
    if (hasSelectionChanged) {
      ReactGA.event({
        category: 'Assessment',
        action: 'Answer submitted',
        label: selectedOption.answers.join(';'),
      });
      postLastSelectedOption(assessmentId, selectedOption);
    } else {
      setLastAnswerSubmitStatus('success');
    }
    const isAssessmentOver = validateSubmit();
    if (isAssessmentOver) {
      /* setActiveStep(0)
            setCompletedStep(-1) */
    } else {
      if (event) {
        openToastEvent(event);
      }
    }
    return true;
  };

  // Return true if the user response is valid, otherwise returns false
  const handleSubmit = (event?: any, notify?: boolean) => {
    const isUserResponseValid = validateSelectedOption(selectedOption);
    if (isUserResponseValid) {
      if (!notify || systemDetails.mode === constantValues.TRIAL_MODE) {
        return processSubmit(event);
      }
      setFocusClickEvent(event);
      setSubmitNotifyModal(true);
      return true;
    }
    if (event) {
      openToastEvent(event);
    }
    return false;
  };

  const setMarkedAnswer = (
    questionId: string,
    version: number,
    answers: string[] | null,
    comment: string | null
  ) => {
    const payload = {
      questionId,
      version,
      answers,
      comment,
    };
    setSelectedOption(payload);
  };

  const validateSelectedOption = (selectedOption: ISelectedOption) => {
    const { answers, comment } = selectedOption;
    if (!answers) {
      return false;
    }
    let numberOfAnswers = 0;
    if (
      assessmentQuestion &&
      assessmentQuestion.data &&
      assessmentQuestion.data.numberOfAnswers
    ) {
      numberOfAnswers = assessmentQuestion!.data!.numberOfAnswers;
    }
    if (answers!.length !== numberOfAnswers) {
      setErrorMessage({
        error: true,
        message: `Please select ${numberOfAnswers} option(s)`,
      });
      return false;
    }
    if (answers!.indexOf('@N/A') !== -1 && comment === null) {
      setErrorMessage({
        error: true,
        message: 'Please enter valid reason for selecting NA',
      });
      return false;
    }

    if (
      assessmentQuestion &&
      assessmentQuestion.data &&
      assessmentQuestion.data.reason &&
      !comment
    ) {
      setErrorMessage({
        error: true,
        message: 'Please enter valid reason for selecting this answer',
      });
      return false;
    }

    setErrorMessage({
      error: false,
      message: '',
    });

    return true;
  };

  const validateSubmit = () => {
    if (Object.keys(previousMarkedAnswers).length < numberOfQuestions - 1) {
      setErrorMessage({
        error: true,
        message: 'Please answer all the questions before preceeding',
      });
      return false;
    }
    setErrorMessage({
      error: false,
      message: '',
    });

    return true;
  };

  const renderActionButton = (hasSelectionChanged: boolean) => {
    const actionButtonText =
      parseInt(index, 10) + 1 <= maxAssessmentQuestions ? 'Next' : 'Submit';
    if (actionButtonText === 'Next') {
      return (
        <Box ml={2} component='div'>
          <Button
            // tslint:disable-next-line: jsx-no-lambda
            onClick={(event) => {
              handleNext(hasSelectionChanged, '', event);
            }}
            variant='outlined'
            className={classes.bottomButtons}
          >
            <Text tid='next' />
            &nbsp;
            <ArrowForwardIcon />
          </Button>
        </Box>
      );
    }
    return (
      <Box ml={2} component='div'>
        <Button
          // tslint:disable-next-line: jsx-no-lambda
          onClick={(event) => {
            handleSubmit(event, true);
          }}
          variant='outlined'
          className={classes.bottomButtons}
        >
          <Text tid='submit' />
        </Button>
      </Box>
    );
  };

  const renderPreviousButton = (
    hasSelectionChanged: boolean,
    index: string
  ) => {
    return (
      <Fragment>
        {index !== '1' ? (
          <Box mr={2} component='div'>
            <Button
              variant='outlined'
              className={classes.bottomButtons}
              onClick={(event) => {
                handlePrevButtonClick(hasSelectionChanged);
              }}
            >
              <ArrowBackIcon />
              &nbsp;
              <Text tid='previous' />
            </Button>
          </Box>
        ) : (
          <Box mr={2} component='div'>
            <Button
              disabled
              variant='outlined'
              className={classes.bottomButtons}
              onClick={(event) => {
                handlePrevButtonClick(hasSelectionChanged);
              }}
            >
              <ArrowBackIcon />
              &nbsp;
              <Text tid='previous' />
            </Button>
          </Box>
        )}
      </Fragment>
    );
  };

  const renderLoadingIcon = () => {
    return (
      <Fragment>
        <CircularProgress className={classes.progress} />
        <Typography variant='h5'>
          <Text tid='loadingQuestion' />
        </Typography>
      </Fragment>
    );
  };

  const handlePrevButtonClick = (hasSelectionChanged?: boolean) => {
    const isUserResponseValid = validateSelectedOption(selectedOption);
    if (isUserResponseValid) {
      if (hasSelectionChanged) {
        ReactGA.event({
          category: 'Assessment',
          action: 'Answer submitted',
          label: selectedOption.answers.join(';'),
        });
        postSelectedOption(assessmentId, selectedOption);
      }
    }
    resetAssessmentQuestion();
    props.history.push(prevUrl);
    setCurrentNavigationItem(prevQuesIndex.toString());
  };

  const renderSaveAndCloseButton = (hasSelectionChanged: boolean) => {
    return (
      <Button
        variant='outlined'
        className={classes.bottomButtons}
        // tslint:disable-next-line: jsx-no-lambda
        onClick={(event) => {
          handleSaveAndClose(hasSelectionChanged, '/', event);
        }}
      >
        <Text tid='saveAndClose' />
      </Button>
    );
  };

  const openNewTabHintUrl = (hintUrl: string | undefined) => {
    if (hintUrl) {
      if (
        hintUrl.substring(0, 8) === 'https://' ||
        hintUrl.substring(0, 7) === 'http://'
      ) {
        window.open(hintUrl, '_blank');
      } else {
        window.open(`https://${hintUrl}`);
      }
    }
  };

  const getDefaultSelectedOption = (id: string) => {
    let defaultSelectedOption: ISelectedOption | undefined;
    Object.keys(previousMarkedAnswers).forEach((questionId: string) => {
      const questionIdConstructed = getQuestionIdFromCompositeQuestionId(
        questionId
      );
      if (questionIdConstructed === id) {
        defaultSelectedOption = previousMarkedAnswers[questionId];
      }
    });
    return defaultSelectedOption;
  };

  const getHasSelectionChanged = (defaultSelectedOption?: ISelectedOption) => {
    return !(
      defaultSelectedOption &&
      _.isEqual(selectedOption.answers, defaultSelectedOption.answers) &&
      _.isEqual(selectedOption.comment, defaultSelectedOption.comment)
    );
  };

  if (timeOut && hasTimerExpired(startTime, timeOutTime)) {
    if (!timerExpiry) {
      setTimerExpiry(true);
    }
  }

  useEffect(() => {
    if (timerExpiry) {
      // const questionData = assessmentQuestion.data;
      // const { id } = questionData!;
      // const defaultSelectedOption:
      //   | ISelectedOption
      //   | undefined = getDefaultSelectedOption(id);
      // const hasSelectionChanged = getHasSelectionChanged(defaultSelectedOption);
      const resultUrl = `/result/${assessmentId}`;
      setNextUrl(resultUrl);
      const submitSuccess = handleSubmit();
      if (!submitSuccess) {
        props.history.push({
          pathname: resultUrl,
          state: { timerExpiry },
        });
      }
    }
  }, [timerExpiry]);

  const renderQuestionComponent = () => {
    const questionData = assessmentQuestion.data;
    const { id } = questionData!;
    const defaultSelectedOption:
      | ISelectedOption
      | undefined = getDefaultSelectedOption(id);
    const hasSelectionChanged = getHasSelectionChanged(defaultSelectedOption);
    return (
      <Container
        maxWidth='md'
        component='div'
        classes={{
          root: classes.containerRoot,
        }}
      >
        <Grid container>
          <Grid item md={2} />
          <Grid item xs={10} sm={10} md={8}>
            <div>
              <QuestionComponent
                setMarkedAnswer={setMarkedAnswer}
                data={questionData}
                markedOptions={defaultSelectedOption}
                questionIndex={index}
              />
              <Container
                component='div'
                classes={{
                  root: classes.navContainer,
                }}
              >
                {renderPreviousButton(hasSelectionChanged, index)}
                {systemDetails.mode !== constantValues.TRIAL_MODE &&
                  !timeOut &&
                  renderSaveAndCloseButton(hasSelectionChanged)}
                {renderActionButton(hasSelectionChanged)}
              </Container>
            </div>
          </Grid>
          <Grid item md={2}>
            {questionData && questionData.hint && questionData.hint !== '' ? (
              <Paper variant='outlined' square className={classes.sideHelp}>
                <div className={classes.centerAlignedDiv}>
                  <EmojiObjectsIcon fontSize='large' />
                </div>
                <br />
                <Typography>{questionData.hint} </Typography>
                <br />
                {questionData.hintURL &&
                questionData.hintURL.includes('youtube') ? (
                  <ReactPlayer
                    url={questionData.hintURL}
                    height='100%'
                    width='100%'
                  />
                ) : (
                  <MaterialLink
                    underline='always'
                    style={{ cursor: 'pointer' }}
                    onClick={() => openNewTabHintUrl(questionData.hintURL)}
                  >
                    <Typography className={classes.hintUrl}>
                      {questionData.hintURL}
                    </Typography>
                  </MaterialLink>
                )}
              </Paper>
            ) : (
              <div />
            )}
          </Grid>
        </Grid>
      </Container>
    );
  };
  const [currentNavigationItem, setCurrentNavigationItem] = useState(index);

  const handleNavBarClick = (event: number) => {
    if (event) {
      setCurrentNavigationItem(event.toString());
      props.history.push(
        `/assessment/${assessmentId}/question/${event.toString()}`
      );
    }
  };

  const renderNavButtons = () => {
    //        const env = process.env.REACT_APP_STAGE;
    return (
      <div className={classes.pagination}>
        <Pagination
          hideDisabled
          prevPageText={'<'}
          nextPageText={'>'}
          firstPageText={'<<'}
          lastPageText={'>>'}
          pageRangeDisplayed={10}
          activePage={parseInt(currentNavigationItem, 10)}
          itemsCountPerPage={1}
          totalItemsCount={maxAssessmentQuestions}
          onChange={handleNavBarClick}
          activeClass='active-li-item'
          activeLinkClass='active-link'
        />
      </div>
    );
  };

  // References: https://stackoverflow.com/questions/52394040/material-ui-override-step-icon-style
  // https://material-ui.com/components/steppers/#linear
  const renderStepper = () => {
    return (
      <Stepper
        nonLinear
        alternativeLabel
        className={classes.stepper}
        connector={<QontoConnector />}
      >
        {steps.map((label: any, i: number) => (
          <Step
            key={label}
            active={i === activeStep}
            completed={i <= completedStep}
          >
            <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    );
  };

  useEffect(() => {
    const mappedQuestionId: string = checkIfMappedQuestionExistForTheIndex(
      index,
      previousMarkedAnswers
    );
    if (mappedQuestionId !== '') {
      getAssessmentQuestion(
        assessmentId,
        index,
        assessmentType,
        questionnaireVersion,
        team,
        mappedQuestionId
      );
    } else {
      getAssessmentQuestion(
        assessmentId,
        index,
        assessmentType,
        questionnaireVersion,
        team
      );
    }
    setNextUrl(generateNextUrl(assessmentId, parseInt(index, 10)));
    setPrevUrl(generatePrevUrl(assessmentId, parseInt(index, 10)));
    setPrevQuesIndex(parseInt(index, 10) - 1);
    setNextQuesIndex(parseInt(index, 10) + 1);
  }, [index]);

  useEffect(() => {
    if (assessmentQuestion.status === 'success') {
      setStepperParameters();
    }
  }, [assessmentQuestion.data]);

  useEffect(() => {
    if (timeOut) {
      setCurrentPageValue(constantValues.QUESTION_PAGE_TIMED);
    } else {
      setCurrentPageValue(constantValues.QUESTION_PAGE_NOT_TIMED);
    }
    setActiveStep(Math.floor(parseInt(index, 10) / 5));
    setCompletedStep(-1);
    return () => {
      setCurrentPageValue('');
    };
  }, []);

  const setStepperParameters = () => {
    const numberOfMarkedAnswers = Object.keys(previousMarkedAnswers).length + 1;
    let currentCategoryNumber = 0;
    let categorySum = 0;
    const categoryArray = Object.keys(categories);
    // tslint:disable-next-line: no-increment-decrement
    for (let i = 0; i < categoryArray.length; i++) {
      categorySum = categorySum + categories[categoryArray[i]];
      if (numberOfMarkedAnswers <= categorySum) {
        currentCategoryNumber = i;
        break;
      }
    }
    setActiveStep(currentCategoryNumber);
    setCompletedStep(currentCategoryNumber - 1);
  };

  const redirectToLogin = () => {
    const error = JSON.stringify(assessmentQuestion!.error);
    const object = JSON.parse(error);
    if (object.code) {
      if (object.code === 401) {
        props.history.push('/relogin');
      } else {
        props.history.push('/error');
      }
    } else {
      props.history.push('/error');
    }
  };

  const isQuestionFetchSuccess = assessmentQuestion.status === 'success';
  const isQuestionFetchFailed = assessmentQuestion.status === 'fail';

  if (assessmentResult.status === 'success' && assessmentResult.data !== null) {
    props.history.push('/');
  }

  const handleModalYesClicked = () => {
    ReactGA.event({
      category: 'Assessment',
      action: 'Save and close',
      label: 'Question Index',
      value: parseInt(index, 10),
    });
    handleNext(
      saveAndCloseState.hasSelectionChanged,
      saveAndCloseState.url,
      saveAndCloseState.event
    );
  };

  const handleModalNoClicked = () => {
    setOpenModal(false);
  };

  const handleSaveAndClose = (
    hasSelectionChanged: boolean,
    url: string,
    event: any
  ) => {
    const isUserResponseValid = validateSelectedOption(selectedOption);
    if (isUserResponseValid) {
      setSaveAndCloseState({ hasSelectionChanged, url, event });
      setOpenModal(true);
    } else {
      openToastEvent(event);
    }
  };

  const handleCloseTimerWarning = () => {
    setShowTimerWarning(false);
  };

  return (
    <Container
      maxWidth='md'
      component='div'
      classes={{
        root: classes.containerRoot,
      }}
    >
      <Paper variant='outlined' className={classes.stepperAndHelpContainer}>
        <Grid container>
          <Grid item xs={12} md={12} lg={12}>
            <Grid container>
              <Grid item md={2} />
              <Grid item xs={10} sm={10} md={8}>
                {renderStepper()}
              </Grid>
              <Grid item md={2} />
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      {Object.keys(previousMarkedAnswers).length >= maxAssessmentQuestions - 1
        ? renderNavButtons()
        : ''}
      {isQuestionFetchFailed
        ? redirectToLogin()
        : isQuestionFetchSuccess
        ? renderQuestionComponent()
        : renderLoadingIcon()}
      <Popper open={openToast} anchorEl={anchorEl} placement='top' transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper>
              <Typography>{errorMessage.message}</Typography>
            </Paper>
          </Fade>
        )}
      </Popper>
      <ModalComponent
        message={'wantToClose'}
        openModal={openModal}
        handleModalYesClicked={handleModalYesClicked}
        handleModalNoClicked={handleModalNoClicked}
      />
      <ModalComponent
        message={'wantToContinueFromTheLastAttemptedQuestion'}
        openModal={openContinueModal}
        handleModalYesClicked={handleContinueModalYesClicked}
        handleModalNoClicked={handleContinueModalNoClicked}
      />
      <ModalComponent
        message={'notBeAbleToMakeAnyChangesAfterSubmittingTheAssessment'}
        openModal={submitNotifyModal}
        handleModalYesClicked={handleSubmitNotifyModalYesClicked}
        handleModalNoClicked={handleSubmitNotifyModalNoClicked}
      />
      <SnackbarBottomLeft
        open={showTimerWarning}
        message={timerWarningMessage}
        handleClose={handleCloseTimerWarning}
      />
    </Container>
  );
}

export default withRouter(QuestionRender);
