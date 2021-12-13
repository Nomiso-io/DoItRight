import React, { useCallback, useEffect, Fragment } from 'react';
import {
  makeStyles,
  MuiThemeProvider,
  createMuiTheme,
} from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import Box from '@material-ui/core/Box';
import { Typography, Radio, TextField } from '@material-ui/core';
import { IAssessmentQuestionData, ISelectedOption } from '../../model/assessment';
import Container from '@material-ui/core/Container';
import _ from 'lodash';
import ReactGA from 'react-ga';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#555',
    },
  },
});

const useStyles = makeStyles((theme) => ({
  questionContainer: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '70%',
    marginTop: '1px',
    marginBottom: '0px',
  },
  defaultOptionStyle: {
    marginTop: 10,
    paddingLeft: 0,
    borderRadius: '0px',
    backgroundColor: '#inherit',
    '&:hover': {
      color: 'black',
      backgroundColor: '#EAF5C8',
    },
    display: 'flex',
    flexDirection: 'column',
  },
  instruction: {
    fontSize: '14px',
    color: '#808080',
    marginBottom: '2px',
  },
  label: {
    color: 'white',
  },
  iconRoot: {
    minWidth: '26px',
  },
  selected: {
    '&$selected': {
      backgroundColor: '#EAF5C8',
      color: 'black',
      '&:hover': {
        backgroundColor: '#EAF5C8',
        color: 'black',
      },
    },
  },
  checkboxStyle: {
    margin: 0,
  },
  up: {
    display: 'flex',
    justifyContent: 'flex-start',
    width: '100%',
    alignItems: 'center',
  },
  textField: {
    // marginLeft: theme.spacing(2),
    width: '100%',
    marginTop: 0,
  },
  question: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '21px',
    display: 'flex',
  },
}));

// const HtmlTooltip = withStyles((theme: Theme) => ({
//   tooltip: {
//     backgroundColor: '#f5f5f9',
//     color: 'rgba(0, 0, 0, 0.87)',
//     maxWidth: 220,
//     fontSize: theme.typography.pxToRem(12),
//     border: '1px solid #dadde9',
//   },
//   arrow: {
//     color: '#dadde9',
//   },
// }))(Tooltip);

interface IQuestionProps {
  data: IAssessmentQuestionData | null;
  setMarkedAnswer: (
    questionId: string,
    version: number,
    answers: string[],
    comment: string | null
  ) => void;
  markedOptions: ISelectedOption | undefined;
  questionIndex: string;
}

function QuestionComponent(props: IQuestionProps) {
  const classes = useStyles();
  const { setMarkedAnswer, markedOptions } = props;
  const { question, answers: options, reason } = props.data!;
  const [optionKeys, setOptionKeys] = React.useState(Object.keys(options));

  const defaultCheckState = markedOptions
    ? markedOptions!.answers.length > 0
      ? markedOptions.answers
      : []
    : [];

  const [inputValue, setInputValue] = React.useState(
    markedOptions
      ? markedOptions!.comment
        ? markedOptions!.comment
        : null
      : null
  );

  //   const inputRef = useRef();
  const debouncedSetMarkedOptions = useCallback(
    _.debounce(setMarkedAnswer, 500, { maxWait: 500 }),
    []
  );

  function handleTextInput(event: any) {
    setInputValue(event.target.value);
    if (checked) {
      debouncedSetMarkedOptions(
        questionId,
        version,
        checked,
        event.target.value
      );
    } else {
      debouncedSetMarkedOptions(
        questionId,
        version,
        ['@N/A'],
        event.target.value
      );
    }
  }

  const [checked, setChecked] = React.useState(defaultCheckState);
  const questionId = props.data!.id;
  const version = props.data!.version;
  const numberOfAnswers = props.data!.numberOfAnswers;
  const questionType = props.data!.type;

  const handleToggle = (optionId: string) => () => {
    let checkedArray: string[] = [];
    if (questionType === 'multi-select') {
      if (checked.includes(optionId)) {
        checkedArray = [...checked];
        checkedArray.splice(checkedArray.indexOf(optionId), 1);
      } else {
        checkedArray = [...checked, optionId];
      }
    } else {
      if (optionId === '@N/A') {
        if (checked.includes('@N/A')) {
          checkedArray = [];
        } else {
          checkedArray = ['@N/A'];
        }
      } else {
        const newChecked: string | null = optionId;
        if (checked.includes(optionId)) {
          checkedArray = checked.filter((option) => newChecked !== option);
        } else {
          checkedArray = [optionId];
        }
        checkedArray = checkedArray.filter((option) => option !== '@N/A');
      }
    }
    setChecked(checkedArray);
    setMarkedAnswer(questionId, version, checkedArray, inputValue);
  };

  useEffect(() => {
    ReactGA.event({
      category: 'Assessment',
      action: 'Question',
      label: props!.data!.id,
    });
    setMarkedAnswer(questionId, version, defaultCheckState, inputValue);
    if (!props.data!.randomize) {
      const sortedOptions = Object.keys(options).sort((a, b) => {
        return options[a].weightageFactor > options[b].weightageFactor ? 1 : -1;
      });
      setOptionKeys(sortedOptions);
    }
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <Container
        maxWidth='md'
        component='div'
        classes={{
          root: classes.questionContainer,
        }}
      >
        <Box mb={'8px'}>
          <Typography className={classes.question} component='div'>
            {`Q${props.questionIndex}. `}
            {question}
          </Typography>
        </Box>
        <Typography className={classes.instruction} component='div'>
          {numberOfAnswers > 1
            ? 'Select ' +
              numberOfAnswers +
              ' appropriate options that suits your team'
            : 'Select an appropriate option that suits your team'}
        </Typography>
        <List>
          {optionKeys.map((key: any) => {
            const optionId = key;
            let { answer } = options[key];
            const isChecked = checked.includes(optionId);
            // const labelId = `checkbox-list-label-${optionId}`;
            return (
              <Fragment key={optionId}>
                <ListItem
                  selected={isChecked}
                  ContainerComponent='div'
                  disableRipple
                  key={optionId}
                  classes={{
                    root: classes.defaultOptionStyle,
                    selected: classes.selected,
                  }}
                  button
                  onClick={handleToggle(optionId)}
                >
                  <div className={classes.up}>
                    <ListItemIcon className={classes.iconRoot}>
                      {questionType === 'multi-select' ? (
                        <Checkbox
                          disableRipple={true}
                          checked={isChecked}
                          className={classes.checkboxStyle}
                          color='primary'
                        />
                      ) : (
                        <Radio
                          disableRipple={true}
                          checked={isChecked}
                          className={classes.checkboxStyle}
                          color='primary'
                        />
                      )}
                    </ListItemIcon>
                    {answer.split('\n').map((item, i) => {
                      return (
                        <Fragment key={i}>
                          {item}
                          <br />
                        </Fragment>
                      );
                    })}
                  </div>
                  {/* reason && checked.includes(optionId) && (
                                <Input
                                    placeholder="Please enter a reason for your selection"
                                    inputRef={inputRef}
                                    className={classes.textField}
                                    value={inputValue ? inputValue : ''}
                                    onChange={handleTextInput}
                                    autoFocus
                                />
                            ) */}
                </ListItem>
                {/* {console.log("divider")}
                        <Divider light/> */}
              </Fragment>
            );
          })}
          {props!.data!.NA ? (
            <ListItem
              selected={checked.includes('@N/A')}
              disableRipple
              key={'@N/A'}
              classes={{
                root: classes.defaultOptionStyle,
                selected: classes.selected,
              }}
              button
              onClick={
                checked.includes('@N/A') ? () => {} : () => handleToggle('@N/A')
              }
            >
              <div className={classes.up} onClick={handleToggle('@N/A')}>
                <ListItemIcon className={classes.iconRoot}>
                  {questionType === 'multi-select' ? (
                    <Checkbox
                      className={classes.checkboxStyle}
                      disableRipple={true}
                      checked={checked.includes('@N/A')}
                      color='primary'
                    />
                  ) : (
                    <Radio
                      className={classes.checkboxStyle}
                      disableRipple={true}
                      checked={checked.includes('@N/A')}
                      color='primary'
                    />
                  )}
                </ListItemIcon>
                <ListItemText primary={'NA'} />
              </div>
              {/* checked.includes('@N/A') && (
                        <Input
                            placeholder="Please enter a reason for your selection"
                            inputRef={inputRef}
                            className={classes.textField}
                            value={inputValue ? inputValue : ''}
                            onChange={handleTextInput}
                            autoFocus
                        />
                    ) */}
            </ListItem>
          ) : (
            <div />
          )}
        </List>
        {(reason || checked.includes('@N/A')) && (
          <TextField
            required
            multiline
            placeholder='Please enter the reason for your selection'
            id='reason'
            name='reason'
            variant='outlined'
            label='Reason'
            className={classes.textField}
            value={inputValue ? inputValue : ''}
            onChange={handleTextInput}
            fullWidth
          />
        )}
      </Container>
    </MuiThemeProvider>
  );
}

export default QuestionComponent;
