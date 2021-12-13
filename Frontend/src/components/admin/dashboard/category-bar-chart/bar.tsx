import React from 'react';
import { Bar } from 'react-chartjs-2';
import { makeStyles } from '@material-ui/styles';
import { Container } from '@material-ui/core';
import { Loader } from '../../..';

export interface IBarGraphData {
  teams: any;
  userLevels: any;
  categoryList: {
    [key: string]: number;
  };
}

export interface IBarDisplayData {
  labels: string[];
  datasets: IDataSet[];
}

interface IDataSet {
  label: string;
  backgroundColor: string | string[];
  borderColor: string | string[];
  borderWidth: number;
  hoverBackgroundColor: string | string[];
  hoverBorderColor: string | string[];
  data: number[];
}

interface IProps {
  data: IBarDisplayData | null | undefined;
  yAxisLabel: string;
}
const useStyles = makeStyles((theme) => ({
  root: {
    marginLeft: '10%',
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

export const BarChart = (props: any) => {
  const classes = useStyles();
  const options = {
    responsive: true,
    legend: {
      display: true,
    },
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: props.yAxisLabel ? props.yAxisLabel : '',
          },
          ticks: {
            stepSize: 2,
            suggestedMax: 6,
            min: 0,
          },
        },
      ],
    },
    type: 'bar',
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
      <Bar
        data={props.data}
        options={options}
        onElementsClick={props.clickHandler}
      />
    </div>
  );
};
