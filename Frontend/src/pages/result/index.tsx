import React, { useEffect, Fragment } from 'react';
import { ResultParent, Feedback } from '../../components';
import { useActions } from '../../actions';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import { fetchAssessmentResultData } from '../../actions/result';
import { Text } from '../../common/Language';
import { RouteComponentProps } from 'react-router-dom';
interface IResultRouteParams {
  assessmentId: string;
}
type IResultProps = RouteComponentProps<IResultRouteParams>;
const Result = (props: IResultProps) => {
  const fetchAssessmentResult = useActions(fetchAssessmentResultData);
  const assessmentResult = useSelector(
    (state: IRootState) => state.assessment.result
  );
  // const assessmentId = props.match!.params;
  // console.log('assessment id---------------------------', assessmentId)
  const id = window.location.pathname;
  const assessmentId = id.substring(id.lastIndexOf('/') + 1, id.length);
  useEffect(() => {
    if (assessmentResult.status !== 'success') {
      // hardcoding the assessment id for now
      fetchAssessmentResult(assessmentId);
    }
  }, []);
  if (assessmentResult.status === 'success' && assessmentResult.data !== null) {
    return (
      <Fragment>
        <ResultParent data={assessmentResult.data} />
        <Feedback />
      </Fragment>
    );
  }
  return (
    <div>
      <Text tid='loading' />
    </div>
  );
};

export default Result;
