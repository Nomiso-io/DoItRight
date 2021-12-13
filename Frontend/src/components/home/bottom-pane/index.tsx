// tslint:disable: max-line-length
import React, { Fragment } from 'react';
import { Typography, makeStyles, Grid, Divider } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Background from './Background.jpg';
import DoItRightCycle from './DoItRightCycle.png';
import { Text } from '../../../common/Language';

interface ILeftPane {
  redirectUrl: string;
}

const useStyles = makeStyles((theme) => ({
  gridItem: {
    height: 'auto',
    paddingLeft: '8%',
    paddingRight: '8%',
    paddingTop: '50px',
    backgroundColor: 'inherit',
  },
  info: {
    textAlign: 'justify',
    letterSpacing: '0.02em',
    fontSize: '18px !important',
  },
  secondHeading: {
    fontSize: '24px',
    fontWeight: 400,
    textAlign: 'justify',
    marginTop: '40px',
    paddingLeft: '8%',
    paddingRight: '8%',
    lineHeight: '2.28rem',
  },
  headingInfo: {
    fontSize: '30px',
    fontWeight: 700,
    textAlign: 'justify',
    color: '#000',
  },
  icon: {
    objectFit: 'cover',
    width: '80%',
    marginLeft: '10%',
    height: 'auto',
  },
  button: {
    cursor: 'pointer',
    fontWeight: 400,
    fontSize: '18px',
    backgroundColor: '#042E5B',
    '&:hover, &:focus, &:active': {
      backgroundColor: '#042E5B',
    },
  },
  dividerSmall: {
    maxWidth: '20%',
    marginLeft: '40%',
    marginTop: '40px',
    marginBottom: '20px',
  },
  divider: {
    marginTop: '40px',
    marginBottom: '20px',
  },
  infoParagraph: {
    fontSize: '18px !important',
    marginTop: '20px',
    paddingLeft: '8%',
    textAlign: 'justify',
    paddingRight: '8%',
    letterSpacing: '0.02em',
  },
  contactLine: {
    fontSize: '16px !important',
    marginBottom: '20px',
    paddingLeft: '10%',
    textAlign: 'justify',
    paddingRight: '10%',
    letterSpacing: '0.02em',
  },
  redFont: {
    color: '#a82e2e',
  },
}));

const BottomPane = (props: ILeftPane) => {
  const classes = useStyles();

  const onClick = () => {
    window.open(
      props.redirectUrl,
      '_self',
      `toolbar=no, location=no, directories=no, status=no, menubar=no,
            scrollbars=no, resizable=no, copyhistory=no, width=${500},
            height=${5000}, top=${300}, left=${300}`
    );
  };

  return (
    <Fragment>
      <Typography variant='h2' className={classes.secondHeading}>
        <Text tid='devopsDef1' />
        &nbsp;
        <span className={classes.redFont}>DevOops!!</span>
      </Typography>
      <Typography
        variant='h2'
        style={{ marginTop: '20px' }}
        className={classes.secondHeading}
      >
        <Text tid='devopsDef2' />
      </Typography>
      <Divider variant='middle' className={classes.dividerSmall} />
      <Typography className={classes.infoParagraph}>
        <Text tid='devopsDef3' />
      </Typography>
      <Grid container direction='row' className={classes.gridItem}>
        <Grid item xs>
          <Typography className={classes.headingInfo}>
            <Text tid='whyDevOpsDifficult' />
          </Typography>
          <br />
          <Typography className={classes.info}>
            <Text tid='answerOneForDevOpsDifficult' />
          </Typography>
          <br />
          <Typography className={classes.info}>
            <Text tid='answerTwoForDevOpsDifficult' />
          </Typography>
          <br />
        </Grid>
        <Grid item xs>
          <div>
            <img
              className={classes.icon}
              src={Background}
              alt='DevOps Background'
            />
          </div>
        </Grid>
      </Grid>
      <Divider className={classes.divider} />
      <Typography className={classes.infoParagraph}>
        <Text tid='devopsDef4' />
      </Typography>
      <Typography className={classes.infoParagraph}>
        <Text tid='devopsDef5' />
      </Typography>
      <Grid container direction='row' className={classes.gridItem}>
        <Grid item xs>
          <div>
            <img
              className={classes.icon}
              src={DoItRightCycle}
              alt='DoItRight Cycle'
            />
          </div>
        </Grid>
        <Grid item xs>
          <Typography className={classes.headingInfo}>
            <Text tid='howOurAssessmentWorks' />
          </Typography>
          <br />
          <Typography className={classes.info}>
            <strong>
              <Text tid='answerOneForOurAssessmentWorks' />
            </strong>
          </Typography>
          <br />
          <Typography className={classes.info}>
            <strong>
              <Text tid='assess' /> -
            </strong>
            <Text tid='answerTwoForOurAssessmentWorks' />
          </Typography>
          <br />
          <Typography className={classes.info}>
            <strong>
              <Text tid='review' /> -
            </strong>
            <Text tid='answerThreeForOurAssessmentWorks' />
          </Typography>
          <br />
          <Typography className={classes.info}>
            <strong>
              <Text tid='analyse' /> -
            </strong>
            <Text tid='answerFourForOurAssessmentWorks' />
          </Typography>
          <br />
          <Typography className={classes.info}>
            <strong>
              <Text tid='action' /> -
            </strong>{' '}
            <Text tid='answerFiveForOurAssessmentWorks' />
          </Typography>
          <br />
          <Button
            variant='contained'
            color='primary'
            className={classes.button}
            onClick={onClick}
          >
            <Text tid='measureYourself' />
          </Button>
          <br />
        </Grid>
      </Grid>
      <Divider className={classes.divider} />
      <Typography className={classes.contactLine}>
        <Text tid='contactUs' />
        <a href='mailto:operations@pinimbus.com'>operations@pinimbus.com</a>
      </Typography>
    </Fragment>
  );
};

export { BottomPane };
