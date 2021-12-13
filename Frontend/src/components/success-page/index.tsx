import React from 'react';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { Typography, makeStyles, Paper } from '@material-ui/core';

interface IProps {
  message: any;
}

const useStyles = makeStyles((theme) => ({
  icon: {
    fontSize: '75px',
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    minHeight: '250px',
    minWidth: '40%',
    maxWidth: '50%',
    margin: 'auto',
  },
}));

const Success = (props: IProps) => {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <div className={classes.icon}>
        <CheckCircleIcon
          fontSize='inherit'
          htmlColor='#7680e8'
          className={classes.icon}
        />
      </div>
      <Typography variant='h5' component='h2' color='textPrimary'>
        {props.message}
      </Typography>
    </Paper>
  );
};

export default Success;
