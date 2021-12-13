import React, { useState, useEffect, Fragment } from 'react';
import {
  Typography,
  Grid,
  TextField,
  Button,
  makeStyles,
  MuiThemeProvider,
  SnackbarContent,
  Snackbar,
  FormControlLabel,
  Checkbox,
  Container,
  Backdrop,
  CircularProgress,
  Tooltip,
} from '@material-ui/core';
import { buttonStyle, tooltipTheme } from '../../../../common/common';
import ClearIcon from '@material-ui/icons/Clear';
import AddIcon from '@material-ui/icons/Add';
import { MANAGE_QUESTIONNAIRES } from '../../../../pages/admin';
import { Http } from '../../../../utils';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../reducers';
import Success from '../../../success-page';
import { withRouter } from 'react-router-dom';
import MapQuestionsToQuestionnaires, {
  ICategoriesMap,
} from '../common/map_questions';
import { Loader } from '../../..';
import { IQuestionnaireData } from '../create-questionnaire';
import { ModalComponent } from '../../../modal';
import InfoIcon from '@material-ui/icons/Info';
import { useActions, setAppBarCenterText } from '../../../../actions';
import DropDown from '../../../common/dropDown';
import { Text } from '../../../../common/Language';
import '../../../../css/assessments/style.css';

const warningTimePercentageArray = [0, 10, 15, 20, 25, 30, 35, 40, 45, 50];

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: '36px',
    position: 'relative',
    minWidth: '10%',
    marginRight: '20px',
    ...buttonStyle,
  },
  grid: {
    marginTop: theme.spacing(2),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

const EditQuestionnaire = (props: any) => {
  const classes = useStyles();
  const [questionnairePosted, setQuestionnairePosted] = useState(false);
  const [categoryArray, setCategoryArray] = useState<string[]>(['']);
  const [dataFetched, setDataFetched] = useState(false);
  const [failure, setFailure] = useState(false);
  const [mapQuestions, setMapQuestions] = useState(false);
  const [failureMessage, setFailureMessage] = useState(
    <Text tid='somethingWentWrong' />
  );
  const [showModal, setShowModal] = useState(false);
  const [backdropOpen, setBackdropOpen] = useState(false);
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
  const setCenterDisplayText = useActions(setAppBarCenterText);
  let msgFailure = failureMessage;
  let msgSuccess = <Text tid='questionnaireIsUpdated' />;

  useEffect(() => {
    setMapQuestions(props.isMapQuestions);
    setCenterDisplayText(props.questionnaire.name);
    Http.get({
      url: `/api/v2/questionnaire?questionnaireId=${props.questionnaire.questionnaireId}&questionnaireVersion=${props.questionnaire.version}`,
      state: stateVariable,
    })
      .then((response: any) => {
        setPostData(response);
        setCategoryArray([...response.categories, '']);
        setDataFetched(true);
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

    return () => {
      setCenterDisplayText('');
    };
  }, []);

  const handleSave = (isMapQuestion?: boolean) => {
    if (postData.name === '') {
      setFailure(true);
      setFailureMessage(<Text tid='questionnaireNameCannotBeBlank' />);
    } else if (postData.description === '') {
      setFailure(true);
      setFailureMessage(<Text tid='questionnaireDescriptionCannotBeBlank' />);
    } else if (categoryArray.length === 1 && categoryArray[0] === '') {
      setFailure(true);
      setFailureMessage(<Text tid='addCategoriesToTheQuestionnaire' />);
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
      validatedData.categories = [...categoryArray];
      const indexOfNullString = validatedData.categories.indexOf('');
      if (indexOfNullString >= 0) {
        validatedData.categories.splice(indexOfNullString, 1);
      }
      // console.log(validatedData);
      setPostData(validatedData);
      setBackdropOpen(true);
      if (Object.keys(validatedData).length > 0) {
        Http.put({
          url: '/api/v2/questionnaire',
          body: {
            type: 'update',
            questionnaire: validatedData,
          },
          state: stateVariable,
        })
          .then((response: any) => {
            setBackdropOpen(false);
            if (isMapQuestion) {
              setMapQuestions(true);
            } else {
              setShowModal(true);
            }
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
  };

  const changeShowRecommendations = () => {
    setPostData({
      ...postData,
      showRecommendations: !postData.showRecommendations,
    });
  };

  const handleBenchmarkScoreChange = (event: any) => {
    setPostData({
      ...postData,
      benchmarkScore: parseInt(event.target.value, 10),
    });
  };

  const handleMapQuestionsButton = () => {
    handleSave(true);
  };

  const handleModalYes = () => {
    setMapQuestions(true);
  };

  const handleModalNo = () => {
    props.goBack(MANAGE_QUESTIONNAIRES);
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
    postDataCopy.categories = categoryArray;
    const indexOfNullString = postDataCopy.categories.indexOf('');
    if (indexOfNullString >= 0) {
      postDataCopy.categories.splice(indexOfNullString, 1);
    }
    setPostData(postDataCopy);
    return postDataCopy;
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

  const handleCategoryChangeValue = (
    event: any,
    i: number,
    categoryName: string
  ) => {
    const categoryArrayCopy = [...categoryArray];
    categoryArrayCopy[i] = event.target.value;
    setCategoryArray(categoryArrayCopy);
  };

  const deleteCategory = (i: number, categoryName: string) => {
    let isMapped = false;
    Object.keys(postData.categoriesMap).forEach((el: string) => {
      if (postData.categoriesMap[el] === categoryName) {
        isMapped = true;
      }
    });
    if (isMapped) {
      setFailure(true);
      setFailureMessage(<Text tid='cannotDeleteCategoryMappedToQuestion' />);
    } else {
      const categoryArrayCopy = [...categoryArray];
      categoryArrayCopy.splice(i, 1);
      setCategoryArray(categoryArrayCopy);
    }
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

  const handleMapQuestionSubmit = (mappedQuestions: ICategoriesMap) => {
    const validatedData = validatePostData(mappedQuestions);
    if (Object.keys(validatedData).length > 0) {
      Http.put({
        url: '/api/v2/questionnaire',
        body: {
          type: 'update',
          questionnaire: validatedData,
        },
        state: stateVariable,
      })
        .then((response: any) => {
          setMapQuestions(false);
          setQuestionnairePosted(true);
        })
        .catch((error) => {
          const perror = JSON.stringify(error);
          const object = JSON.parse(perror);
          if (object.code === 400) {
            setFailureMessage(object.apiError.msg);
            setFailure(true);
          } else if (object.code === 401) {
            props.history.push('/relogin');
          } else if (perror === '{}') {
            setMapQuestions(false);
            setQuestionnairePosted(true);
          } else {
            setFailureMessage(<Text tid='somethingWentWrong' />);
            setFailure(true);
          }
        });
    }
  };

  const setError = (errorMessage: any) => {
    setFailureMessage(errorMessage);
    setFailure(true);
  };

  const handleMapQuestionsBackButton = () => {
    if (props.isMapQuestions) {
      props.goBack(MANAGE_QUESTIONNAIRES);
    } else {
      setMapQuestions(false);
    }
  };

  const renderMapQuestions = () => {
    props.handleMapQuestionStandalone(props.questionnaire);
    return (
      <MapQuestionsToQuestionnaires
        questionnaire={`${props.questionnaire.name} v${props.questionnaire.version}`}
        categories={categoryArray}
        categoriesMap={postData.categoriesMap}
        onBack={handleMapQuestionsBackButton}
        onSubmit={handleMapQuestionSubmit}
        setErrorMessage={setError}
      />
    );
  };

  const handleSuccessPageBackButton = () => {
    props.goBack(MANAGE_QUESTIONNAIRES);
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
                  handleCategoryChangeValue(event, i, el);
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
              disabled={true}
              label={'Category'}
              onChange={(event: any) => {
                handleCategoryChangeValue(event, i, el);
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={1}>
            <div style={{ marginTop: '15px', cursor: 'pointer' }}>
              <ClearIcon
                fontSize='large'
                onClick={() => {
                  deleteCategory(i, el);
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
          label={<Typography color='textSecondary'>Randomize</Typography>}
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
          label={<Typography color='textSecondary'>Hide Result</Typography>}
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
              className={classes.button}
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
              disabled={true}
              fullWidth
              className='textFieldStyle'
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              multiline
              id='description'
              name='description'
              label='Questionnaire description'
              value={postData.description}
              onChange={handleDescriptionChange}
              variant='outlined'
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
                label={<Typography color='textSecondary'>Timed</Typography>}
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
            className={classes.button}
            variant='outlined'
            onClick={() => {
              props.goBack(MANAGE_QUESTIONNAIRES);
            }}
          >
            <Text tid='goBack' />
          </Button>
          <Button
            className={classes.button}
            onClick={() => {
              handleSave(false);
            }}
            variant='outlined'
          >
            <Text tid='save' />
          </Button>
          <Button
            className={classes.button}
            onClick={handleMapQuestionsButton}
            variant='outlined'
          >
            <Text tid='mapQuestions' />
          </Button>
        </div>
        <ModalComponent
          message={'editTheQuestionsMappingOfUpdatedQuestionnaire'}
          openModal={showModal}
          handleModalNoClicked={handleModalNo}
          handleModalYesClicked={handleModalYes}
        />
      </Fragment>
    );
  };

  return (
    <Fragment>
      {dataFetched ? (
        mapQuestions ? (
          renderMapQuestions()
        ) : (
          questionnaireComponent()
        )
      ) : (
        <Container className='loaderStyle'>
          <Loader />
        </Container>
      )}
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

export default withRouter(EditQuestionnaire);
