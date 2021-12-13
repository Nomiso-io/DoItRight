import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { IResultItem } from '../../model';
import { HorizontalBarChart } from '../admin/dashboard/questions-chart/horizontal_bar_graph';

interface IResultData {
  result: IResultItem;
  benchmarkScore?: number;
  userLevels: any;
}

const useStyles = makeStyles(() => ({
  spiderweb: {
    padding: '3%',
    maxWidth: '100%',
    minHeight: '100%',
  },
}));

function SpiderWeb(props: IResultData) {
  const classes = useStyles();
  const marks = new Array();
  let benchmarkScore = new Array();
  const colorVal: string[] = [];

  let color = [];
  let index = props.benchmarkScore ? props.benchmarkScore / 10 : -1;
  color[Math.ceil(index)] = 'red';

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
            labelString: 'Score',
          },
          ticks: {
            stepSize: 10,
            suggestedMax: 100,
            min: 0,
          },
          gridLines: {
            color: color,
            lineWidth: 1,
            // borderDash: [5, 5],
          },
        },
      ],
      yAxes: [
        {
          stacked: true,
          barPercentage: 0.6,
          categorySpacing: 0,
        },
      ],
    },
    type: 'horizontalBar',
  };

  let result = Object.keys(props.result.categoryWiseResults);

  result = result.sort((a, b) => {
    return a > b ? 1 : -1;
  });

  result.forEach((el) => {
    marks.push(props.result.categoryWiseResults[el].percentage);
  });

  marks.forEach((score) => {
    props.userLevels.forEach((level: any) => {
      if (score <= level.upperLimit && score >= level.lowerLimit) {
        colorVal.push(level.color);
      }
    });
  });

  if (props.benchmarkScore) {
    benchmarkScore = Array(result.length).fill(props.benchmarkScore);
  }

  const spideyData = {
    labels: result,
    datasets: [
      {
        data: marks,
        label: 'Score',
        backgroundColor: colorVal,
        borderColor: colorVal,
        borderWidth: 1,
        hoverBackgroundColor: colorVal,
        hoverBorderColor: colorVal,
      },
      {
        data: benchmarkScore,
        label: 'Benchmark Score',
        backgroundColor: '#ffebeb',
        borderColor: 'none',
        borderWidth: 1,
        hoverBackgroundColor: '#ffebeb',
        hoverBorderColor: 'none',
      },
    ],
  };

  return (
    <Box className={classes.spiderweb}>
      <HorizontalBarChart
        data={spideyData}
        xAxisLabel={'Score'}
        stepSize={10}
        suggestedMax={100}
        options={options}
      />
    </Box>
  );
}
export default SpiderWeb;
