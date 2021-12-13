import React from 'react';
import '../styles/custom-widget.css';
import '../../../css/materialize.css';

interface ICustomWidgetProps {
  title: string;
  content: string;
}
const CustomWidget = (props: ICustomWidgetProps) => {
  const { title, content } = props;
  return (
    <div id='number-widget' className='material-icons'>
      <b>
        <h3>{String(content)}</h3>
      </b>
      <p>{title}</p>
    </div>
  );
};

export default CustomWidget;
