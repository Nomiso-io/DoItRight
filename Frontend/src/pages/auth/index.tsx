import React, { useEffect, useState, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import { useActions } from '../../actions';
import { Typography, Container } from '@material-ui/core';
import { saveUserDetails } from '../../actions/user';
import jwtDecode from 'jwt-decode';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactGA from 'react-ga';
import { Text } from '../../common/Language';

const useStyles = makeStyles((theme) => ({
  containerRoot: {
    textAlign: 'center',
    alignContent: 'center',
    height: '100vh',
    width: '100%',
  },
  progress: {
    margin: theme.spacing(4),
  },
}));

const Auth = (props: any) => {
  const classes = useStyles();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const saveUserData = useActions(saveUserDetails);
  const userStatus = useSelector((state: IRootState) => {
    return state.user;
  });

  useEffect(() => {
    if (userStatus.idToken) {
      if (userStatus.team != null) {
        setIsAuthenticated(true);
        setIsAuthenticating(false);
      } else {
        props.history.push('teamselect');
      }
    }
  }, [userStatus]);

  useEffect(() => {
    if (!userStatus.idToken) {
      const tokens = extractTokens(window.location.hash);
      const tokenInfo: any = jwtDecode(tokens!.idToken);
      let teamId = null;
      const env = process.env.REACT_APP_STAGE;
      if ((env === 'Dev') || (env === 'Beta')) {
        if (tokenInfo['custom:teamName']) {
          teamId =
            tokenInfo['custom:teamName'] !== ''
              ? tokenInfo['custom:teamName']
              : 'Others';
        } else {
          teamId = 'Others';
        }
      } else {
        if (tokenInfo['custom:teamName']) {
          teamId =
            tokenInfo['custom:teamName'] !== ''
              ? tokenInfo['custom:teamName']
              : null;
        }
      }
      if (tokens && tokens.idToken && tokens.accessToken) {
        saveUserData({
          idToken: tokens.idToken,
          accessToken: tokens.accessToken,
          userDetails: jwtDecode(tokens.idToken),
          team: teamId,
          roles: tokenInfo['cognito:groups'],
        });
      } else {
        console.error('Error while setting in local storage--');
      }
    }
  }, []);

  if (isAuthenticated) {
    ReactGA.event({
      category: 'Auth',
      action: 'User Login',
      label:
        userStatus.userDetails && userStatus.userDetails.email
          ? userStatus.userDetails.email
          : '',
    });
    // Setting up the user for the Google analytics session
    if (userStatus.userDetails && userStatus.userDetails.email) {
      const email = userStatus.userDetails.email.replace('@', '-at-');
      ReactGA.set({
        userId: email,
      });
    }

    if (userStatus && userStatus.roles) {
      if (
        userStatus.roles.includes('Admin') ||
        userStatus.roles.includes('Manager')
      ) {
        return (
          <Redirect
            to={{
              pathname: '/assessment/teams',
            }}
          />
        );
      }
    } else {
      return (
        <Redirect
          to={{
            pathname: '/assessmentselect',
          }}
        />
      );
    }
  }

  if (isAuthenticating) {
    return (
      <Fragment>
        <Container className={classes.containerRoot}>
          <CircularProgress className={classes.progress} />
        </Container>
        <CircularProgress />
        <Typography variant='h4'>
          <Text tid='authenticating' />
        </Typography>
      </Fragment>
    );
  }
  return (
    <Redirect
      to={{
        pathname: '/',
      }}
    />
  );
};
const extractTokens = (url: string) => {
  const indexOfAccessToken = url.indexOf('access_token');
  const indexOfIdToken = url.indexOf('id_token');
  const tokens = url.split('=');
  if (indexOfAccessToken >= 0 && indexOfIdToken >= 0) {
    const idToken = checkIfSepratorExists(tokens[1])
      ? getTokenFromSepratorArray(tokens[1])
      : tokens[1];
    const accessToken = checkIfSepratorExists(tokens[2])
      ? getTokenFromSepratorArray(tokens[2])
      : tokens[2];
    return { idToken, accessToken };
  }
  return null;
};
const checkIfSepratorExists = (url: string) => {
  return url && url.indexOf('&') >= 0 ? true : false;
};
const getTokenFromSepratorArray = (url: string) => {
  return url && url.substring(0, url.indexOf('&'));
};

export default Auth;
