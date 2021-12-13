// tslint:disable: jsx-no-lambda

import React from 'react';
import {
  Typography,
  createMuiTheme,
  makeStyles,
  Container,
  Button,
} from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { Text } from '../../../common/Language';

interface ILeftPane {
  redirectUrl: string;
}

const theme = createMuiTheme({
  typography: {
    h2: {
      fontSize: '7',
    },
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: 'left',
    margin: '20px',
    marginTop: '180px',
  },
  secondaryText: {
    fontWeight: 'normal',
    fontSize: '32px',
  },
  button: {
    margin: theme.spacing(2),
    marginLeft: '0px',
    backgroundColor: '#042E5B',
    '&:hover, &:focus, &:active': {
      backgroundColor: '#042E5B',
    },
  },
}));

const LABEL = <Text tid='measureYourself' />;
const LeftPane = (props: ILeftPane) => {
  const classes = useStyles();

  const onClick = () => {
    window.open(
      props.redirectUrl,
      '_self',
      `toolbar=no, location=no, directories=no, status=no, menubar=no,
            scrollbars=no, resizable=no, copyhistory=no, width=${500},
            height=${5000}, top=${300}, left=${300}`
    );
  };
  return (
    <Container className={classes.root}>
      <ThemeProvider theme={theme}>
        <Typography variant='h2'>
          <strong>
            DevSecOps <Text tid='journey' />
            &nbsp;...
          </strong>
        </Typography>
      </ThemeProvider>
      <Typography className={classes.secondaryText}>
        <Text tid='areYouDoingItRight' />
      </Typography>
      <Button
        onClick={onClick}
        variant='contained'
        size='large'
        color='primary'
        className={classes.button}
      >
        {LABEL}
      </Button>
    </Container>
  );
};
export default LeftPane;
