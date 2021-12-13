import React from 'react';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

interface IButtonProps {
  label: string;
  onClick?: () => void;
}
const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(2),
  },
}));
const ButtonComponent = (props: IButtonProps) => {
  const classes = useStyles();
  return (
    <Button
      onClick={props.onClick}
      variant='contained'
      size='large'
      color='primary'
      className={classes.button}
    >
      {props.label}
    </Button>
  );
};
export default ButtonComponent;
