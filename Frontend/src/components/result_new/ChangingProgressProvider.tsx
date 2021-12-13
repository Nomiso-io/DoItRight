import React, { useState, useEffect, Fragment } from 'react';

function ChangingProgressProvider(props: { values: any[]; children: any }) {
  const [valuesIndex, setValuesIndex] = useState(0);

  useEffect(() => {
    const intervalRef = setTimeout(() => {
      const newValuesIndex = (valuesIndex + 1) % props.values.length;
      setValuesIndex(newValuesIndex);
    }, 1000);

    return () => clearTimeout(intervalRef);
  }, []);

  return <Fragment>{props.children(props.values[valuesIndex])}</Fragment>;
}

export default ChangingProgressProvider;
