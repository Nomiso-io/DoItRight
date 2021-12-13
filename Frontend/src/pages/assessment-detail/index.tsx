import React, { useEffect, useState } from 'react';
import { AssessmentView, Loader } from '../../components';
import { Redirect } from 'react-router';
import { fetchAssessmentDetail, useActions } from '../../actions';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/styles';
import ErrorPage from '../error_page';
import { withRouter } from 'react-router-dom';

// interface IAssessmentDetailRouteParams {
//     assessmentId: string;
// }
const useStyles = makeStyles((theme) => ({
  containerSecondary: {
    display: 'flex',
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    top: '120px',
  },
}));

function AssessmentDetails(props: any) {
  const classes = useStyles();
  const [fetchStatus, setFetchStatus] = useState(false);
  const fetchUserAssessmentDetail = useActions(fetchAssessmentDetail);
  const assessmentDetail = useSelector(
    (state: IRootState) => state.assessment.assessmentDetail
  );
  const [prevPath, setPrevPath] = useState('');
  const assessmentId = props.match
    ? props.match.params.assessmentId
      ? props.match.params.assessmentId
      : ''
    : '';

  // const prevPath: string = props.location
  //   ? props.location.state
  //     ? props.location.state.prevPath
  //       ? props.location.state.prevPath
  //       : ''
  //     : ''
  //   : '';

  useEffect(() => {
    props.location.state &&
      props.location.state.prevPath && setPrevPath(props.location.state.prevPath)
    let isResult: boolean = false;
    if (prevPath !== '') {
      if (prevPath.includes('result')) {
        isResult = true;
      }
    }
    if (assessmentId !== '') {
      fetchUserAssessmentDetail(assessmentId, isResult);
    } else {
      fetchUserAssessmentDetail(props.assessmentId, false);
    }
  }, []);

  useEffect(() => {
    if (
      assessmentDetail.status === 'success' ||
      assessmentDetail.status === 'fail'
    ) {
      setFetchStatus(true);
    }
  }, [assessmentDetail.status]);

  const handleBackButtonClick = () => {
    props.history.push(prevPath);
  };

  /* const download = () => {
        const input = document.getElementById('divToPrint') as HTMLElement;
        savePDF(input, { paperSize: 'auto' });
    } */

  if (
    assessmentDetail.status === 'success' &&
    assessmentDetail.data !== null &&
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
          result={assessmentDetail.data!.result}
          assessmentData={assessmentDetail.data.assessmentSummary}
          recommendations={assessmentDetail.data.result.recommendations}
          showRecommendations={
            assessmentDetail.data.showRecommendations
              ? assessmentDetail.data.showRecommendations
              : false
          }
          backButtonAction={handleBackButtonClick}
          boolRenderBackButton={prevPath !== ''}
          userLevels={assessmentDetail.data.userLevels}
          bestScoringAssessment={assessmentDetail.data.bestScoringAssessment}
          benchmarkScore={assessmentDetail.data.benchmarkScore}
        />
      </Container>
    );
  }

  if (assessmentDetail.status === 'fail' && fetchStatus) {
    const error = JSON.stringify(assessmentDetail!.error);
    const object = JSON.parse(error);
    if (object.code) {
      if (object.code === 401) {
        return <Redirect to='/relogin' />;
      }
    }
    if (props.assessmentId) {
      return <ErrorPage />;
    }
    return <Redirect to='/error' />;
  }

  return (
    <Container
      maxWidth='md'
      component='div'
      classes={{
        root: classes.containerSecondary,
      }}
    >
      <Loader />
    </Container>
  );
}

export default withRouter(AssessmentDetails);
