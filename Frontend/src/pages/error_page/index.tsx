import React from 'react';
import { Container, Typography, makeStyles } from '@material-ui/core';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { Text } from '../../common/Language';

const useStyles = makeStyles((theme) => ({
  innerContainer: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: '120px',
  },
  icon: {
    marginLeft: '50%',
  },
  rootContainer: {
    padding: '0px',
  },
}));

const ErrorPage = () => {
  const classes = useStyles();
  return (
    <Container className={classes.rootContainer}>
      <Container className={classes.innerContainer}>
        <ErrorOutlineIcon fontSize='large' className={classes.icon} />
        <Typography align='center' variant='h5'>
          <Text tid='somethingWentWrong' />
        </Typography>
      </Container>
    </Container>
  );
};

export default ErrorPage;
