import React from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import '../styles/progress-bar.css';
import '../styles/result-graph.css';

interface IResultGraphProps {
  percentage: number;
}

const ResultGraph = (props: IResultGraphProps) => {
  const { percentage } = props;
  const text = `${percentage}`;
  return (
    <div id='result-graph'>
      <CircularProgressbar
        background={true}
        backgroundPadding={6}
        text={text}
        value={percentage}
      />
    </div>
  );
};

export default ResultGraph;
