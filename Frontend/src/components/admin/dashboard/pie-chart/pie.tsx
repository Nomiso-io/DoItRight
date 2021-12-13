import React from 'react';
import { Pie } from 'react-chartjs-2';
import { makeStyles } from '@material-ui/styles';
import { Container, Grid } from '@material-ui/core';
import { Loader } from '../../..';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
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
  colorReviewBox: {
    minWidth: '10px',
    maxWidth: '10px',
    minHeight: '10px',
    maxHeight: '10px',
    marginRight: '5px',
    marginTop: '5px',
  },
  legendItemContainer: {
    display: 'flex',
    paddingTop: '20%',
  },
  flexContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
}));

export interface IPieDisplayData {
  labels: string[];
  datasets: IDataSet[];
}

interface IDataSet {
  backgroundColor: string[];
  hoverBackgroundColor: string[];
  data: number[];
}

export const PieChart = (props: any) => {
  const classes = useStyles();
  const options = {
    legend: {
      display: false,
    },
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
      <Grid container>
        <Grid item sm={9}>
          <Pie
            data={props.data}
            onElementsClick={props.clickHandler}
            options={options}
          />
        </Grid>
        <Grid item sm={3}>
          <div className={classes.flexContainer}>
            {props.data ? (
              props.data.labels.map((el: string, i: number) => {
                return (
                  <div key={i} className={classes.legendItemContainer}>
                    <div
                      className={classes.colorReviewBox}
                      style={{
                        backgroundColor:
                          props.data.datasets[0].backgroundColor[i],
                      }}
                    />
                    {el}
                  </div>
                );
              })
            ) : (
              <div />
            )}
          </div>
        </Grid>
      </Grid>
    </div>
  );
};
