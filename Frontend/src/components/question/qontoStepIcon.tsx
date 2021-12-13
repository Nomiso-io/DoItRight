import React from 'react';
import {
  StepIconProps,
  withStyles,
  StepConnector,
  makeStyles,
} from '@material-ui/core';
import CheckBoximg from '../../logo/checkboximg.png';
import BlankSquare from '../../logo/inactivebox.png';
import Square from '../../logo/activebox.png';
import clsx from 'clsx';

const useQontoStepIconStyles = makeStyles({
  root: {
    color: '#eaeaf0',
    display: 'flex',
    height: 22,
    alignItems: 'center',
  },
  square: {
    height: '19px',
    width: '19px',
    borderRadius: '50%',
    backgroundColor: 'black',
  },
  active: {
    color: 'white',
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  },
  completed: {
    color: 'black',
    zIndex: 1,
    fontSize: '60px',
  },
});

export const QontoConnector = withStyles({
  alternativeLabel: {
    top: 7,
    left: 'calc(-50% + 20px)',
    right: 'calc(50% + 20px)',
  },
  active: {
    '& $line': {
      borderColor: '#248f24',
    },
  },
  completed: {
    '& $line': {
      borderColor: '#248f24',
    },
  },
  line: {
    // borderBlockEndWidth:"5px",
    // borderBlockStartWidth:"5px",
    // lineHeight: "0px",
    borderStyle: 'dashed',
    borderWidth: '2px',
    // borderColor:"white",
    // borderRadius: 0.5,
  },
})(StepConnector);

const BlankSquareIcon = () => {
  return (
    <div>
      <img src={BlankSquare} alt='Blank Square' />
    </div>
  );
};

const CheckBoxIcon = () => {
  return (
    <div>
      <img src={CheckBoximg} alt='Check Box' />
    </div>
  );
};

const SquareIcon = () => {
  return (
    <div>
      <img src={Square} alt='square' />
    </div>
  );
};

export function QontoStepIcon(props: StepIconProps) {
  const classes = useQontoStepIconStyles();
  const { active, completed } = props;

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
      })}
    >
      {completed ? (
        <CheckBoxIcon />
      ) : active ? (
        <SquareIcon />
      ) : (
        <BlankSquareIcon />
      )}
    </div>
  );
}
