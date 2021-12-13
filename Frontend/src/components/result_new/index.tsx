import React, { Fragment } from 'react';
// tslint:disable: all
import Box from '@material-ui/core/Box';
import ChangingProgressProvider from './ChangingProgressProvider';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import 'react-svg-radar-chart/build/css/index.css';
import { IResultItem } from '../../model';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { Text } from '../../common/Language';

interface IResultData {
  data: IResultItem;
  userLevels: any;
}

const useStyles = makeStyles((theme) => ({
  resultIndexItem: {
    maxWidth: '100%',
    alignItems: 'center',
    textAlignLast: 'center',
    paddingTop: '7%',
  },
  resultIndexSubContainer: {
    maxWidth: '72%',
    margin: 'auto',
  },
  userLevelScores: {
    fontSize: '22px',
    color: '#000',
  },
}));

function ResultRenderer(props: IResultData) {
  const classes = useStyles();
  const { data, userLevels } = props;
  const percentage = data.percentage;
  let path_color: string = '#11BDEB';

  userLevels.forEach((level: any) => {
    if (data.level === level.name) {
      path_color = level.color;
    }
  });

  return (
    <Fragment>
      <Typography
        variant='h4'
        align='center'
        className={classes.userLevelScores}
      >
        <Text tid='overallScore' />
      </Typography>
      <Box className={classes.resultIndexItem}>
        <div className={classes.resultIndexSubContainer}>
          <ChangingProgressProvider values={[0, percentage]}>
            {(percentage: number) => (
              <CircularProgressbar
                value={percentage}
                text={`${percentage}%`}
                styles={buildStyles({
                  pathTransitionDuration: 1,
                  strokeLinecap: 'round',
                  trailColor: '#d6d6d6',
                  pathColor: path_color,
                })}
              />
            )}
          </ChangingProgressProvider>
        </div>
      </Box>
    </Fragment>
  );
}

export default ResultRenderer;
