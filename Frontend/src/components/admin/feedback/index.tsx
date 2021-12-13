import React, { useEffect, useState, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../reducers';
import { Http } from '../../../utils';
import { AssessmentDocument } from '../../../model';
import {
  Container,
  Backdrop,
  CircularProgress,
  MuiThemeProvider,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  makeStyles,
  Tooltip,
} from '@material-ui/core';
// import RenderPagination from '../../common/pagination';
import { ADMIN_HOME } from '../../../pages/admin';
import { Loader } from '../..';
// import { default as MaterialLink } from '@material-ui/core/Link';
import { buttonStyle, tooltipTheme } from '../../../common/common';
import { getDate } from '../../../utils/data';
import { Text } from '../../../common/Language';
import '../../../css/assessments/style.css';

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: '36px',
    position: 'relative',
    left: '45%',
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
  firstColumn: {
    maxWidth: '150px',
    overflow: 'hidden',
  },
  commentsColumn: {
    maxWidth: '250px',
  },
}));

interface IFeedback {
  [assessmentHistory: string]: AssessmentDocument[];
}

const AdminFeedback = (props: any) => {
  const classes = useStyles();
  const [assessments, setAssessments] = useState<IFeedback>({
    assessmentHistory: [],
  });
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [responseReceived, setResponseReceived] = useState(false);
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  useEffect(() => {
    setBackdropOpen(true);
    Http.get({
      url: '/api/v2/feedback',
      state: stateVariable,
    })
      .then((response: any) => {
        response.assessmentHistory.sort(
          (a: AssessmentDocument, b: AssessmentDocument) => {
            return a.dateSubmit! > b.dateSubmit! ? -1 : 1;
          }
        );
        setAssessments(response);
        setResponseReceived(true);
        setBackdropOpen(false);
      })
      .catch((error) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          props.history.push('/relogin');
        }
      });
  }, []);
  const renderFeedbackTable = () => {
    // console.log(assessments);
    return (
      <Container maxWidth='lg' component='div' className='containerRoot'>
        <Backdrop className={classes.backdrop} open={backdropOpen}>
          <CircularProgress color='inherit' />
        </Backdrop>
        <Paper className='tableArea'>
          <Table className='table'>
            <TableHead className='tableHead'>
              <TableRow>
                <TableCell className='tableHeadCell'>
                  <Typography className='tableHeadText'>
                    <Text tid='user' />
                  </Typography>
                </TableCell>
                <TableCell align='center' className='tableHeadCell'>
                  <Typography className='tableHeadText'>
                    <Text tid='assessment' />
                  </Typography>
                </TableCell>
                <TableCell align='center' className='tableHeadCell'>
                  <Typography className='tableHeadText'>
                    <Text tid='date' />
                  </Typography>
                </TableCell>
                <TableCell align='center' className='tableHeadCell'>
                  <Typography className='tableHeadText'>
                    <Text tid='rating' />
                  </Typography>
                </TableCell>
                <TableCell align='center' className='tableHeadCell'>
                  <Typography className='tableHeadText'>
                    <Text tid='comments' />
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assessments.assessmentHistory.map(
                (row: AssessmentDocument, index: number) => {
                  return (
                    <TableRow key={index}>
                      <TableCell
                        component='th'
                        scope='row'
                        className={classes.firstColumn}
                      >
                        <MuiThemeProvider theme={tooltipTheme}>
                          <Tooltip
                            title={<Typography>{row.userId}</Typography>}
                          >
                            <Typography className='tableBodyText'>
                              {row.userId}
                            </Typography>
                          </Tooltip>
                        </MuiThemeProvider>
                      </TableCell>
                      <TableCell component='th' scope='row' align='center'>
                        <Typography className='tableBodyText'>
                          {row.assessmentName}
                        </Typography>
                      </TableCell>
                      <TableCell component='th' scope='row' align='center'>
                        <Typography className='tableBodyText'>
                          {row.dateSubmit ? getDate(row.dateSubmit) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell component='th' scope='row' align='center'>
                        <Typography className='tableBodyText'>
                          {row.feedback.rating}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align='center'
                        className={classes.commentsColumn}
                      >
                        <Typography className='tableBodyText'>
                          {row.feedback.comment}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                }
              )}
            </TableBody>
          </Table>
        </Paper>
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
        </div>
      </Container>
    );
  };

  return (
    <Fragment>
      {responseReceived ? (
        renderFeedbackTable()
      ) : (
        <Container className='loaderStyle'>
          <Loader />
        </Container>
      )}
    </Fragment>
  );
};

export default withRouter(AdminFeedback);
