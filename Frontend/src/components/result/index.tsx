import React from 'react';
import ResultGraph from './containers/result-graph';
import ResultScoreWidget from './containers/result-score-widget';
import ResultLevel from './containers/result-level';
import './styles/result-parent.css';
import { IAssessmentFinalResultResponse } from '../../model/result';

interface IResultProps {
  data: IAssessmentFinalResultResponse;
}
function renderResults(props: IResultProps) {
  const { score, maxScore, percentage, level } = props.data.result;

  return (
    <div id='result-parent'>
      <ResultScoreWidget score={score} maxScore={maxScore} />
      <ResultGraph percentage={percentage} />
      <ResultLevel level={level} />
    </div>
  );
}

// function renderError() {
//     return renderResults({
//         score: 'Error occurred',
//         maxScore: 'Error occurred',
//         percentage: 'Error',
//         level: 'Error occurred',
//     });
// }

const ResultParent = (props: IResultProps) => {
  return renderResults(props);
};
// class ResultParent extends React.Component {
//     // constructor(props) {
//     //     super(props);
//     //     const { assessmentId } = props;
//     //     this.state = {
//     //         score: NaN,
//     //         maxScore: NaN,
//     //         percentage: NaN,
//     //         level: 'NA',
//     //         assessmentId,
//     //     };
//     // }

//     // async componentDidMount() {
//     //     try {
//     //         const { assessmentId } = this.state;
//     //         const { result } = await getResult(assessmentId);
//     //         this.setState(result);
//     //     } catch (err) {
//     //         this.setState({ err });
//     //     }
//     // }

//     render() {
//         // const { err } = this.state;
//         // if (err) {
//         //     return renderError();
//         // }
//         return renderResults();
//     }
// }

// // ResultParent.propTypes = {
// //     assessmentId: PropTypes.string,
// // };

// // ResultParent.defaultProps = {
// //     assessmentId: null,
// // };

export default ResultParent;
