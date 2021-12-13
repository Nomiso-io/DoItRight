import React, { useState, useEffect, Fragment } from 'react';
import {
  Typography,
  makeStyles,
  Container,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Checkbox,
  Snackbar,
  SnackbarContent,
} from '@material-ui/core';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../reducers';
import { Http } from '../../../utils';
import Loader from '../../loader';
import { withRouter } from 'react-router-dom';
import Success from '../../success-page';
import { MANAGE_TEAMS } from '../../../pages/admin';
import { buttonStyle } from '../../../common/common';
import { Text } from '../../../common/Language';
import '../../../css/assessments/style.css';

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: '36px',
    position: 'relative',
    minWidth: '10%',
    ...buttonStyle,
  },
  containerRoot: {
    marginTop: '50px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    paddingBottom: theme.spacing(4),
  },
  backButton: {
    marginTop: '36px',
    position: 'relative',
    minWidth: '10%',
    marginRight: '20px',
    ...buttonStyle,
  },
}));

const AssignAssessment = (props: any) => {
  const classes = useStyles();
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  // tslint:disable-next-line: one-variable-per-declaration
  const [assessments, setAssessments] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [failure, setFailure] = useState(false);
  const [failureMessage, setFailureMessage] = useState(
    <Text tid='somethingWentWrong' />
  );
  const [
    selectedQuestionnairePosted,
    setSelectedQuestionnairePosted,
  ] = useState(false);
  let msgFailure = failureMessage;
  let msgSuccess = <Text tid='questionnairesAssigned' />;

  useEffect(() => {
    if (assessments && assessments.questionnaireSelected) {
      setSelected(assessments.questionnaireSelected);
    }
  }, [assessments]);

  const questionnaireSelected = (questionnaire: any) => {
    const index = selected.indexOf(questionnaire.questionnaireId);
    if (index !== -1) {
      const selectedTemp = selected;
      selectedTemp.splice(index, 1);
      setSelected([...selectedTemp]);
    } else {
      setSelected([...selected, questionnaire.questionnaireId]);
    }
  };

  useEffect(() => {
    Http.get({
      url: `/api/v2/assignment?teamId=${props.teamId}&manage=true`,
      state: stateVariable,
    })
      .then((response: any) => {
        setAssessments(response);
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
  }, []);

  const handleSubmit = () => {
    const teamAssessments: string[] = [props.teamId];
    const postData = {
      questionnaireId: selected,
      teamId: teamAssessments,
    };
    Http.post({
      url: `/api/v2/assignment`,
      body: {
        ...postData,
      },
      state: stateVariable,
    })
      .then((response: any) => {
        setSelectedQuestionnairePosted(true);
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
  };

  const handleClose = () => {
    setFailure(false);
  };

  const renderPage = () => {
    if (selectedQuestionnairePosted) {
      return (
        <Fragment>
          <Success message={msgSuccess} />
          <div className='bottomButtonsContainer'>
            <Button
              className={classes.backButton}
              variant='outlined'
              onClick={() => {
                props.goBack(MANAGE_TEAMS);
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
        <Container
          maxWidth='md'
          component='div'
          classes={{
            root: classes.containerRoot,
          }}
        >
          <Paper style={{ width: '100%' }}>
            <Table className='table'>
              <TableHead className='tableHead'>
                <TableRow>
                  <TableCell className='tableHeadCell'>
                    <Typography className='tableHeadText'>
                      <Text tid='assessments' />
                    </Typography>
                  </TableCell>
                  <TableCell className='tableHeadCell'>
                    <Typography className='tableHeadText'>
                      <Text tid='select' />
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assessments.questionnaires.map((row: any, index: number) => (
                  <TableRow
                    key={row.questionnaireId}
                    style={
                      index % 2
                        ? { background: '#EFEFEF' }
                        : { background: 'white' }
                    }
                  >
                    <TableCell component='th' scope='row' className='tableCell'>
                      <Typography className='tableBodyText'>
                        {row.displayName}
                      </Typography>
                    </TableCell>
                    <TableCell component='th' scope='row' className='tableCell'>
                      <Checkbox
                        onClick={() => {
                          questionnaireSelected(row);
                        }}
                        checked={selected.includes(row.questionnaireId)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          <div className='bottomButtonsContainer'>
            <Button
              className={classes.backButton}
              variant='outlined'
              onClick={() => {
                props.goBack(MANAGE_TEAMS);
              }}
            >
              <Text tid='goBack' />
            </Button>
            <Button
              onClick={handleSubmit}
              className={classes.button}
              variant='outlined'
            >
              <Text tid='submit' />
            </Button>
          </div>
        </Container>
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

  return (
    <Fragment>
      {assessments !== null ? (
        renderPage()
      ) : (
        <Container className='loaderStyle'>
          <Loader />
        </Container>
      )}
    </Fragment>
  );
};

export default withRouter(AssignAssessment);
