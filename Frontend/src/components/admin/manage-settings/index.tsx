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
  CircularProgress,
  Backdrop,
} from '@material-ui/core';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../reducers';
import Loader from '../../loader';
import { Http } from '../../../utils';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { withRouter } from 'react-router-dom';
import { buttonStyle } from '../../../common/common';
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
  buttons: {
    ...buttonStyle,
  },
}));

const ManageSettings = (props: any) => {
  const classes = useStyles();
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [responseReceived, setResponseReceived] = useState(false);
  const [allSettings, setAllSettings] = useState<Object[]>([]);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const userDetails = useSelector((state: IRootState) => {
    return state.user;
  });

  const fetchSettingsList = () => {
    setBackdropOpen(true);
    Http.get({
      url: '/api/v2/settings',
      state: stateVariable,
    })
      .then((response: any) => {
        if (Array.isArray(response)) {
          setAllSettings(response);
        }
        setResponseReceived(true);
        setBackdropOpen(false);
      })
      .catch((error) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 400) {
          props.history.push('/relogin');
        } else if (object.code === 401) {
          props.history.push('/relogin');
        } else {
          props.history.push('/error');
        }
        setBackdropOpen(false);
      });
  };

  useEffect(() => {
    fetchSettingsList();
  }, []);

  const renderSettingsTable = () => {
    return (
      <Fragment>
        <Container maxWidth='md' component='div' className='containerRoot'>
          <Backdrop className={classes.backdrop} open={backdropOpen}>
            <CircularProgress color='inherit' />
          </Backdrop>
          <Paper className='tableArea'>
            <Table className='table'>
              <TableHead className='tableHead'>
                <TableRow>
                  <TableCell className='tableHeadCell'>
                    <Typography className='tableHeadText'>
                      <Text tid='settingType' />
                    </Typography>
                  </TableCell>
                  <TableCell align='center' className='tableHeadCell'>
                    <Typography className='tableHeadText'>
                      <Text tid='actions' />
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allSettings.map((row: any, index: number) => {
                  return (
                    <TableRow
                      key={index}
                      style={
                        index % 2
                          ? { background: '#EFEFEF' }
                          : { background: 'white' }
                      }
                    >
                      <TableCell
                        component='th'
                        scope='row'
                        className='tableCell'
                      >
                        <Typography className='tableBodyText'>
                          <Text tid={`admin.settings.${row.type}.name`} />
                        </Typography>
                      </TableCell>
                      <TableCell
                        component='th'
                        scope='row'
                        className='tableCell'
                        align='center'
                      >
                        <Button
                          variant='outlined'
                          className={classes.buttons}
                          disabled={
                            !(
                              userDetails &&
                              userDetails.roles &&
                              userDetails.roles.includes('Admin')
                            )
                          }
                          onClick={() => {
                            props.editSettingsClicked(row.type);
                          }}
                        >
                          <Text tid='configure' />
                          <ArrowForwardIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
          <div className='bottomButtonsContainer'>
            <Button
              className={classes.backButton}
              variant='outlined'
              onClick={props.goBack}
            >
              <Text tid='goBack' />
            </Button>
          </div>
        </Container>
      </Fragment>
    );
  };

  return (
    <Fragment>
      {responseReceived ? (
        renderSettingsTable()
      ) : (
        <Container className='loaderStyle'>
          <Loader />
        </Container>
      )}
    </Fragment>
  );
};

export default withRouter(ManageSettings);
