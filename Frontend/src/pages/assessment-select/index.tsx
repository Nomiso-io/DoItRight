import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import {
  Paper,
  Table,
  TableHead,
  Container,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  makeStyles,
  Button,
} from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { Loader } from '../../components';
import {
  useActions,
  setSelectedAssessmentType,
  setSelectAssessmentDataSuccess,
  setSelectAssessmentDataStart,
  setSelectAssessmentDataFailure,
  setAppBarLeftText,
} from '../../actions';
import { Http } from '../../utils';
import PriorityHighIcon from '@material-ui/icons/PriorityHigh';
import ReactGA from 'react-ga';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { buttonStyle } from '../../common/common';
import TeamSelectionDropDown from '../../components/team-selection-dropdown';
import * as constantValues from '../../common/constantValues';
import { Text } from '../../common/Language';

const useStyles = makeStyles((theme) => ({
  containerRoot: {
    display: 'flex',
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    top: '120px',
    paddingBottom: theme.spacing(4),
  },
  label: {
    margin: theme.spacing(15),
  },
  icon: {
    marginRight: '5px',
    fontSize: '52px',
  },
  buttons: {
    ...buttonStyle,
  },
}));

const AssessmentSelect = (props: any) => {
  const classes = useStyles();
  const [questionnaire, setQuestionnaire] = React.useState<any>({});
  const [questionnaireFetched, setQuestionnaireFetched] = React.useState(false);
  const teamId = useSelector((state: IRootState) => {
    return state.user.team;
  });
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const setAssessmentType = useActions(setSelectedAssessmentType);
  const setAssessmentDataSuccess = useActions(setSelectAssessmentDataSuccess);
  const setAssessmentDataFail = useActions(setSelectAssessmentDataFailure);
  const setAssessmentDataStart = useActions(setSelectAssessmentDataStart);
  const setDisplayLeftText = useActions(setAppBarLeftText);

  let signUpUrl: string;
  const systemDetails = useSelector((state: IRootState) => state.systemDetails);
  signUpUrl = `https://${systemDetails.appClientURL}/login?response_type=token&client_id=${systemDetails.appClientId}&redirect_uri=https://${window.location.host}/auth`;

  useEffect(() => {
    setDisplayLeftText('');
    if (teamId) {
      setAssessmentDataStart();
      setQuestionnaire({});
      setQuestionnaireFetched(false);
      Http.get({
        url: `/api/v2/assignment?teamId=${teamId}`,
        state: stateVariable,
      })
        .then((response: any) => {
          response.questionnaires.sort((a: any, b: any) => {
            return a.displayName > b.displayName ? 1 : -1;
          });
          setQuestionnaire(response);
          setQuestionnaireFetched(true);
          setAssessmentDataSuccess(response);
          if (systemDetails.mode === constantValues.TRIAL_MODE) {
            linkClicked(
              constantValues.TRIAL_QUESTIONNAIRE_ID,
              constantValues.TRIAL_QUESTIONNAIRE_VERSION
            );
          }
        })
        .catch((error: any) => {
          setAssessmentDataFail(error);
          const perror = JSON.stringify(error);
          const object = JSON.parse(perror);
          if (object.code === 401) {
            props.history.push('/relogin');
          } else {
            props.history.push('/error');
          }
        });
    } else {
      if (systemDetails.mode === constantValues.TRIAL_MODE) {
        props.history.push('/error');
      } else {
        window.open(
          signUpUrl,
          '_self',
          `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no,
                    resizable=no, copyhistory=no, width=${500}, height=${5000}, top=${300}, left=${300}`
        );
      }
    }
  }, [teamId]);

  useEffect(() => {
    if (questionnaire.status === 'fail') {
      const error = JSON.stringify(questionnaire!.error);
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
    }
  }, [questionnaire]);

  const linkClicked = (questionnaireId: string, version: string) => {
    ReactGA.event({
      category: 'Assessment',
      action: 'Questionnaire Selected',
      label: questionnaireId,
    });
    setAssessmentType({ questionnaireId, version });
    props.history.push({
      pathname: `/assessment`,
      state: questionnaireId,
    });
  };

  if (questionnaireFetched) {
    return (
      <Container
        maxWidth='md'
        component='div'
        classes={{
          root: classes.containerRoot,
        }}
      >
        <TeamSelectionDropDown />
        {questionnaire.questionnaireSelected.length > 0 ? (
          <Paper style={{ width: '100%' }}>
            <Table className='table'>
              <TableHead className='tableHead'>
                <TableRow>
                  <TableCell className='tableHeadCell'>
                    <Typography className='tableHeadText'>
                      <Text tid='assessments' />
                    </Typography>
                  </TableCell>
                  <TableCell align='center' className='tableHeadCell'>
                    <Typography className='tableHeadText'>
                      <Text tid='linkToAssessments' />
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {questionnaire.questionnaires.map((row: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell component='th' scope='row' className='tableCell'>
                      <Typography className='tableBodyText'>
                        {row.displayName}
                      </Typography>
                    </TableCell>
                    <TableCell align='center' className='tableCell'>
                      <Button
                        variant='outlined'
                        className={classes.buttons}
                        disabled={
                          !questionnaire.questionnaireSelected.includes(
                            row.questionnaireId
                          )
                        }
                        onClick={() => {
                          linkClicked(row.questionnaireId, row.version);
                        }}
                      >
                        <Text tid='start' /> <ArrowForwardIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        ) : (
          <Container
            maxWidth='md'
            component='div'
            classes={{
              root: classes.containerRoot,
            }}
          >
            <div style={{ display: 'flex' }}>
              <PriorityHighIcon className={classes.icon} />
              <Typography variant='h6'>
                <Text tid='contactSystemAdminToProvideYouAccess' />
              </Typography>
            </div>
          </Container>
        )}
      </Container>
    );
  }

  return (
    <Container
      maxWidth='md'
      component='div'
      classes={{
        root: classes.containerRoot,
      }}
    >
      <Loader />
    </Container>
  );
};

export default withRouter(AssessmentSelect);
