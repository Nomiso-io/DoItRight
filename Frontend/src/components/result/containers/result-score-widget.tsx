import React from 'react';
import CustomWidget from './custom-widget';

interface IResultScoreWidgetProps {
  score: number;
  maxScore: number;
}
const ResultScoreWidget = (props: IResultScoreWidgetProps) => {
  return (
    <CustomWidget
      title='Score'
      content={`${String(props.score)} / ${String(props.maxScore)}`}
    />
  );
};

export default ResultScoreWidget;
