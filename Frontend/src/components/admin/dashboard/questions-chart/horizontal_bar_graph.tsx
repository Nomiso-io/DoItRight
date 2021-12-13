import React from 'react';
import { HorizontalBar } from 'react-chartjs-2';
import { makeStyles } from '@material-ui/styles';
import { Container } from '@material-ui/core';
import { Loader } from '../../..';
import { IBarDisplayData } from '../category-bar-chart/bar';

interface IProps {
  data: IBarDisplayData | null | undefined;
  xAxisLabel: string;
  stepSize?: number;
  suggestedMax?: number;
  clickHandler?: any;
  options?: any;
}

const useStyles = makeStyles(() => ({
  root: {
    width: '80%',
    height: '80%',
  },
  loader: {
    marginTop: '50px',
    marginBottom: '100px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
}));

export const HorizontalBarChart = (props: IProps) => {
  const classes = useStyles();
  const options = {
    responsive: true,
    legend: {
      display: false,
    },
    scales: {
      xAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: props.xAxisLabel ? props.xAxisLabel : '',
          },
          ticks: {
            stepSize: props.stepSize ? props.stepSize : 2,
            suggestedMax: props.suggestedMax ? props.suggestedMax : 6,
            min: 0,
          },
        },
      ],
      yAxes: [
        {
          barPercentage: 0.6,
          categorySpacing: 0,
        },
      ],
    },
    type: 'horizontalBar',
  };

  if (!props.data) {
    return (
      <Container className={classes.loader}>
        <Loader />
      </Container>
    );
  }

  return (
    <div className={classes.root}>
      {props.clickHandler ? (
        <HorizontalBar
          data={props.data}
          options={props.options ? props.options : options}
          onElementsClick={props.clickHandler}
        />
      ) : (
        <HorizontalBar
          data={props.data}
          options={props.options ? props.options : options}
        />
      )}
    </div>
  );
};
