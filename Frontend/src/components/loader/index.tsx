import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Typography } from '@material-ui/core';
import { Text } from '../../common/Language';

interface ILoaderProps {
  label?: string;
}
const useStyles = makeStyles((theme) => ({
  progress: {
    margin: theme.spacing(3),
  },
}));
const Loader = (props: ILoaderProps) => {
  const classes = useStyles();
  const LABEL = props.label ? props.label : <Text tid='loading' />;
  return (
    <Fragment>
      <CircularProgress className={classes.progress} />
      <Typography variant='h5'>{LABEL}</Typography>
    </Fragment>
  );
};
export default Loader;
