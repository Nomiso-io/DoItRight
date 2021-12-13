import React, { Fragment, useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Grid,
  Button,
  makeStyles,
  Theme,
  createStyles,
  Paper,
  Container,
  FormControl,
  Select,
  MenuItem,
  MuiThemeProvider,
  ExpansionPanel,
  ExpansionPanelSummary,
  Typography,
  ExpansionPanelDetails,
  Divider,
  ExpansionPanelActions,
  Tooltip,
  InputBase,
  IconButton,
} from '@material-ui/core';
import { buttonStyle, tooltipTheme } from '../../../../common/common';
import { Http } from '../../../../utils';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../reducers';
import { Loader } from '../../..';
import { IQuestionDetails } from '../../create-question';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import clsx from 'clsx';
import DoneIcon from '@material-ui/icons/Done';
import { ModalComponent } from '../../../modal';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import RenderPagination from '../../../common/pagination';
import PageSizeDropDown from '../../../common/page-size-dropdown';
import FilterListIcon from '@material-ui/icons/FilterList';
import { LightTooltip } from '../../../common/tooltip';
import { Text } from '../../../../common/Language';
import '../../../../css/assessments/style.css';

export interface ICategoriesMap {
  [questionId: string]: string;
}
const HIGHLIGHT_BACKGROUND_COLOR = '#EAF5C8';
const HEADER_TEXT_MARGIN_TOP = '17px';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: 'auto',
    },
    subPaper: {
      minWidth: '95%',
      minHeight: '10%',
      borderRadius: '0',
      padding: '8px',
      margin: '10px',
      color: 'inherit',
      backgroundColor: 'inherit',
    },
    submitButton: {
      marginTop: '36px',
      position: 'relative',
      minWidth: '10%',
      ...buttonStyle,
    },
    backButton: {
      marginTop: '36px',
      position: 'relative',
      minWidth: '10%',
      marginRight: '20px',
      ...buttonStyle,
    },
    formControl: {
      minWidth: '100%',
    },
    rootp: {
      width: '100%',
      marginTop: '4px',
    },
    column: {
      flexBasis: '25%',
    },
    bigColumn: {
      flexBasis: '75%',
    },
    extraBigColumn: {
      flexBasis: '87.5%',
    },
    smallColumn: {
      flexBasis: '12.5%',
    },
    helper: {
      borderLeft: `2px solid ${theme.palette.divider}`,
      padding: theme.spacing(1, 2),
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    },
    detailsHighlighted: {
      alignItems: 'center',
      backgroundColor: HIGHLIGHT_BACKGROUND_COLOR,
    },
    detailsNonHighlighted: {
      alignItems: 'center',
    },
    highlighted: {
      backgroundColor: HIGHLIGHT_BACKGROUND_COLOR,
    },
    nonHighlighted: {
      color: 'inherit',
      backgroundColor: 'inherit',
    },
    categoryDropDown: {
      color: 'inherit',
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    searchRoot: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'inherit',
      boxShadow: 'none',
    },
    noResultsContainer: {
      width: '100%',
      height: '5%',
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center',
    },
    searchContainer: {
      marginTop: '10px',
    },
    title: {
      marginTop: HEADER_TEXT_MARGIN_TOP,
    },
    paginationContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterIcon: {
      marginTop: HEADER_TEXT_MARGIN_TOP,
      marginLeft: '30px',
      cursor: 'pointer',
    },
  })
);

const MapQuestionsToQuestionnaires = (props: any) => {
  const classes = useStyles();
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [responseReceived, setResponseReceived] = useState(false);
  const [questionBankInitial, setQuestionBankInitial] = useState<
    IQuestionDetails[]
  >([]);
  const [questionBank, setQuestionBank] = useState<IQuestionDetails[]>([]);
  const [mappedQuestions, setMappedQuestions] = useState<IQuestionDetails[]>(
    []
  );
  // const [backdropOpen, setBackdropOpen] = useState(false);
  const [categoriesMap, setCategoriesMap] = useState<ICategoriesMap>(
    props.categoriesMap ? props.categoriesMap : {}
  );
  const [showModal, setShowModal] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [searchResults, setSearchResults] = useState<IQuestionDetails[]>([]);
  const [searchButtonPressed, setSearchButtonPressed] = useState(false);
  const [isNoResultFound, setIsNoResultFound] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [showMappedQuestionsOnly, setShowMappedQuestionsOnly] = useState(false);
  const [itemLimit, setItemLimit] = useState({
    lowerLimit: 0,
    upperLimit: 9,
  });

  useEffect(() => {
    let url: string = '/api/v2/admin/createquestion';
    Http.get({
      url,
      state: stateVariable,
    })
      .then((response: any) => {
        setQuestionBank(response);
        setQuestionBankInitial(response);
        setNumberOfQuestions(response.length);
        setResponseReceived(true);
        fillMappedQuestions(response);
        // setBackdropOpen(false);
      })
      .catch((error: any) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          props.history.push('/relogin');
        } else if (object.code === 400) {
          props.history.push('/relogin');
        } else {
          props.history.push('/error');
        }
        // setBackdropOpen(false);
      });
  }, []);

  useEffect(() => {
    if (searchResults.length === 0) {
      setNumberOfQuestions(questionBank.length);
    }
    setNumberOfQuestions(searchResults.length);
  }, [searchResults]);

  useEffect(() => {
    const lowerLimit = (currentPage - 1) * itemsPerPage;
    const upperLimit = lowerLimit + itemsPerPage - 1;
    setItemLimit({ lowerLimit, upperLimit });
  }, [currentPage, itemsPerPage]);

  const handleChangeItemsPerPage = (event: any) => {
    const value = parseInt(event.target.value, 10);
    setItemsPerPage(value);
  };

  const handlePaginationClick = (event: number) => {
    setCurrentPage(event);
  };

  const renderPagination = () => {
    return (
      <div>
        <RenderPagination
          pageRangeDisplayed={10}
          activePage={currentPage}
          itemsCountPerPage={itemsPerPage}
          totalItemsCount={numberOfQuestions}
          handleChange={handlePaginationClick}
        />
      </div>
    );
  };

  const fillMappedQuestions = (response: IQuestionDetails[]) => {
    const mappedQuestionString = Object.keys(categoriesMap);
    const mappedQuestionCopy: IQuestionDetails[] = [];
    response.forEach((el: IQuestionDetails) => {
      if (mappedQuestionString.includes(el.id)) {
        mappedQuestionCopy.push(el);
      }
    });
    setMappedQuestions(mappedQuestionCopy);
  };

  const handleSubmit = () => {
    if (mappedQuestions.length === Object.keys(categoriesMap).length) {
      props.onSubmit(categoriesMap);
    } else {
      props.setErrorMessage(<Text tid='mapCategoriesToAllTheQuestions' />);
    }
  };

  const handleBackButton = () => {
    if (mappedQuestions.length > 0) {
      setShowModal(true);
    }
    props.onBack();
  };

  const handleGoBackYesClicked = () => {
    props.onBack();
  };

  const handleGoBackNoClicked = () => {
    setShowModal(false);
  };

  const handleChangeCategory = (event: any) => {
    const categoriesMapCopy = { ...categoriesMap };
    categoriesMapCopy[event.target.name] = event.target.value;
    setCategoriesMap(categoriesMapCopy);
  };

  const mapQuestion = (question: IQuestionDetails) => {
    const index = mappedQuestions.indexOf(question);
    if (index >= 0) {
      const mappedQuestionsCopy = [...mappedQuestions];
      mappedQuestionsCopy.splice(index, 1);
      const categoriesMapCopy = { ...categoriesMap };
      delete categoriesMapCopy[question.id];
      setCategoriesMap(categoriesMapCopy);
      setMappedQuestions(mappedQuestionsCopy);
    } else {
      const mappedQuestionsCopy = [...mappedQuestions];
      mappedQuestionsCopy.push(question);
      setMappedQuestions(mappedQuestionsCopy);
    }
  };

  useEffect(() => {
    const searchedItems: IQuestionDetails[] = [];
    if (searchString === '') {
      setSearchResults([]);
    }
    questionBank.forEach((el) => {
      if (el.question.toLowerCase().includes(searchString.toLowerCase())) {
        searchedItems.push(el);
      }
    });
    if (searchedItems.length > 0) {
      setSearchResults(searchedItems);
    } else {
      setIsNoResultFound(true);
    }
  }, [searchString]);

  const startSearch = () => {
    if (searchString !== '') {
      setSearchButtonPressed(true);
    }
  };

  const stopSearch = () => {
    setSearchButtonPressed(false);
    setSearchString('');
    setIsNoResultFound(false);
  };

  // const debouncedEvent = debounce((event) => {
  //   updateSearchQuery(event);
  // }, 500);

  // const debounceEvent = (event: any) => {
  //   event.persist();
  //   debouncedEvent(event);
  // };

  const updateSearchQuery = (event: any) => {
    setSearchString(event.target.value);
  };

  const handleSearchChange = (event: any) => {
    // debounceEvent(event);
    updateSearchQuery(event);
  };

  const keyPressSearchBar = (event: any) => {
    if (event.keyCode === 13) {
      startSearch();
    }
  };

  const handleShowMappedQuestions = () => {
    if (showMappedQuestionsOnly) {
      setQuestionBank(questionBankInitial);
      setShowMappedQuestionsOnly(false);
    } else {
      const questionBankCopy = [...questionBank];
      questionBankCopy.sort((a, b) => {
        const aMapped = mappedQuestions.includes(a);
        const bMapped = mappedQuestions.includes(b);
        if (bMapped && !aMapped) {
          return 1;
        }
        return -1;
      });
      setQuestionBank(questionBankCopy);
      setShowMappedQuestionsOnly(true);
    }
  };

  const renderDropDown = (el: IQuestionDetails) => {
    return (
      <Fragment>
        <FormControl className={classes.formControl}>
          <Select
            name={el.id}
            value={categoriesMap[el.id] ? categoriesMap[el.id] : ''}
            onChange={handleChangeCategory}
            // tslint:disable-next-line: jsx-no-lambda
            className={classes.categoryDropDown}
            disabled={!mappedQuestions.includes(el)}
          >
            {props.categories && props.categories.length !== 0 ? (
              props.categories.map((a: any, i: number) => {
                if (a === '') {
                  return;
                }
                return (
                  <MenuItem key={a} value={a}>
                    {a}
                  </MenuItem>
                );
              })
            ) : (
              <div />
            )}
          </Select>
        </FormControl>
      </Fragment>
    );
  };

  const renderAnswers = (answers: any) => {
    const answerKeys = Object.keys(answers);
    answerKeys.sort((a, b) => {
      return answers[a].weightageFactor > answers[b].weightageFactor ? 1 : -1;
    });
    return (
      <Fragment>
        {answerKeys.map((answerEl: string, index: number) => {
          return (
            <div key={index}>
              <Paper className={classes.subPaper}>
                <Grid container spacing={2}>
                  <Grid item md={9}>
                    <div>
                      <strong>A{index + 1}.</strong> {answers[answerEl].answer}
                    </div>
                  </Grid>
                  <Grid item md={1}>
                    <Divider orientation='vertical' />
                  </Grid>
                  <Grid item md={2}>
                    <strong>
                      <Text tid='weightageFactor:' />
                    </strong>{' '}
                    {answers[answerEl].weightageFactor}
                  </Grid>
                </Grid>
              </Paper>
            </div>
          );
        })}
      </Fragment>
    );
  };

  const renderQuestion = (el: IQuestionDetails) => {
    return (
      <ExpansionPanel>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='panel1c-content'
          id='panel1c-header'
          className={
            mappedQuestions.includes(el)
              ? classes.highlighted
              : classes.nonHighlighted
          }
        >
          <div className={classes.extraBigColumn}>
            <Typography className={classes.secondaryHeading}>
              {el.question}
            </Typography>
          </div>
          <div className={classes.smallColumn} style={{ textAlign: 'center' }}>
            {mappedQuestions.includes(el) ? <DoneIcon /> : <div />}
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails
          className={
            mappedQuestions.includes(el)
              ? classes.detailsHighlighted
              : classes.detailsNonHighlighted
          }
        >
          <div className={classes.bigColumn}>{renderAnswers(el.answers)}</div>
          <div className={clsx(classes.column, classes.helper)}>
            {mappedQuestions.includes(el) ? (
              <Fragment>
                <Typography variant='caption'>
                  <Text tid='selectTheCategoryForThisQuestion' />
                </Typography>
              </Fragment>
            ) : (
              <Fragment>
                <MuiThemeProvider theme={tooltipTheme}>
                  <Tooltip
                    title={
                      <Typography className='tooltipTitleStyle'>
                        <Text tid='mapTheQuestion' />
                      </Typography>
                    }
                  >
                    <Typography variant='caption'>
                      <Text tid='selectTheCategoryForThisQuestion' />
                    </Typography>
                  </Tooltip>
                </MuiThemeProvider>
              </Fragment>
            )}
            <br />
            {renderDropDown(el)}
          </div>
        </ExpansionPanelDetails>
        <Divider />
        <ExpansionPanelActions>
          <Button
            name={el.id}
            size='small'
            color='primary'
            onClick={() => {
              mapQuestion(el);
            }}
          >
            {mappedQuestions.includes(el) ? (
              <Text tid='unmap' />
            ) : (
              <Text tid='map' />
            )}
          </Button>
        </ExpansionPanelActions>
      </ExpansionPanel>
    );
  };

  const renderNoResultsFound = () => {
    return (
      <div className={classes.searchContainer}>
        <div>
          <Text tid='searchResults:' />
        </div>
        <div className={classes.noResultsContainer}>No results found.</div>
        <br />
        <br />
        <Divider />
        <br />
      </div>
    );
  };

  const renderQuestionMap = () => {
    return (
      <Fragment>
        <div style={{ width: '100%', marginBottom: '20px' }}>
          <Grid container spacing={2}>
            <Grid item sm={12} md={12}>
              <Typography variant='h6' gutterBottom className={classes.title}>
                <Text tid='mapQuestions' /> - {props.questionnaire}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item sm={3} />
            <Grid item sm={1}>
              <LightTooltip
                title='Show mapped questions first'
                aria-label='Show mapped questions first'
              >
                <FilterListIcon
                  fontSize='large'
                  className={classes.filterIcon}
                  onClick={handleShowMappedQuestions}
                />
              </LightTooltip>
            </Grid>
            <Grid item sm={6}>
              <Paper className={classes.searchRoot}>
                <InputBase
                  className={classes.input}
                  autoFocus={false}
                  multiline={false}
                  value={searchString}
                  onChange={handleSearchChange}
                  placeholder='Search Question'
                  onKeyDown={keyPressSearchBar}
                />
                {searchString !== '' ? (
                  <IconButton
                    className={classes.iconButton}
                    onClick={stopSearch}
                  >
                    <ClearIcon />
                  </IconButton>
                ) : (
                  <div />
                )}
                <IconButton
                  className={classes.iconButton}
                  onClick={startSearch}
                >
                  <SearchIcon />
                </IconButton>
              </Paper>
            </Grid>
            <Grid item sm={2}>
              <PageSizeDropDown
                handleChange={handleChangeItemsPerPage}
                itemCount={itemsPerPage}
              />
            </Grid>
          </Grid>
        </div>
        {searchButtonPressed && isNoResultFound ? (
          <Fragment>{renderNoResultsFound()}</Fragment>
        ) : (
          <Fragment>
            {searchString !== '' && searchResults.length ? (
              <div className={classes.searchContainer}>
                <Text tid=' searchResults:' />
                Search results:
                {searchResults.map((el: IQuestionDetails, i: number) => {
                  if (i < itemLimit.lowerLimit) {
                    return;
                  }
                  if (i > itemLimit.upperLimit) {
                    return;
                  }
                  return (
                    <div key={i} className={classes.rootp}>
                      {renderQuestion(el)}
                    </div>
                  );
                })}
                <br />
              </div>
            ) : (
              <div>
                {questionBank.map((el: IQuestionDetails, i: number) => {
                  if (i < itemLimit.lowerLimit) {
                    return;
                  }
                  if (i > itemLimit.upperLimit) {
                    return;
                  }
                  return (
                    <div key={i} className={classes.rootp}>
                      {renderQuestion(el)}
                    </div>
                  );
                })}
              </div>
            )}
          </Fragment>
        )}
        <div className={classes.paginationContainer}>{renderPagination()}</div>
        <div className='bottomButtonsContainer'>
          <Button
            className={classes.backButton}
            variant='outlined'
            onClick={handleBackButton}
          >
            <Text tid='goBack' />
          </Button>
          <Button
            className={classes.submitButton}
            onClick={handleSubmit}
            variant='outlined'
          >
            <Text tid='save' />
          </Button>
        </div>
        <ModalComponent
          message={'notSubmittedTheQuestionnaireYet'}
          handleModalYesClicked={handleGoBackYesClicked}
          handleModalNoClicked={handleGoBackNoClicked}
          openModal={showModal}
        />
      </Fragment>
    );
  };

  return (
    <Fragment>
      <div className={classes.root}>
        {responseReceived ? (
          <Fragment>{renderQuestionMap()}</Fragment>
        ) : (
          <Container className='loaderStyle'>
            <Loader />
          </Container>
        )}
      </div>
    </Fragment>
  );
};

export default withRouter(MapQuestionsToQuestionnaires);
