import React, { useState, useEffect, Fragment } from 'react';
import {
  Typography,
  Grid,
  FormControlLabel,
  TextField,
  Checkbox,
  Button,
  makeStyles,
  MuiThemeProvider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  SnackbarContent,
  Tooltip,
} from '@material-ui/core';
import { Http } from '../../../utils';
import { MANAGE_QUESTION } from '../../../pages/admin';
import { IRootState } from '../../../reducers';
import { useSelector } from 'react-redux';
import Success from '../../success-page';
import { withRouter } from 'react-router-dom';
import { buttonStyle, tooltipTheme } from '../../../common/common';
import {
  IQuestionDetails,
  IAnswer,
  IAnswers,
  numberOfOptionsArray,
} from '../create-question';
import DropDown from '../../common/dropDown';
import { ModalComponent } from '../../modal';
import InfoIcon from '@material-ui/icons/Info';
import { Text } from '../../../common/Language';
import '../../../css/assessments/style.css';

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: '36px',
    position: 'relative',
    minWidth: '10%',
    ...buttonStyle,
  },
  grid: {
    marginTop: theme.spacing(2),
  },
  formContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: '10px',
  },
  formControl: {
    minWidth: '100%',
  },
  backButton: {
    marginTop: '36px',
    position: 'relative',
    minWidth: '10%',
    marginRight: '20px',
    ...buttonStyle,
  },
}));

const EditQuestion = (props: any) => {
  const classes = useStyles();
  const emptyAnswer: IAnswer = {
    answer: '',
    weightageFactor: 1,
  };
  const [answerVariable, setAnswerVariable] = useState<IAnswer[]>([
    emptyAnswer,
  ]);
  const [questionPosted, setQuestionPosted] = useState(false);
  const [failure, setFailure] = useState(false);
  const [failureMessage, setFailureMessage] = useState(
    <Text tid='somethingWentWrong' />
  );
  const [postData, setPostData] = useState<IQuestionDetails>(props.question);
  const [numberOfOptions, setNumberOfOptions] = useState(
    Object.keys(props.question.answers).length
  );
  const [proposedNumberOfOptions, setProposedNumberOfOptions] = useState(0);
  const [weightageFactorArray, setWeightFactorArray] = useState(
    Array.from(
      Array(Object.keys(props.question.answers).length),
      (val, num) => num + 1
    )
  );
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [firstNumberOfOptionsChange, setFirstNumberOfOptionsChange] = useState(
    true
  );
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  let msgFailure = failureMessage;
  let msgSuccess = <Text tid='questionIsUpdated' />;

  useEffect(() => {
    const tempAnswerArray: IAnswer[] = [];
    Object.keys(props.question.answers).forEach((el) => {
      tempAnswerArray.push(props.question.answers[el]);
    });
    tempAnswerArray.sort((a: IAnswer, b: IAnswer) => {
      return a.weightageFactor - b.weightageFactor;
    });
    setAnswerVariable(tempAnswerArray);
  }, []);

  const handleAnswerChangeValue = (event: any, i: number) => {
    const answerCopy = [...answerVariable];
    answerCopy[i].answer = event.target.value;
    setAnswerVariable(answerCopy);
  };

  const handleWeightageChangeValue = (event: any, i: number) => {
    const answerCopy = [...answerVariable];
    answerCopy[i].weightageFactor = parseInt(event.target.value, 10);
    setAnswerVariable(answerCopy);
  };

  const validatePostData = () => {
    if (postData.question === '') {
      setFailure(true);
      setFailureMessage(<Text tid='questionCannotBeEmpty' />);
      return {};
    }
    if (answerVariable.length < 2) {
      setFailure(true);
      setFailureMessage(<Text tid='atleastTwoAnswerOptions' />);
      return {};
    }
    const answersValid = validateAnswers();
    if (!answersValid) {
      return {};
    }
    if (postData.comments === '') {
      setFailure(true);
      setFailureMessage(<Text tid='recommendationsCannotBeEmpty' />);
      return {};
    }
    const answersData: IAnswers = {};
    answerVariable.forEach((el: IAnswer, i: number) => {
      answersData[`ans${i + 1}`] = el;
    });
    return { ...postData, answers: answersData };
  };

  const validateAnswers = () => {
    let validWeightage = true;
    let validAnswer = true;
    let iteration = 0;
    for (const answer of answerVariable) {
      if (answer.answer === '') {
        setFailure(true);
        setFailureMessage(<Text tid='answerCannotBeBlank' />);
        return false;
      }
      if (!weightageFactorArray.includes(answer.weightageFactor)) {
        setFailure(true);
        setFailureMessage(<Text tid='weightageFactorCannotBeBlank' />);
        return false;
      }
      answerVariable.forEach((el, i: number) => {
        if (i !== iteration) {
          if (
            el.weightageFactor === answer.weightageFactor &&
            postData.type === 'select'
          ) {
            validWeightage = false;
          } else if (el.answer === answer.answer) {
            validAnswer = false;
          }
        }
      });
      iteration = iteration + 1;
    }
    if (validWeightage && validAnswer) {
      return true;
    }
    if (!validAnswer) {
      setFailure(true);
      setFailureMessage(<Text tid='answerMustBeUnique' />);
      return false;
    }
    setFailure(true);
    setFailureMessage(<Text tid='useDistinctWeightages' />);
    return false;
  };

  const handleSubmit = () => {
    const dataValid = validatePostData();
    if (Object.keys(dataValid).length > 0) {
      Http.put({
        url: `/api/v2/admin/createquestion`,
        body: {
          ...dataValid,
        },
        state: stateVariable,
      })
        .then((response: any) => {
          setQuestionPosted(true);
        })
        .catch((error) => {
          const perror = JSON.stringify(error);
          const object = JSON.parse(perror);
          if (object.code === 400) {
            setFailureMessage(object.apiError.msg);
            setFailure(true);
          } else if (object.code === 401) {
            props.history.push('/relogin');
          } else {
            setFailureMessage(<Text tid='somethingWentWrong' />);
            setFailure(true);
          }
        });
    }
  };

  const handleChangeLevelValue = (event: any) => {
    setPostData({ ...postData, level: event.target.value });
  };

  const changeNaFlag = () => {
    setPostData({ ...postData, NA: !postData.NA });
  };

  const changeReasonFlag = () => {
    setPostData({ ...postData, reason: !postData.reason });
  };

  const changeMultiSelect = () => {
    if (postData.type === 'select') {
      setPostData({ ...postData, type: 'multi-select' });
    } else {
      setPostData({ ...postData, type: 'select', numberOfAnswers: 1 });
    }
  };

  const updateQuestionName = (event: any) => {
    setPostData({ ...postData, question: event.target.value });
  };

  const updateRecommendation = (event: any) => {
    setPostData({ ...postData, comments: event.target.value });
  };

  const updateHint = (event: any) => {
    setPostData({ ...postData, hint: event.target.value });
  };

  const updateHintUrl = (event: any) => {
    setPostData({ ...postData, hintURL: event.target.value });
  };

  const updateNumberOfAnswers = (event: any) => {
    setPostData({ ...postData, numberOfAnswers: parseInt(event.target.value) });
  };

  const updateThresholdScore = (event: any) => {
    setPostData({ ...postData, thresholdScore: parseInt(event.target.value) });
  };

  const handleClose = () => {
    setFailure(false);
  };

  const confirmationModalYesClicked = () => {
    setNumberOfOptions(proposedNumberOfOptions);
    setOpenConfirmationModal(false);
  };

  const confirmationModalNoClicked = () => {
    setOpenConfirmationModal(false);
  };

  useEffect(() => {
    if (firstNumberOfOptionsChange) {
      setFirstNumberOfOptionsChange(false);
    } else {
      if (answerVariable.length > numberOfOptions) {
        const difference = answerVariable.length - numberOfOptions;
        const answerVariableCopy = [...answerVariable];
        answerVariableCopy.splice(
          answerVariable.length - difference,
          difference
        );
        setAnswerVariable(answerVariableCopy);
      }
      if (answerVariable.length < numberOfOptions) {
        const difference = numberOfOptions - answerVariable.length;
        const answerVariableCopy = [...answerVariable];
        for (let i = 0; i < difference; i = i + 1) {
          answerVariableCopy.push({ ...emptyAnswer });
        }
        setAnswerVariable(answerVariableCopy);
      }
      setWeightFactorArray(
        Array.from(Array(numberOfOptions), (val, num) => num + 1)
      );
    }
  }, [numberOfOptions]);

  const handleNumberOfOptionsChange = (event: any) => {
    const newNumberOfOptions = event.target.value;
    if (newNumberOfOptions >= 2) {
      if (newNumberOfOptions >= answerVariable.length) {
        setNumberOfOptions(newNumberOfOptions);
      } else {
        setProposedNumberOfOptions(newNumberOfOptions);
        setOpenConfirmationModal(true);
      }
    }
  };

  const renderAnswers = (el: IAnswer, i: number) => {
    return (
      <Fragment key={i}>
        <form className={classes.formContainer} noValidate autoComplete='off'>
          <Grid container spacing={3}>
            <Grid item xs={9}>
              <TextField
                multiline
                variant='outlined'
                type='string'
                id={i.toString()}
                name={i.toString()}
                value={el.answer}
                label={'Answer'}
                onChange={(event: any) => {
                  handleAnswerChangeValue(event, i);
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <DropDown
                onChange={(event: any) => {
                  handleWeightageChangeValue(event, i);
                }}
                value={el.weightageFactor}
                list={weightageFactorArray}
                label={'Choose Weightage Factor'}
                dropDownClass='dropdownWidth'
              />
            </Grid>
          </Grid>
        </form>
      </Fragment>
    );
  };

  const renderChooseNumberOfOptions = () => {
    return (
      <DropDown
        onChange={(event: any) => {
          handleNumberOfOptionsChange(event);
        }}
        value={numberOfOptions}
        list={numberOfOptionsArray}
        label={'Choose Total Number Of Options'}
        dropDownClass='dropdownWidth'
      />
    );
  };

  const questionComponent = () => {
    if (questionPosted) {
      return (
        <Fragment>
          <Success message={msgSuccess} />
          <div className='bottomButtonsContainer'>
            <Button
              className={classes.backButton}
              variant='outlined'
              onClick={() => {
                props.goBack(MANAGE_QUESTION);
              }}
            >
              <Text tid='goBack' />
            </Button>
          </div>
        </Fragment>
      );
    }
    return (
      <Fragment>
        <Grid container spacing={3} className={classes.grid}>
          <Grid item xs={12} sm={12}>
            <TextField
              required
              multiline
              variant='outlined'
              id='QuestionName'
              name='QuestionName'
              label='Question'
              fullWidth
              onChange={updateQuestionName}
              value={postData.question}
            />
          </Grid>
        </Grid>
        <br />
        <Grid container spacing={3}>
          <Grid item xs={3} sm={3}>
            {renderChooseNumberOfOptions()}
          </Grid>
          <Grid item xs={6} sm={6} />
          <Grid item xs={3} sm={3}>
            <MuiThemeProvider theme={tooltipTheme}>
              <Tooltip
                title={
                  <Typography className='tooltipTitleStyle'>
                    <Text tid='selectTheWeightageFactor' />
                  </Typography>
                }
                placement='right'
              >
                <InfoIcon className='infoIconStyle' />
              </Tooltip>
            </MuiThemeProvider>
          </Grid>
        </Grid>
        {answerVariable.map((el: IAnswer, i: number) => renderAnswers(el, i))}
        <Grid container spacing={3} className={classes.grid}>
          <Grid item xs={12}>
            <TextField
              required
              multiline
              variant='outlined'
              id='recommendation'
              name='recommendation'
              label='Add recommendation'
              value={postData.comments}
              fullWidth
              onChange={updateRecommendation}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3} className={classes.grid}>
          <Grid item xs={12} sm={12}>
            <TextField
              multiline
              variant='outlined'
              id='hint'
              name='hint'
              label='Add hint'
              onChange={updateHint}
              value={postData.hint}
              fullWidth
            />
          </Grid>
        </Grid>
        <Grid container spacing={3} className={classes.grid}>
          <Grid item xs={12} sm={6}>
            <TextField
              multiline
              variant='outlined'
              id='hintUrl'
              name='hintUrl'
              label='Add hint-url'
              onChange={updateHintUrl}
              value={postData.hintURL}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl className={classes.formControl}>
              <InputLabel id='demo-simple-select-label' required={true}>
                <Text tid='level' />
              </InputLabel>
              <Select
                name={'level'}
                value={postData.level}
                onChange={handleChangeLevelValue}
              >
                <MenuItem key={'High'} value={'High'}>
                  <Text tid='high' />
                </MenuItem>
                <MenuItem key={'Medium'} value={'Medium'}>
                  <Text tid='medium' />
                </MenuItem>
                <MenuItem key={'Low'} value={'Low'}>
                  <Text tid='low' />
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              type='number'
              id='thresholdScore'
              name='thresholdScore'
              label='Threshold Score'
              fullWidth
              value={postData.thresholdScore}
              onChange={updateThresholdScore}
              InputProps={{ disableUnderline: true }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={postData.type === 'multi-select'}
                  onChange={changeMultiSelect}
                  value='multi-select'
                />
              }
              label={
                <Typography color='textSecondary'>
                  <Text tid='multiSelect' />
                </Typography>
              }
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              required
              type='number'
              id='numberOfAnswers'
              name='numberOfAnswers'
              label='Number Of Answers'
              fullWidth
              value={postData.numberOfAnswers}
              onChange={updateNumberOfAnswers}
              disabled={postData.type === 'select'}
              InputProps={{ disableUnderline: true }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={postData.NA}
                    onChange={changeNaFlag}
                    value='na'
                  />
                }
                label={
                  <Typography color='textSecondary'>
                    <Text tid='addNotApplicableOption' />
                  </Typography>
                }
              />
            </div>
          </Grid>
        </Grid>
        <Grid container spacing={3} className={classes.grid}>
          <Grid item xs={12} sm={6}>
            {/* <div className={classes.smallFlexContainer}> */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={postData.reason}
                  onChange={changeReasonFlag}
                  value='reason'
                />
              }
              label={
                <Typography color='textSecondary'>
                  <Text tid='reason' />
                </Typography>
              }
            />
            <MuiThemeProvider theme={tooltipTheme}>
              <Tooltip
                title={
                  <Typography className='tooltipTitleStyle'>
                    <Text tid='reasonForThisSelection' />
                  </Typography>
                }
                placement='right'
              >
                <InfoIcon className='infoIconStyle' />
              </Tooltip>
            </MuiThemeProvider>
            {/* </div> */}
          </Grid>
        </Grid>
        <div className='bottomButtonsContainer'>
          <Button
            className={classes.backButton}
            variant='outlined'
            onClick={() => {
              props.goBack(MANAGE_QUESTION);
            }}
          >
            <Text tid='goBack' />
          </Button>
          <Button
            className={classes.button}
            onClick={handleSubmit}
            variant='outlined'
          >
            <Text tid='save' />
          </Button>
        </div>
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
        <ModalComponent
          openModal={openConfirmationModal}
          message={'deleteTheExtraNumberOfOptionsFromTheEnd'}
          handleModalNoClicked={confirmationModalNoClicked}
          handleModalYesClicked={confirmationModalYesClicked}
        />
      </Fragment>
    );
  };

  return questionComponent();
};

export default withRouter(EditQuestion);
