import { Amplify, Auth } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import {
  useActions,
  setSystemDetails,
  setCurrentPage,
  setSystemMode,
  saveUserDetails,
} from '../../actions';
import { ISystemDetails } from '../../model';
import { Http } from '../../utils';
import { Grid, Container, Typography, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import jwtDecode from 'jwt-decode';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import * as constantValues from '../../common/constantValues';
import { Loader } from '../../components';
import { Text } from '../../common/Language';
import '../../css/assessments/style.css';

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%',
    padding: 0,
  },
  paper: {
    textAlign: 'center',
    maxWidth: '400px',
    padding: '30px',
    margin: 'auto',
    backgroundColor: '#F4F5F5',
  },
  gridContainer: {
    minHeight: '30vh',
    textAlign: 'center',
    padding: '30px',
  },
});

const TrialHome = (props: any) => {
  const classes = useStyles();
  const [isFetching, setIsFetching] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  //    const userStatus = useSelector((state: IRootState) => state.user.idToken);
  const systemDetails = useSelector((state: IRootState) => state.systemDetails);
  const stateVariable = useSelector((state: IRootState) => state);
  const setSysDetails = useActions(setSystemDetails);
  const setSysMode = useActions(setSystemMode);
  const saveUserData = useActions(saveUserDetails);
  const setCurrentPageValue = useActions(setCurrentPage);

  useEffect(() => {
    if (process.env.REACT_APP_STAGE === 'Prod') {
      setIsFetching(false);
      props.history.push('/error');
    }
    setCurrentPageValue('');
    if (
      !systemDetails ||
      systemDetails.appClientId === '' ||
      systemDetails.appClientURL === '' ||
      systemDetails.userpoolId === ''
    ) {
      Http.get({
        url: '/api/v2/settings/cognito',
        state: { stateVariable },
        customHeaders: { noauthvalidate: 'true' },
      })
        .then((response: any) => {
          setSysDetails(response);
          setSysMode(constantValues.TRIAL_MODE);
          setIsFetching(false);
          logInTrialUser(response);
        })
        .catch((error: any) => {
          setIsFetching(false);
          props.history.push('/error');
        });
    } else {
      setIsFetching(false);
      setSysMode(constantValues.TRIAL_MODE);
      logInTrialUser(systemDetails);
    }
  });

  const logInTrialUser = async (sysDetails: ISystemDetails) => {
    if (sysDetails) {
      Amplify.configure({
        Auth: {
          mandatorySignIn: true,
          region: 'us-east-1',
          userPoolId: sysDetails.userpoolId,
          userPoolWebClientId: sysDetails.appClientId,
        },
      });

      try {
        const user = await Auth.signIn(
          constantValues.TRIAL_USERNAME,
          constantValues.TRIAL_PASSWORD
        );
        setIsSigningIn(false);
        if (
          user &&
          user.signInUserSession.idToken &&
          user.signInUserSession.accessToken
        ) {
          const tokenInfo: any = jwtDecode(
            user.signInUserSession.idToken.jwtToken
          );
          saveUserData({
            idToken: user.signInUserSession.idToken.jwtToken,
            accessToken: user.signInUserSession.accessToken,
            userDetails: jwtDecode(user.signInUserSession.idToken.jwtToken),
            team:
              tokenInfo['custom:teamName'] &&
              tokenInfo['custom:teamName'] !== ''
                ? tokenInfo['custom:teamName']
                : 'Others',
            roles: tokenInfo['cognito:groups'],
          });
          setIsSignedIn(true);
        }
      } catch (error) {
        setIsSigningIn(false);
      }
    }
  };

  if (isFetching) {
    return (
      <Container
        maxWidth='xl'
        classes={{
          root: classes.root,
        }}
      >
        <Container className='loaderStyle'>
          <Loader />
        </Container>
      </Container>
    );
  }

  if (isSigningIn) {
    return (
      <Container
        maxWidth='xl'
        classes={{
          root: classes.root,
        }}
      >
        <Container className='loaderStyle'>
          <Loader />
        </Container>
      </Container>
    );
  }

  return (
    // tslint:disable-next-line: jsx-wrap-multiline
    <Container maxWidth='xl' classes={{ root: classes.root }}>
      <Grid container direction='row' className={classes.gridContainer}>
        {isSignedIn ? (
          <Redirect
            to={{
              pathname: '/assessmentselect',
            }}
          />
        ) : (
          <Paper className={classes.paper}>
            <Typography variant='h6' gutterBottom>
              <Text tid='errorConnectingWithServer' />
            </Typography>
          </Paper>
        )}
      </Grid>
    </Container>
  );
};
export default TrialHome;
