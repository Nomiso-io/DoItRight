import React, { Fragment } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';

interface IProps {
  dropDownClass?: any;
  onChange: any;
  value: any;
  list: any;
  label: string;
  disabled?: boolean;
  postFix?: string;
}

const DropDown = (props: IProps) => {
  return (
    <Fragment>
      <FormControl className={props.dropDownClass ? props.dropDownClass : {}}>
        <InputLabel id='demo-simple-select-label'>{props.label}</InputLabel>
        <Select
          value={props.value}
          onChange={props.onChange}
          disabled={props.disabled}
        >
          {props.list.map((opt: any) => {
            return (
              <MenuItem key={opt} value={opt}>
                {`${opt}${props.postFix ? props.postFix : ''}`}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Fragment>
  );
};

export default DropDown;
