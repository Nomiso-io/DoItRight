import React, { useEffect, Fragment, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
// tslint:disable: all
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import { /* RouteComponentProps, */ Redirect } from 'react-router-dom';
import { useActions } from '../../actions';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import { Typography } from '@material-ui/core';
import { fetchAssessmentResultData } from '../../actions/result';
import Success from '../../components/success-page';
// import { IAssessmentFinalResult } from '../../model';
import 'react-circular-progressbar/dist/styles.css';
import ReactGA from 'react-ga';
import { AssessmentView, Feedback } from '../../components';
import { ModalComponentInfo } from '../../components/modal-info';
import { Text } from '../../common/Language';

// interface IResultRouteParams {
//   assessmentId: string;
// }

// type IResultProps = RouteComponentProps<IResultRouteParams>;

const useStyles = makeStyles((theme) => ({
  containerRoot: {
    display: 'flex',
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    top: '120px',
  },
  progress: {
    margin: theme.spacing(4),
  },
  containerSecondary: {
    marginTop: '120px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
}));

function Result(props: any) {
  const classes = useStyles();
  const fetchAssessmentResult = useActions(fetchAssessmentResultData);
  const [fetchStatus, setFetchStatus] = useState(false);
  const assessmentResult = useSelector(
    (state: IRootState) => state.assessment.result
  );
  const hideResult = useSelector((state: IRootState) =>
    state.assessment.assessmentSummary.data
      ? state.assessment.assessmentSummary.data.hideResult
      : false
  );
  const assessmentId = props.match.params.assessmentId;
  const [openModal, setOpenModal] = useState(
    props.location
      ? props.location.state
        ? props.location.state.timerExpiry
          ? true
          : false
        : false
      : false
  );
  let msgSuccess = <Text tid='thanksForGivingThisAssessment' />;

  const renderLoadingIcon = () => {
    return (
      <Fragment>
        <CircularProgress className={classes.progress} />
        <Typography variant='h5'>
          <Text tid='loadingResult' />
        </Typography>
      </Fragment>
    );
  };

  useEffect(() => {
    ReactGA.event({
      category: 'Assessment',
      action: 'Fetching results',
    });
    fetchAssessmentResult(assessmentId);
  }, []);

  useEffect(() => {
    if (
      assessmentResult.status === 'success' ||
      assessmentResult.status === 'fail'
    ) {
      setFetchStatus(true);
    }
  }, [assessmentResult.status]);

  const modalButtonClicked = () => {
    setOpenModal(false);
  };

  if (hideResult) {
    return (
      <Container
        maxWidth='xl'
        component='div'
        classes={{
          root: classes.containerSecondary,
        }}
      >
        <Success message={msgSuccess} />
      </Container>
    );
  }

  if (
    assessmentResult.status === 'success' &&
    assessmentResult.data !== null &&
    fetchStatus
  ) {
    return (
      <Container
        maxWidth='xl'
        component='div'
        classes={{
          root: classes.containerSecondary,
        }}
      >
        <AssessmentView
          result={assessmentResult.data!.result}
          assessmentData={assessmentResult.data.assessmentSummary}
          recommendations={assessmentResult.data.result.recommendations}
          showRecommendations={
            assessmentResult.data.showRecommendations
              ? assessmentResult.data.showRecommendations
              : false
          }
          backButtonAction={null}
          boolRenderBackButton={false}
          userLevels={assessmentResult.data.userLevels}
          bestScoringAssessment={assessmentResult.data.bestScoringAssessment}
          benchmarkScore={assessmentResult.data.benchmarkScore}
        />
        {!openModal && <Feedback />}
        <ModalComponentInfo
          message='The assessment time is over.'
          openModal={openModal}
          handleModalButtonClicked={modalButtonClicked}
        />
      </Container>
    );
  }

  if (assessmentResult.status === 'fail' && fetchStatus) {
    const error = JSON.stringify(assessmentResult!.error);
    const object = JSON.parse(error);
    if (object.code) {
      if (object.code === 401) {
        return <Redirect to='/relogin' />;
      }
    }
    return <Redirect to='/error' />;
  }

  return (
    <Container
      maxWidth='md'
      component='div'
      classes={{
        root: classes.containerRoot,
      }}
    >
      {renderLoadingIcon()}
    </Container>
  );
}

export default Result;
