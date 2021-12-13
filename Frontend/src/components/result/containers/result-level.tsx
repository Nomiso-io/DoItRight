import React from 'react';
import CustomWidget from './custom-widget';

interface IResultLevelProps {
  level: string;
}

const ResultLevel = (props: IResultLevelProps) => {
  const { level } = props;
  return <CustomWidget title='Level' content={level} />;
};

export default ResultLevel;
