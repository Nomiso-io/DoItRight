import { Auth } from 'aws-amplify';
import React, { useEffect } from 'react';
import {
  useActions,
  removeUserDetails,
  removeAssessmentDetails,
} from '../../actions';
import { Grid, Container, Typography, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Text } from '../../common/Language';

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%',
    padding: 0,
  },
  paper: {
    textAlign: 'center',
    maxWidth: '400px',
    padding: '30px',
    margin: 'auto',
    backgroundColor: '#F4F5F5',
  },
  gridContainer: {
    minHeight: '30vh',
    textAlign: 'center',
    padding: '30px',
  },
});

const TrialClose = (props: any) => {
  const classes = useStyles();
  const removeUserData = useActions(removeUserDetails);
  const removeAssessmentData = useActions(removeAssessmentDetails);

  useEffect(() => {
    Auth.signOut().then((data: any) => {
      removeUserData();
      removeAssessmentData();
    });
  }, []);

  return (
    // tslint:disable-next-line: jsx-wrap-multiline
    <Container maxWidth='xl' classes={{ root: classes.root }}>
      <Grid container direction='row' className={classes.gridContainer}>
        {
          <Paper className={classes.paper}>
            <Typography variant='h6' gutterBottom>
              <Text tid='thankYouForTakingTheTrialAssessment' />
            </Typography>
          </Paper>
        }
      </Grid>
    </Container>
  );
};
export default TrialClose;
