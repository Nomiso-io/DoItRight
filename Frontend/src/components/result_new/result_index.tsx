import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import ChangingProgressProvider from './ChangingProgressProvider';
import 'react-circular-progressbar/dist/styles.css';
import { Typography } from '@material-ui/core';
import { IUserlevel } from '../../model';
import { Text } from '../../common/Language';

interface IResultIndexProps {
  indexData: IUserlevel[];
  maxScore: number;
}

const useStyles = makeStyles((theme) => ({
  resultIndexItem: {
    width: '100%',
    display: 'flex',
    margin: '5px',
  },
  resultIndexLabel: {
    fontSize: '16px',
    alignItems: 'left',
  },
  userLevelScores: {
    fontSize: '22px',
    color: '#000',
    margin: 'auto',
    //marginLeft: '5px'
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    spaceBetween: '10px',
    width: '100%',
  },
  imageContainer: {
    maxHeight: '100%',
    width: '80%',
    maxWidth: '34%',
  },
  textContainer: {
    margin: '10px',
    width: '60%',
    display: 'flex',
    //justifyContent: 'center',
    alignItems: 'center',
    maxHeight: '80%',
  },
  scoreIndexTextContainer: {
    display: 'flex',
    width: '25%',
    justifyContent: 'center',
    alignContent: 'center',
  },
}));

function ResultIndex(props: IResultIndexProps) {
  const classes = useStyles(props);
  const elementsArray = props.indexData.sort((a: IUserlevel, b: IUserlevel) => {
    return a.lowerLimit > b.lowerLimit ? 1 : -1;
  });
  return (
    <Fragment>
      <Container component='div' className={classes.container}>
        <div className={classes.scoreIndexTextContainer}>
          <Typography variant='h4' className={classes.userLevelScores}>
            <Text tid='scoreIndex' />
          </Typography>
        </div>
        <div style={{ display: 'flex', width: '100%' }}>
          {elementsArray.map((el: IUserlevel, i: number) => {
            return (
              <Box component='div' key={i} className={classes.resultIndexItem}>
                <div className={classes.imageContainer}>
                  <ChangingProgressProvider
                    values={[el.lowerLimit, el.upperLimit]}
                  >
                    {(percentage: number) => (
                      <CircularProgressbar
                        value={percentage}
                        text={`${el.lowerLimit}-${el.upperLimit}`}
                        strokeWidth={5}
                        styles={buildStyles({
                          pathTransitionDuration: 1,
                          strokeLinecap: 'butt',
                          trailColor: '#d6d6d6',
                          pathColor: el.color,
                          textSize: '18px',
                          textColor: '#808080',
                        })}
                      />
                    )}
                  </ChangingProgressProvider>
                </div>
                <div className={classes.textContainer}>
                  <Typography className={classes.resultIndexLabel}>
                    <strong>{el.name}</strong>
                  </Typography>
                </div>
              </Box>
            );
          })}
        </div>
      </Container>
    </Fragment>
  );
}

export default ResultIndex;
