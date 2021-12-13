// tslint:disable: jsx-no-lambda
import React, { CSSProperties } from 'react';
import ReactAutocomplete from 'react-autocomplete';

interface IProps {
  options: any;
  handleChange: any;
  className: any;
  value: string;
}

const menuStyle: CSSProperties = {
  zIndex: 100,
  boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 12px',
  background: 'rgba(255, 255, 255, 1)',
  overflowX: 'hidden',
  overflowY: 'auto',
  maxHeight: '200px',
  padding: '2px 0px',
  opacity: 1,
};

// https://www.npmjs.com/package/react-autocomplete

export default function AutoCompleteComponent(props: IProps) {
  return (
    <ReactAutocomplete
      items={props.options}
      shouldItemRender={(item, value) =>
        item.teamName.toLowerCase().indexOf(value.toLowerCase()) > -1
      }
      getItemValue={(item) => item.teamName}
      renderItem={(item, highlighted) => (
        <div
          key={item.teamName}
          style={{
            backgroundColor: highlighted ? '#042E5B' : 'transparent',
            color: highlighted ? 'white' : 'inherit',
            cursor: 'pointer',
          }}
        >
          {item.teamName}
        </div>
      )}
      menuStyle={menuStyle}
      value={props.value}
      onChange={(e) => props.handleChange(e.target.value)}
      onSelect={(value) => props.handleChange(value)}
    />
  );
}
