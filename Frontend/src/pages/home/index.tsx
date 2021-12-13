import React, { useEffect, useState } from 'react';
import { useActions, setSystemDetails, setCurrentPage } from '../../actions';
import { Http } from '../../utils';
import { Grid, Container } from '@material-ui/core';
import { BottomPane } from '../../components/home/bottom-pane';
import backgroundNew from './backgrnd.jpg';
import { makeStyles } from '@material-ui/styles';
import LeftPane from '../../components/home/leftPane';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import { Loader } from '../../components';

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%',
    padding: 0,
  },
  paper: {
    marginTop: '140px',
    borderRadius: 0,
    textAlign: 'center',
    height: '100%',
  },
  img: {
    width: '100%',
    objectFit: 'contain',
    maxHeight: '45vh',
    height: '100%',
  },
  gridContainer: {
    minHeight: '50vh',
    paddingBottom: '50px',
    background: 'linear-gradient(180deg, #042E5B 23%, #17CDFA 100%)',
    color: '#fff',
  },
  bottomPane: {
    width: '100%',
    display: 'flex',
  },
  loader: {
    paddingTop: '120px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
});

const Home = (props: any) => {
  const classes = useStyles();
  const [isFetching, setIsFetching] = useState(true);
  const setSysDetails = useActions(setSystemDetails);
  const userStatus = useSelector((state: IRootState) => state.user.idToken);
  const systemDetails = useSelector((state: IRootState) => state.systemDetails);
  const stateVariable = useSelector((state: IRootState) => state);
  const setCurrentPageValue = useActions(setCurrentPage);

  useEffect(() => {
    setCurrentPageValue('');
    if (
      !systemDetails ||
      systemDetails.appClientId === '' ||
      systemDetails.appClientURL === ''
    ) {
      Http.get({
        url: '/api/v2/settings/cognito',
        state: { stateVariable },
        customHeaders: { noauthvalidate: 'true' },
      })
        .then((response: any) => {
          setSysDetails(response);
          setIsFetching(false);
        })
        .catch((error: any) => {
          setIsFetching(false);
          props.history.push('/error');
        });
    } else {
      setIsFetching(false);
    }
  }, []);

  let redirectUrl: string;
  if (userStatus) {
    redirectUrl = '/auth';
  } else {
    redirectUrl = `https://${systemDetails.appClientURL}/login?response_type=token&client_id=${systemDetails.appClientId}&redirect_uri=https://${window.location.host}/auth`;
  }

  if (isFetching) {
    return (
      <Container
        maxWidth='xl'
        classes={{
          root: classes.root,
        }}
      >
        <Container className={classes.loader}>
          <Loader />
        </Container>
      </Container>
    );
  }

  return (
    // tslint:disable-next-line: jsx-wrap-multiline
    <Container
      maxWidth='xl'
      classes={{
        root: classes.root,
      }}
    >
      <Grid container direction='row' className={classes.gridContainer}>
        <Grid item xs>
          <Container component='div'>
            <LeftPane redirectUrl={redirectUrl} />
          </Container>
        </Grid>
        <Grid item xs>
          <Container component='div' className={classes.paper}>
            <img
              className={classes.img}
              src={backgroundNew}
              alt='Are you doing it right?'
            />
          </Container>
        </Grid>
      </Grid>
      <Grid container direction='column' className={classes.bottomPane}>
        <BottomPane redirectUrl={redirectUrl} />
      </Grid>
    </Container>
  );
};

export default Home;
