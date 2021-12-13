import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { Text } from '../../common/Language';

const useStyles = makeStyles((theme) => ({
  containerRoot: {
    display: 'flex',
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    top: '120px',
  },
  text: {
    marginTop: theme.spacing(2),
  },
}));

const Relogin = (props: any) => {
  const classes = useStyles();

  useEffect(() => {
    setTimeout(() => {
      props.history.push('/logout');
    }, 3000);
  });

  return (
    <Container className={classes.containerRoot}>
      <CircularProgress />
      <Typography className={classes.text}>
        <Text tid='loginAgain' />
      </Typography>
    </Container>
  );
};

export default withRouter(Relogin);
