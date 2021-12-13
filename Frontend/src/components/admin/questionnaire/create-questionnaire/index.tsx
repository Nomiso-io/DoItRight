import React, { useState, Fragment } from 'react';
import {
  Typography,
  Grid,
  Button,
  makeStyles,
  MuiThemeProvider,
  SnackbarContent,
  Snackbar,
  FormControlLabel,
  Checkbox,
  Backdrop,
  CircularProgress,
  Tooltip,
  TextField,
} from '@material-ui/core';
import { buttonStyle, tooltipTheme } from '../../../../common/common';
import { ADMIN_HOME } from '../../../../pages/admin';
import { Http } from '../../../../utils';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../reducers';
import Success from '../../../success-page';
import { withRouter } from 'react-router-dom';
import MapQuestionsToQuestionnaires, {
  ICategoriesMap,
} from '../common/map_questions';
import ClearIcon from '@material-ui/icons/Clear';
import AddIcon from '@material-ui/icons/Add';
import { ModalComponent } from '../../../modal';
import InfoIcon from '@material-ui/icons/Info';
import DropDown from '../../../common/dropDown';
import { Text } from '../../../../common/Language';
import '../../../../css/assessments/style.css';

const warningTimePercentageArray = [0, 10, 15, 20, 25, 30, 35, 40, 45, 50];

export interface IQuestionnaireData {
  name: string;
  questionnaireId?: string;
  description: string;
  randomize: boolean;
  questions: string[];
  categories: string[];
  categoriesMap: {
    [questionId: string]: string;
  };
  timeOut?: boolean;
  timeOutTime?: number;
  warningTimePercentage?: number;
  hideResult?: boolean;
  showRecommendations: boolean;
  benchmarkScore?: number;
}

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
  backButton: {
    marginTop: '36px',
    position: 'relative',
    minWidth: '10%',
    marginRight: '20px',
    ...buttonStyle,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  messageContainer: {
    minHeight: '100%',
    position: 'relative',
  },
  message: {
    position: 'absolute',
    bottom: '0px',
    left: '0px',
    fontSize: '14px',
  },
}));

const CreateQuestionnaire = (props: any) => {
  const classes = useStyles();
  const [questionnairePosted, setQuestionnairePosted] = useState(false);
  const [failure, setFailure] = useState(false);
  const [categoryArray, setCategoryArray] = useState<string[]>(['']);
  const [mapQuestions, setMapQuestions] = useState(false);
  const [failureMessage, setFailureMessage] = useState(
    <Text tid='somethingWentWrong' />
  );
  const [showModal, setShowModal] = useState(false);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [created, setCreated] = useState(false);
  const [questionnaireId, setQuestionnaireId] = useState('');
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const emptyPostData: IQuestionnaireData = {
    name: '',
    description: '',
    randomize: false,
    categories: [],
    categoriesMap: {},
    questions: [],
    timeOut: false,
    timeOutTime: 0,
    warningTimePercentage: 0,
    hideResult: false,
    showRecommendations: false,
  };
  const [postData, setPostData] = useState<IQuestionnaireData>(emptyPostData);
  let msgFailure = failureMessage;
  let msgSuccess = <Text tid='questionnaireIsCreated' />;

  const handleSave = () => {
    if (postData.name === '') {
      setFailure(true);
      setFailureMessage(<Text tid='questionnaireNameCannotBeBlank' />);
    } else if (postData.description === '') {
      setFailure(true);
      setFailureMessage(<Text tid='questionnaireDescriptionCannotBeBlank' />);
    } else if (categoryArray.length === 1 && categoryArray[0] === '') {
      setFailure(true);
      setFailureMessage(<Text tid='addCategoriesToTheQuestionnaire' />);
    } else if (categoryArray.length < 2) {
      setFailure(true);
      setFailureMessage(<Text tid='atleastTwoCategoriesShouldBeThere' />);
    } else if (
      categoryArray.length === 2 &&
      categoryArray[categoryArray.length - 1] === ''
    ) {
      setFailure(true);
      setFailureMessage(<Text tid='atleastTwoCategoriesShouldBeThere' />);
    } else if (
      categoryArray.indexOf(categoryArray[categoryArray.length - 1]) !==
      categoryArray.length - 1
    ) {
      // here we are checking if the last category entered by user isn't already present in the categoryArray
      // Other elements are checked when the user presses the + button.
      setFailure(true);
      setFailureMessage(<Text tid='categoryAlreadyExists' />);
    } else if (postData.timeOut && !postData.timeOutTime) {
      setFailure(true);
      setFailureMessage(<Text tid='invalidTimeOutTime' />);
    } else if (
      postData.timeOut &&
      postData.timeOutTime &&
      postData.timeOutTime < 5
    ) {
      setFailure(true);
      setFailureMessage(
        <Text tid='timeOutTimeCannotBeLesserThanFiveMinutes' />
      );
    } else if (
      postData.benchmarkScore &&
      (postData.benchmarkScore < 50 || postData.benchmarkScore > 100)
    ) {
      setFailure(true);
      setFailureMessage(
        <Text tid='benchmarkScoreShouldHaveValueBetweenFiftyAndHundred' />
      );
      return {};
    } else {
      const validatedData = { ...postData };
      validatedData.categories = categoryArray;
      setPostData(validatedData);
      setBackdropOpen(true);
      if (Object.keys(validatedData).length > 0) {
        if (created) {
          Http.put({
            url: '/api/v2/questionnaire',
            body: {
              type: 'create',
              questionnaire: { ...validatedData, questionnaireId },
            },
            state: stateVariable,
          })
            .then((response: any) => {
              setBackdropOpen(false);
            })
            .catch((error) => {
              const perror = JSON.stringify(error);
              const object = JSON.parse(perror);
              if (object.code === 400) {
                setBackdropOpen(false);
                setFailureMessage(object.apiError.msg);
                setFailure(true);
              } else if (object.code === 401) {
                props.history.push('/relogin');
              } else {
                setBackdropOpen(false);
                setFailureMessage(<Text tid='somethingWentWrong' />);
                setFailure(true);
              }
            });
        } else {
          Http.post({
            url: '/api/v2/questionnaire',
            body: {
              type: 'create',
              questionnaire: validatedData,
            },
            state: stateVariable,
          })
            .then((response: any) => {
              setBackdropOpen(false);
              setShowModal(true);
              setCreated(true);
              setQuestionnaireId(response.questionnaireId);
            })
            .catch((error) => {
              const perror = JSON.stringify(error);
              const object = JSON.parse(perror);
              if (object.code === 400) {
                setBackdropOpen(false);
                setFailureMessage(object.apiError.msg);
                setFailure(true);
              } else if (object.code === 401) {
                props.history.push('/relogin');
              } else {
                setBackdropOpen(false);
                setFailureMessage(<Text tid='somethingWentWrong' />);
                setFailure(true);
              }
            });
        }
      }
    }
  };

  const handleModalYes = () => {
    setMapQuestions(true);
    setShowModal(false);
  };

  const handleModalNo = () => {
    props.goBack(ADMIN_HOME);
  };

  const validatePostData = (categoriesMapped: ICategoriesMap) => {
    if (postData.name === '') {
      setFailure(true);
      setFailureMessage(<Text tid='questionnaireNameCannotBeBlank' />);
      return {};
    }
    if (postData.description === '') {
      setFailure(true);
      setFailureMessage(<Text tid='questionnaireDescriptionCannotBeBlank' />);
      return {};
    }
    if (categoryArray.length < 2) {
      setFailure(true);
      setFailureMessage(<Text tid='atleastTwoCategoriesShouldBeThere' />);
      return {};
    }
    if (
      categoryArray.length === 2 &&
      categoryArray[categoryArray.length - 1] === ''
    ) {
      setFailure(true);
      setFailureMessage(<Text tid='atleastTwoCategoriesShouldBeThere' />);
      return {};
    }
    if (postData.benchmarkScore) {
      if (postData.benchmarkScore < 50 || postData.benchmarkScore > 100) {
        setFailure(true);
        setFailureMessage(
          <Text tid='benchmarkScoreShouldHaveValueBetweenFiftyAndHundred' />
        );
        return {};
      }
    }

    const postDataCopy = { ...postData };
    if (questionnaireId === '') {
      setFailure(true);
      setFailureMessage(<Text tid='somethingWentWrong' />);
      return {};
    }
    if (Object.keys(categoriesMapped).length === 0) {
      setFailure(true);
      setFailureMessage(<Text tid='mapQuestionsBeforeProceeding' />);
      return {};
    }
    const questionArray: string[] = [];
    Object.keys(categoriesMapped).forEach((el) => {
      questionArray.push(el);
    });
    questionArray.sort((a: string, b: string) => {
      return categoriesMapped[a] > categoriesMapped[b] ? 1 : -1;
    });
    postDataCopy.questions = questionArray;
    postDataCopy.categoriesMap = categoriesMapped;
    postDataCopy.questionnaireId = questionnaireId;
    setPostData(postDataCopy);
    return postDataCopy;
  };

  const handleCategoryChangeValue = (event: any, i: number) => {
    const categoryArrayCopy = [...categoryArray];
    categoryArrayCopy[i] = event.target.value;
    setCategoryArray(categoryArrayCopy);
  };

  const deleteCategory = (i: number) => {
    const categoryArrayCopy = [...categoryArray];
    categoryArrayCopy.splice(i, 1);
    setCategoryArray(categoryArrayCopy);
  };

  const addCategory = (i: number) => {
    if (categoryArray[categoryArray.length - 1] === '') {
      setFailure(true);
      setFailureMessage(<Text tid='enterValidCategory' />);
    } else {
      let validCategory = true;
      categoryArray.forEach((el: any, i: number) => {
        if (i < categoryArray.length - 1) {
          if (el === categoryArray[categoryArray.length - 1]) {
            validCategory = false;
          }
        }
      });
      if (validCategory) {
        const categoryArrayCopy = [...categoryArray];
        categoryArrayCopy.push('');
        setCategoryArray(categoryArrayCopy);
      } else {
        setFailure(true);
        setFailureMessage(<Text tid='categoryAlreadyExists' />);
      }
    }
  };

  const handleClose = () => {
    setFailure(false);
  };

  const handleNameChange = (event: any) => {
    const postDataCopy = { ...postData };
    postDataCopy.name = event.target.value;
    setPostData(postDataCopy);
  };

  const handleDescriptionChange = (event: any) => {
    const postDataCopy = { ...postData };
    postDataCopy.description = event.target.value;
    setPostData(postDataCopy);
  };

  const changeRandomize = (event: any) => {
    setPostData({ ...postData, randomize: !postData.randomize });
  };

  const changeHideResult = () => {
    setPostData({ ...postData, hideResult: !postData.hideResult });
  };

  const changeShowRecommendations = () => {
    setPostData({
      ...postData,
      showRecommendations: !postData.showRecommendations,
    });
  };

  const changeTimeOutFlag = (event: any) => {
    if (postData.timeOut) {
      setPostData({
        ...postData,
        timeOut: !postData.timeOut,
        timeOutTime: parseInt('', 10),
      });
    } else {
      setPostData({
        ...postData,
        timeOut: !postData.timeOut,
      });
    }
  };

  const updateTimeOutTime = (event: any) => {
    setPostData({ ...postData, timeOutTime: parseInt(event.target.value, 10) });
  };

  const updateWarningTimePercentage = (event: any) => {
    setPostData({
      ...postData,
      warningTimePercentage: parseInt(event.target.value, 10),
    });
  };

  const handleBenchmarkScoreChange = (event: any) => {
    setPostData({
      ...postData,
      benchmarkScore: parseInt(event.target.value, 10),
    });
  };

  const handleMapQuestionSubmit = (mappedQuestions: ICategoriesMap) => {
    const validatedData = validatePostData(mappedQuestions);
    if (Object.keys(validatedData).length > 0) {
      Http.put({
        url: '/api/v2/questionnaire',
        body: {
          type: 'create',
          questionnaire: validatedData,
        },
        state: stateVariable,
      })
        .then((response: any) => {
          setMapQuestions(false);
          setQuestionnairePosted(true);
        })
        .catch((error) => {
          setFailureMessage(<Text tid='somethingWentWrong' />);
          setFailure(true);
        });
    }
  };

  const handleMapQuestionsBackButton = () => {
    setMapQuestions(false);
  };

  const renderMapQuestions = () => {
    return (
      <MapQuestionsToQuestionnaires
        categories={categoryArray}
        onBack={handleMapQuestionsBackButton}
        onSubmit={handleMapQuestionSubmit}
        setErrorMessage={setError}
      />
    );
  };

  const setError = (errorMessage: any) => {
    setFailureMessage(errorMessage);
    setFailure(true);
  };

  const handleSuccessPageBackButton = () => {
    setQuestionnairePosted(false);
    setPostData(emptyPostData);
    setCategoryArray([]);
  };

  const renderCategories = (el: string, i: number) => {
    if (i === categoryArray.length - 1) {
      return (
        <Fragment key={i}>
          <Grid container spacing={3}>
            <Grid item xs={5}>
              <TextField
                required={categoryArray.length <= 2}
                type='string'
                id={i.toString()}
                name={i.toString()}
                value={el}
                label={'Category'}
                onChange={(event: any) => {
                  handleCategoryChangeValue(event, i);
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={1}>
              <div style={{ marginTop: '15px', cursor: 'pointer' }}>
                <AddIcon
                  fontSize='large'
                  onClick={() => {
                    addCategory(i);
                  }}
                />
              </div>
            </Grid>
          </Grid>
        </Fragment>
      );
    }
    return (
      <Fragment key={i}>
        <Grid container spacing={3}>
          <Grid item xs={5}>
            <TextField
              type='string'
              id={i.toString()}
              name={i.toString()}
              value={el}
              label={'Category'}
              onChange={(event: any) => {
                handleCategoryChangeValue(event, i);
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={1}>
            <div style={{ marginTop: '15px', cursor: 'pointer' }}>
              <ClearIcon
                fontSize='large'
                onClick={() => {
                  deleteCategory(i);
                }}
              />
            </div>
          </Grid>
        </Grid>
      </Fragment>
    );
  };

  const renderWarningTimePercentageDropDown = () => {
    return (
      <DropDown
        onChange={(event: any) => {
          updateWarningTimePercentage(event);
        }}
        disabled={postData.timeOut ? false : true}
        postFix={'%'}
        value={postData.warningTimePercentage}
        list={warningTimePercentageArray}
        label={'Choose the warning time(%)'}
        dropDownClass='dropdownWidth'
      />
    );
  };

  const renderWarningTime = () => {
    let warningTimeMinutes = 0;
    if (
      postData.warningTimePercentage &&
      postData.timeOutTime &&
      postData.warningTimePercentage > 0 &&
      postData.timeOutTime > 0
    ) {
      warningTimeMinutes =
        (postData.warningTimePercentage / 100) * postData.timeOutTime;
    }
    warningTimeMinutes = Math.floor(warningTimeMinutes);
    return (
      <div>
        <TextField
          className='textFieldStyle'
          multiline
          disabled
          fullWidth
          value={`Warning Time : ${warningTimeMinutes} ${
            warningTimeMinutes === 1 ? 'minute' : 'minutes'
          }`}
          variant='outlined'
        />
      </div>
    );
  };

  const renderRandomizeCheckbox = () => {
    return (
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={postData.randomize}
              onChange={changeRandomize}
              value='randomize'
            />
          }
          label={
            <Typography color='textSecondary'>
              <Text tid='randomize' />
            </Typography>
          }
        />
        <MuiThemeProvider theme={tooltipTheme}>
          <Tooltip
            title={
              <Typography className='tooltipTitleStyle'>
                <Text tid='theAnswersWillBeRandomizedWhenUserTakesTheAssessment' />
              </Typography>
            }
          >
            <InfoIcon className='infoIconStyle' />
          </Tooltip>
        </MuiThemeProvider>
      </div>
    );
  };

  const renderHideResultCheckbox = () => {
    return (
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={postData.hideResult}
              onChange={changeHideResult}
              value='hideResult'
              disabled={postData.showRecommendations}
            />
          }
          label={
            <Typography color='textSecondary'>
              <Text tid='hideResult' />
            </Typography>
          }
        />
        <MuiThemeProvider theme={tooltipTheme}>
          <Tooltip
            title={
              <Typography className='tooltipTitleStyle'>
                <Text tid='resultWillNotBeDisplayedAtTheEndOfTheAssessment' />
                <br />
                <strong>
                  <Text tid='note' /> &nbsp;
                </strong>
                <Text tid='optionDisabledWhenShowRecommendationsSelected' />
              </Typography>
            }
          >
            <InfoIcon className='infoIconStyle' />
          </Tooltip>
        </MuiThemeProvider>
      </div>
    );
  };

  const renderShowRecommendationCheckbox = () => {
    return (
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={postData.showRecommendations}
              onChange={changeShowRecommendations}
              value='Show Recommendation'
              disabled={postData.timeOut || postData.hideResult}
            />
          }
          label={
            <Typography color='textSecondary'>
              <Text tid='showRecommendations' />
            </Typography>
          }
        />
        <MuiThemeProvider theme={tooltipTheme}>
          <Tooltip
            title={
              <Typography className='tooltipTitleStyle'>
                <Text tid='recommendationsWillBeDisplayed' />
                <br />
                <strong>
                  <Text tid='note' /> &nbsp;
                </strong>
                <Text tid='hideResultSelected' />
              </Typography>
            }
          >
            <InfoIcon className='infoIconStyle' />
          </Tooltip>
        </MuiThemeProvider>
      </div>
    );
  };

  const questionnaireComponent = () => {
    if (questionnairePosted) {
      return (
        <Fragment>
          <Success message={msgSuccess} />
          <div className='bottomButtonsContainer'>
            <Button
              className={classes.backButton}
              variant='outlined'
              onClick={handleSuccessPageBackButton}
            >
              <Text tid='goBack' />
            </Button>
          </div>
        </Fragment>
      );
    }
    return (
      <Fragment>
        <Backdrop className={classes.backdrop} open={backdropOpen}>
          <CircularProgress color='inherit' />
        </Backdrop>
        <Grid container spacing={3} className={classes.grid}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              type='string'
              id='QuestionnaireName'
              name='QuestionnaireName'
              label='Questionnaire name'
              variant='outlined'
              value={postData.name}
              onChange={handleNameChange}
              fullWidth
              className='textFieldStyle'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <div className={classes.messageContainer}>
              <Typography
                variant='caption'
                className={classes.message}
                color='textSecondary'
              >
                <Text tid='questionnaireNameCannotBeChanged' />
              </Typography>
            </div>
          </Grid>
        </Grid>
        <Grid container spacing={3} className={classes.grid}>
          <Grid item xs={12}>
            <TextField
              required
              multiline
              id='description'
              name='description'
              variant='outlined'
              label='Questionnaire description'
              value={postData.description}
              onChange={handleDescriptionChange}
              fullWidth
            />
          </Grid>
        </Grid>
        {categoryArray.map((el: string, i: number) => {
          return renderCategories(el, i);
        })}
        <Grid container spacing={3} className={classes.grid}>
          <Grid item xs={2}>
            <TextField
              type='number'
              id='benchmarkScore'
              name='benchmarkScore'
              label='Benchmark Score'
              value={postData.benchmarkScore}
              onChange={handleBenchmarkScoreChange}
              InputProps={{ disableUnderline: true }}
              fullWidth
            />
          </Grid>
        </Grid>
        <Grid container spacing={5} className={classes.grid}>
          <Grid item xs={3}>
            <div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={postData.timeOut}
                    onChange={changeTimeOutFlag}
                    value='Timed'
                    disabled={postData.showRecommendations}
                  />
                }
                label={
                  <Typography color='textSecondary'>
                    <Text tid='timed' />
                  </Typography>
                }
              />
              <MuiThemeProvider theme={tooltipTheme}>
                <Tooltip
                  title={
                    <Typography className='tooltipTitleStyle'>
                      <Text tid='assessmentWillBeTimed' />

                      <br />
                      <strong>
                        <Text tid='note' /> &nbsp;
                      </strong>
                      <Text tid='optionDisabledWhenShowRecommendationsSelected' />
                    </Typography>
                  }
                >
                  <InfoIcon className='infoIconStyle' />
                </Tooltip>
              </MuiThemeProvider>
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className='numberInput'>
              <TextField
                required={postData.timeOut ? false : true}
                type='number'
                id='timeOutTime'
                name='timeOutTime'
                label='Time-Out Time(minutes)'
                fullWidth
                value={postData.timeOutTime}
                onChange={updateTimeOutTime}
                disabled={postData.timeOut ? false : true}
                InputProps={{ disableUnderline: true }}
                className='textFieldStyle'
              />
            </div>
          </Grid>
        </Grid>
        <Grid container spacing={5} className={classes.grid}>
          <Grid item xs={3}>
            {renderWarningTimePercentageDropDown()}
          </Grid>
          <Grid item xs={3}>
            {renderWarningTime()}
          </Grid>
        </Grid>
        <Grid container spacing={3} className={classes.grid}>
          <Grid item xs={4}>
            {renderRandomizeCheckbox()}
          </Grid>
          <Grid item xs={4}>
            {renderHideResultCheckbox()}
          </Grid>
          <Grid item xs={4}>
            {renderShowRecommendationCheckbox()}
          </Grid>
        </Grid>
        <div className='bottomButtonsContainer'>
          <Button
            className={classes.backButton}
            variant='outlined'
            onClick={() => {
              props.goBack(ADMIN_HOME);
            }}
          >
            <Text tid='goBack' />
          </Button>
          <Button
            className={classes.button}
            onClick={handleSave}
            variant='outlined'
          >
            <Text tid='save' />
          </Button>
        </div>
        <ModalComponent
          message={'mapQuestionsToTheSavedQuestionnaire'}
          openModal={showModal}
          handleModalNoClicked={handleModalNo}
          handleModalYesClicked={handleModalYes}
        />
      </Fragment>
    );
  };
  return (
    <Fragment>
      {mapQuestions ? renderMapQuestions() : questionnaireComponent()}
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
    </Fragment>
  );
};

export default withRouter(CreateQuestionnaire);
