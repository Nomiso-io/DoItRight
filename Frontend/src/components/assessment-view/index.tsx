import React, { useState, Fragment } from 'react';
import {
  makeStyles,
  MuiThemeProvider,
  createMuiTheme,
} from '@material-ui/core/styles';
import {
  IAssessmentDetailItem,
  IOptionItem,
  IRecommendationItem,
  AssessmentDocument,
} from '../../model';
import { SpiderWeb, ResultIndex, ResultRenderer } from '../../components';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import InfoIcon from '@material-ui/icons/Info';
import {
  Typography,
  Container,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Button,
  Grid,
  Paper,
  Radio,
  TextField,
  InputAdornment,
  Tooltip,
} from '@material-ui/core';
import EventIcon from '@material-ui/icons/Event';
import { buttonStyle, tooltipTheme } from '../../common/common';
import { Text } from '../../common/Language';
// import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// import { OptionsStore } from '@progress/kendo-drawing';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';

const Scroll = require('react-scroll');
const Element = Scroll.Element;
const scroller = Scroll.scroller;

interface IAssessmentViewProps {
  assessmentData: IAssessmentDetailItem[];
  result: any;
  recommendations: IRecommendationItem;
  showRecommendations?: boolean;
  boolRenderBackButton?: boolean;
  backButtonAction: any;
  userLevels: any;
  //  download: any;
  bestScoringAssessment?: AssessmentDocument;
  benchmarkScore?: number;
}

interface IStructuredQuestionArray {
  [category: string]: IAssessmentDetailItem[];
}

interface IActionCreate {
  date: string;
  action: string;
}

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#555',
    },
  },
});

const useStyles = makeStyles((theme) => ({
  questionContainer: {
    // display: 'flex',
    // flexDirection: 'column',
    marginBottom: '30px',
  },
  option: {
    paddingLeft: 0,
    marginTop: '5px',
    borderRadius: '0px',
    // backgroundColor: '#E8E8E8'
  },
  selectedOption: {
    paddingLeft: 0,
    marginTop: '5px',
    backgroundColor: '#EAF5C8',
    // color: '#FFFFFF',
    borderRadius: '0px',
    '&:hover': {
      // color: '#FFFFFF',
      backgroundColor: '#EAF5C8',
    },
  },
  instruction: {
    alignSelf: 'flex-start',
    color: '#808080',
    padding: theme.spacing(1),
  },
  label: {
    color: 'white',
  },
  iconRoot: {
    minWidth: '26px',
    color: 'blue',
  },
  checkboxStyle: {
    margin: 0,
    color: 'blue',
  },
  result: {
    // backgroundColor: '#494391',#0073A3
    backgroundColor: '#0073A3',
    color: 'white',
    padding: '16px',
    marginBottom: '8px',
    borderRadius: '8px',
  },
  up: {
    display: 'flex',
    justifyContent: 'flex-start',
    width: '100%',
    alignItems: 'center',
  },
  textField: {
    width: '100%',
    marginTop: 0,
  },
  question: {
    textAlign: 'left',
    fontSize: '24px',
  },
  showAssessmentButton: {
    margin: '15px',
    display: 'inline-block',
    ...buttonStyle,
  },
  addButton: {
    margin: 'auto',
    ...buttonStyle,
  },
  addButtonContainer: {
    width: '100%',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    marginTop: '20px',
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    minHeight: '250px',
  },
  actionPaper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  grid: {
    margin: theme.spacing(4),
  },
  commentList: {
    alignItems: 'left !important',
  },
  noRecommendation: {
    marginTop: theme.spacing(2),
  },
  gridRoot: {
    minWidth: '100%',
    marginTop: '0px',
    marginBottom: '10px',
  },
  actions: {
    margin: '50px',
  },
  formContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  dateTextField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  userLevelScores: {
    fontSize: '22px',
    marginLeft: '35%',
    color: '#000',
  },
  categoryPanel: {
    backgroundColor: '#0073A3',
    marginBottom: '5px',
    height: '30%',
  },
  rootp: {
    width: '80%',
  },
  headingp: {
    fontSize: theme.typography.pxToRem(20),
    fontWeight: theme.typography.fontWeightRegular,
    color: 'white',
  },
  infoIcon: {
    padding: '3px',
    // marginLeft: '3px',
  },
  rightAlign: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

const calculateLevel = (percentage: number, userLevels: any) => {
  let level: string = '';
  userLevels.forEach((el: any) => {
    if (percentage >= el.lowerLimit && percentage <= el.upperLimit) {
      level = el.name;
    }
  });
  return level;
};

function renderResult(
  result: any,
  classes: any,
  userLevels: any,
  bestResult: boolean
) {
  if (result && result.percentage) {
    return (
      <Fragment>
        <div style={{ width: '100%' }} className={classes.result}>
          <Grid container>
            <Grid item sm={6}>
              <Typography variant='h5'>
                {bestResult ? (
                  <Text tid='bestScorerLevel' />
                ) : (
                  <Text tid='yourLevel' />
                )}
                <strong>{`${calculateLevel(
                  result.percentage,
                  userLevels
                )}`}</strong>
              </Typography>
            </Grid>
            <Grid item sm={6} className={classes.rightAlign}>
              <Typography variant='h5'>
                {bestResult ? (
                  <Text tid='bestScore' />
                ) : (
                  <Text tid='yourScore' />
                )}
                <strong>{`${result.percentage}/100`}</strong>
              </Typography>
            </Grid>
          </Grid>
        </div>
      </Fragment>
    );
  }
  return <div />;
}

const structureQuestionArray = (assessmentData: IAssessmentDetailItem[]) => {
  const structuredArray: IStructuredQuestionArray = {};
  assessmentData.forEach((el: IAssessmentDetailItem) => {
    if (Object.keys(structuredArray).includes(el.category)) {
      structuredArray[el.category].push(el);
    } else {
      structuredArray[el.category] = [];
      structuredArray[el.category].push(el);
    }
  });
  return structuredArray;
};

function AssessmentView(props: IAssessmentViewProps) {
  const displayDetails = useSelector((state: IRootState) => state.display);

  const noOptionSelectedText = 'No option selected for this question';
  const classes = useStyles();
  let index = 0;
  const { result, recommendations } = props;
  //    const env = process.env.REACT_APP_STAGE;
  const [showAssessment, setShowAssessment] = useState(false);
  const emptyAction: IActionCreate = {
    action: '',
    date: '',
  };
  const [action, setAction] = useState<IActionCreate[]>([emptyAction]);
  const structuredQuestionsArray = structureQuestionArray(props.assessmentData);
  const renderOption = (
    option: IOptionItem,
    numberOfAnswers: number,
    iterator: number
  ) => {
    return (
      <ListItem
        ContainerComponent='div'
        disableRipple
        classes={{
          root: option.isSelected ? classes.selectedOption : classes.option,
        }}
        key={iterator}
        button
      >
        {option.isSelected ? (
          <ListItemIcon className={classes.iconRoot}>
            {numberOfAnswers > 1 ? (
              <Checkbox disableRipple={true} checked={true} color='primary' />
            ) : (
              <Radio disableRipple={true} checked={true} color='primary' />
            )}
          </ListItemIcon>
        ) : (
          <ListItemIcon className={classes.iconRoot}>
            {numberOfAnswers > 1 ? (
              <Checkbox disableRipple={true} checked={false} color='primary' />
            ) : (
              <Radio disableRipple={true} checked={false} color='primary' />
            )}
          </ListItemIcon>
        )}
        <ListItemText primary={`${option.answer}`} />
      </ListItem>
    );
  };

  /* Function to remove duplicate entries from the array,
    this is the case in multiselect options,
    backend sends redundant data, this is just a work around
    until the issue is fixed on the backend */
  const getUnique = (array: any) => {
    const uniqueArray = [];
    if (array.length !== 0) {
      uniqueArray.push(array[0]);

      for (let i = 1; i < array.length; i++) {
        let pushFlag = true;
        for (let j = 0; j < uniqueArray.length; j++) {
          if (uniqueArray[j].answer === array[i].answer) {
            if (array[i].isSelected) {
              uniqueArray.splice(j, 1, array[i]);
            }
            pushFlag = false;
          }
        }
        if (pushFlag) {
          uniqueArray.push(array[i]);
        }
      }
    }
    return uniqueArray;
  };

  const renderQuestion = (assessmentItem: IAssessmentDetailItem) => {
    const {
      question,
      answers,
      // category,
      comment,
      options,
      randomize,
    } = assessmentItem;
    const numberOfAnswers = answers.length;
    index = index + 1;
    let uniqueArray = getUnique(options);
    if (!randomize) {
      uniqueArray = uniqueArray.sort((a, b) => {
        return a.weightage > b.weightage ? 1 : -1;
      });
    }
    return (
      <Container
        maxWidth='md'
        component='div'
        classes={{
          root: classes.questionContainer,
        }}
      >
        <Box mb={'8px'}>
          <Typography className={classes.question} component='div'>
            {`Q${index}. ${question}`}
          </Typography>
        </Box>
        {answers.length < 1 && (
          <Typography className={classes.instruction} component='div'>
            {noOptionSelectedText}
          </Typography>
        )}
        <List>
          {uniqueArray &&
            uniqueArray.map((el, i) => renderOption(el, numberOfAnswers, i))}
          {comment && answers.includes(comment) && (
            <ListItem
              ContainerComponent='div'
              disableRipple
              classes={{
                root: classes.selectedOption,
              }}
              button
            >
              <div className={classes.up}>
                {numberOfAnswers > 1 ? (
                  <Checkbox
                    className={classes.checkboxStyle}
                    disableRipple={true}
                    checked={true}
                    color='primary'
                  />
                ) : (
                  <Radio
                    className={classes.checkboxStyle}
                    disableRipple={true}
                    checked={true}
                    color='primary'
                  />
                )}
                <ListItemText primary={`NA`} />
              </div>
            </ListItem>
          )}
        </List>
        {comment && (
          <TextField
            className={classes.textField}
            multiline
            disabled
            value={`Comments :- \n${comment}`}
            variant='outlined'
          />
        )}
      </Container>
    );
  };
  const moveToTop = () => {
    scroller.scrollTo('page_top', {
      duration: 500,
      delay: 50,
      smooth: true,
      offset: -100, // Scrolls to element + 50 pixels down the page
    });
  };
  const handleShowAssessmentClick = (event: any) => {
    setShowAssessment(!showAssessment);
    scroller.scrollTo('myScrollToElement', {
      duration: 500,
      delay: 50,
      smooth: true,
      // offset: 40, // Scrolls to element + 50 pixels down the page
    });
  };
  const renderComments = (key: string) => {
    return (
      <ol className={classes.commentList}>
        {recommendations[key].recommendedQues.map((el: any, i: number) => (
          <li key={i}>
            <Typography
              variant='body2'
              component='p'
              color='textPrimary'
              align='left'
            >
              {el.comments.endsWith('.') ? el.comments : `${el.comments}.`}
            </Typography>
          </li>
        ))}
      </ol>
    );
  };

  const getCategoryLevel = (key: string) => {
    const percentage = result.categoryWiseResults[key].percentage;
    return calculateLevel(percentage, props.userLevels);
  };

  const preRenderActionPanel = () => {
    return (
      <div className={classes.actions}>
        {action.length > 1 && (
          <Typography variant='h3' align='center' color='textPrimary'>
            <Text tid='actions' />:
          </Typography>
        )}
        {action.map((el: IActionCreate, i: number) => {
          if (i < action.length - 1) {
            return renderActionPanel(el, i);
          }
          return '';
        })}
      </div>
    );
  };

  const renderActionPanel = (el: IActionCreate, i: number) => {
    return (
      <Paper
        className={classes.actionPaper}
        style={{ marginTop: '20px', textAlign: 'left', padding: '50px' }}
      >
        <Typography>
          {i + 1}. {el.action}
        </Typography>
        <Typography>
          <Text tid='endDate' />
          {el.date}
        </Typography>
      </Paper>
    );
  };

  const handleActionChangeValue = (event: any, i: number) => {
    const actionCopy = [...action];
    actionCopy[i].action = event.target.value;
    setAction(actionCopy);
  };

  const handleDateChangeValue = (event: any, i: number) => {
    const actionCopy = [...action];
    actionCopy[i].date = event.target.value;
    setAction(actionCopy);
  };

  const addAction = () => {
    setAction([...action, emptyAction]);
  };

  const renderActions = (el: IActionCreate, i: number) => {
    return (
      <Fragment key={i}>
        <form className={classes.formContainer} noValidate autoComplete='off'>
          <Grid container spacing={3}>
            <Grid item xs={8}>
              <TextField
                type='string'
                id={i.toString()}
                name={i.toString()}
                value={el.action}
                label={'Action'}
                onChange={(event: any) => {
                  handleActionChangeValue(event, i);
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id={i.toString()}
                name={i.toString()}
                type='date'
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position='start'>
                      <EventIcon />
                    </InputAdornment>
                  ),
                }}
                onChange={(event: any) => {
                  handleDateChangeValue(event, i);
                }}
                className={classes.dateTextField}
                fullWidth
              />
            </Grid>
          </Grid>
        </form>
      </Fragment>
    );
  };

  const renderRecommendations = () => {
    return (
      <Fragment>
        <Typography variant='h4' align='center'>
          <Text tid='recommendations' />
        </Typography>
        <Grid container spacing={6} className={classes.grid}>
          {Object.keys(recommendations).map((key: string, i) => {
            return (
              <Grid item xs={6} key={i}>
                <Paper className={classes.paper} elevation={3}>
                  <Typography variant='h5' component='h2' color='textPrimary'>
                    {key}
                  </Typography>
                  <Typography color='textSecondary'>
                    <Text tid='level:' />: {getCategoryLevel(key)}
                  </Typography>
                  {recommendations[key].recommendedQues.length === 0 ? (
                    <Typography
                      variant='body2'
                      className={classes.noRecommendation}
                      component='h5'
                      color='textPrimary'
                      align='center'
                    >
                      <Text tid='youAreGoodInThisCategory' />
                    </Typography>
                  ) : (
                    renderComments(key)
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Fragment>
    );
  };

  const downloadAssessment = () => {
    //    const input = document.getElementById('page1') as HTMLElement;
    //    html2canvas(input, {width: 900}).then((canvas: any) => {
    //      const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.setFontSize(14);
    //      pdf.addImage(imgData, 'JPEG', 0, 0, 200, 150);
    let pos: number = 30;
    //write assessment name, user and team
    pdf.text(`Assessment: ${displayDetails.topBarTextLeft}`, 20, pos);
    pos += 10;
    pdf.text(`${displayDetails.topBarTextCenter}`, 20, pos);
    pos += 10;
    //write overall score
    pdf.text(`Score: ${result.percentage}%`, 20, pos);
    pos += 10;
    pdf.text(
      `Level: ${calculateLevel(result.percentage, props.userLevels)}`,
      20,
      pos
    );
    pos += 10;
    //write category wise scores
    pdf.text(`Category wise results:`, 20, pos);
    pos += 10;
    let res = Object.keys(result.categoryWiseResults);
    res = res.sort((a, b) => {
      return a > b ? 1 : -1;
    });
    res.forEach((el) => {
      pdf.text(`${el}: ${result.categoryWiseResults[el].percentage}%`, 25, pos);
      pos += 10;
    });
    //write question details
    pdf.addPage();
    pos = 30;
    pdf.text(`Assessment Details:`, 20, pos);
    pos += 10;
    let qNum = 0;
    Object.keys(structuredQuestionsArray).forEach((el: string, i: number) => {
      pdf.text(`${el}:`, 20, pos);
      pos = calcPosForPdf(pos, pdf, 1);
      structuredQuestionsArray[el].forEach((ques, index) => {
        //write the question
        qNum += 1;
        let quesLines = pdf.splitTextToSize(`Q${qNum}. ${ques.question}`, 200);
        pdf.text(quesLines, 25, pos);
        pos = calcPosForPdf(pos, pdf, quesLines.length);
        //sort the answers on weightage and write each answers
        let sortedAnswers = ques.options.sort((a, b) => {
          return a.weightage > b.weightage ? 1 : -1;
        });
        sortedAnswers.forEach((ans) => {
          if (ans.isSelected) {
            pdf.rect(25, pos - 4, 4, 4, 'F');
          } else {
            pdf.rect(25, pos - 4, 4, 4);
          }
          let ansLines = pdf.splitTextToSize(`${ans.answer}`, 150);
          pdf.text(ansLines, 40, pos);
          pos = calcPosForPdf(pos, pdf, ansLines.length);
        });
        //if NA is chosen then write that with reason
        if (ques.comment && ques.answers.includes(ques.comment)) {
          pdf.rect(25, pos - 4, 4, 4, 'F');
          let comLines = pdf.splitTextToSize(
            `NA - (Reason: ${ques.comment})`,
            150
          );
          pdf.text(comLines, 40, pos);
          pos = calcPosForPdf(pos, pdf, comLines.length);
        }
        pos = calcPosForPdf(pos, pdf, 1);
      });
    });

    pdf.save('download.pdf');
    //    });
  };

  function calcPosForPdf(pos: number, pdf: jsPDF, lines: number): number {
    let newPos = pos + 10 * lines;
    if (newPos > 200) {
      pdf.addPage();
      return 30;
    }
    return newPos;
  }

  return (
    <MuiThemeProvider theme={theme}>
      <Element name='page_top' />
      <Fragment>
        <div id='page1'>
          <div style={{ marginBottom: '20px', width: '100%' }}>
            <ResultIndex
              maxScore={result.maxScore}
              indexData={props.userLevels}
            />
          </div>
          {renderResult(result, classes, props.userLevels, false)}
          <Grid container spacing={3} className={classes.gridRoot}>
            <Grid item xs={8}>
              <div style={{ display: 'flex' }}>
                <Typography variant='h4' className={classes.userLevelScores}>
                  <Text tid='categoryWiseScore' />
                </Typography>
                {props.benchmarkScore ? (
                  <MuiThemeProvider theme={tooltipTheme}>
                    <Tooltip
                      title={
                        <Typography className='tooltipTitleStyle'>
                          <Text tid='benchmarkScoreLineIndicatesTheBenchmarkScore' />
                        </Typography>
                      }
                      placement='right'
                    >
                      <div style={{ paddingLeft: '5px' }}>
                        <InfoIcon style={{ fontSize: 23 }} />
                      </div>
                    </Tooltip>
                  </MuiThemeProvider>
                ) : (
                  <div />
                )}
              </div>
              <div style={{ marginLeft: '3%' }}>
                <SpiderWeb
                  result={result}
                  benchmarkScore={props.benchmarkScore}
                  userLevels={props.userLevels}
                />
              </div>
            </Grid>
            <Grid item xs={4}>
              <ResultRenderer data={result} userLevels={props.userLevels} />
            </Grid>
          </Grid>
        </div>
        {false ? (
          <Fragment>
            <Typography variant='h3' align='center' color='textPrimary'>
              <Text tid='assignActions:' />
            </Typography>
            <Container maxWidth='md' className={classes.actions}>
              {action.map((el: IActionCreate, i: number) =>
                renderActions(el, i)
              )}
              <div className={classes.addButtonContainer}>
                <Button
                  size='small'
                  variant='outlined'
                  onClick={addAction}
                  className={classes.addButton}
                >
                  <Text tid='add' />
                </Button>
              </div>
            </Container>
            <Container maxWidth='md'>{preRenderActionPanel()}</Container>
          </Fragment>
        ) : (
          <div />
        )}
        {props.showRecommendations ? (
          <Container maxWidth='md'>
            {recommendations
              ? Object.keys(recommendations).length > 0
                ? renderRecommendations()
                : {}
              : {}}
          </Container>
        ) : (
          <div />
        )}
        <div className='row'>
          <Button
            variant='outlined'
            onClick={handleShowAssessmentClick}
            className={classes.showAssessmentButton}
          >
            {showAssessment ? (
              <Text tid='hideAssessment' />
            ) : (
              <Text tid='showAssessment' />
            )}
          </Button>

          <Button
            variant='outlined'
            className={classes.showAssessmentButton}
            onClick={downloadAssessment}
          >
            <Text tid='download' />
          </Button>

          {props.boolRenderBackButton ? (
            <Button
              variant='outlined'
              className={classes.showAssessmentButton}
              onClick={props.backButtonAction}
            >
              <Text tid='goBack' />
            </Button>
          ) : (
            ''
          )}
        </div>
        <Element name='myScrollToElement' />
        {/* {showAssessment ?
                    (
                        <Fragment> */}
        {/* <Button onClick={props.download}> Download </Button>  */}
        {/* <div style={{ marginBottom: '20px', width: '100%' }}>
                    <ResultIndex maxScore={result.maxScore} indexData={props.userLevels} />
                </div> */}
        {/* {renderResult(result, classes, props.userLevels, false)} */}
        {/* <Grid container spacing={3} className={classes.gridRoot}>
                    <Grid item xs={8}>
                        <Typography variant="h4" className={classes.userLevelScores}>
                            Category Wise Score:
                        </Typography>
                        <div style={{ marginTop: '2%', marginLeft: '3%' }}>
                            <SpiderWeb result={result}
                                bestResult={props.bestScoringAssessment ?
                                    props.bestScoringAssessment.result : undefined} />
                        </div>
                    </Grid>
                    <Grid item xs={4}>
                        <ResultRenderer data={result} />
                    </Grid>
                </Grid> */}
        {/* {false ?
                    (
                        <Fragment>
                            <Typography variant="h3" align="center" color="textPrimary">Assign Actions:</Typography>
                            <Container
                                maxWidth="md" className={classes.actions}>
                                {action.map((el: IActionCreate, i: number) => (renderActions(el, i)))}
                                <div className={classes.addButtonContainer}>
                                    <Button size="small"
                                        variant="outlined"
                                        onClick={addAction}
                                        className={classes.addButton}>Add</Button>
                                </div>
                            </Container>
                            <Container
                                maxWidth="md">
                                {preRenderActionPanel()}
                            </Container>
                        </Fragment>
                    )
                    :
                    <div />
                } */}
        {/* {props.showRecommendations ?
                    (
                        <Container
                            maxWidth="md">
                            {recommendations ?
                                Object.keys(recommendations).length > 0 ?
                                    renderRecommendations() : {} : {}
                            }
                        </Container>
                    )
                    :
                    <div />
                }
                <div className="row">
                    <Button variant="outlined"
                        onClick={handleShowAssessmentClick}
                        className={classes.showAssessmentButton}>
                        {showAssessment ? 'Hide Assessment' : 'Show Complete Assessment'}
                    </Button>
                    {
                        props.boolRenderBackButton ?
                            (
                                <Button variant="outlined"
                                    className={classes.showAssessmentButton}
                                    onClick={props.backButtonAction}>
                                    Go Back
                                </Button>
                            ) : ''
                    }
                </div> */}
        {/* <Element name="myScrollToElement" /> */}
        {showAssessment ? (
          <Fragment>
            {Object.keys(structuredQuestionsArray).map(
              (el: string, i: number) => {
                return (
                  <div key={i} className={classes.rootp}>
                    <Fragment>
                      <ExpansionPanel style={{ maxWidth: '100%' }}>
                        <ExpansionPanelSummary
                          className={classes.categoryPanel}
                          expandIcon={
                            <ExpandMoreIcon style={{ fill: 'white' }} />
                          }
                          aria-controls='panel1a-content'
                          id='panel1a-header'
                        >
                          <Typography variant='h4' className={classes.headingp}>
                            {el}
                          </Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                          <div>
                            {structuredQuestionsArray[el].map(renderQuestion)}
                          </div>
                        </ExpansionPanelDetails>
                      </ExpansionPanel>
                    </Fragment>
                  </div>
                );
              }
            )}
            <div className='row'>
              <Button
                variant='outlined'
                onClick={handleShowAssessmentClick}
                className={classes.showAssessmentButton}
              >
                {showAssessment ? (
                  <Text tid='hideAssessment' />
                ) : (
                  <Text tid='showAssessment' />
                )}
              </Button>
              <Button
                variant='outlined'
                onClick={moveToTop}
                className={classes.showAssessmentButton}
              >
                <Text tid='goToTheTop' />
              </Button>
              {props.boolRenderBackButton ? (
                <Button
                  variant='outlined'
                  className={classes.showAssessmentButton}
                  onClick={props.backButtonAction}
                >
                  <Text tid='goBack' />
                </Button>
              ) : (
                ''
              )}
            </div>
          </Fragment>
        ) : null}
      </Fragment>
    </MuiThemeProvider>
  );
}

export default AssessmentView;
