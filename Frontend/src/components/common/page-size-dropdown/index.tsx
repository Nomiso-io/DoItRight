import React, { Fragment } from 'react';
import {
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  makeStyles,
} from '@material-ui/core';
import { Text } from '../../../common/Language';

interface IProps {
  itemCount: number;
  handleChange: any;
}

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: '100%',
  },
}));
const PageSizeDropDown = (props: IProps) => {
  const classes = useStyles();
  return (
    <Fragment>
      <FormControl className={classes.formControl}>
        <InputLabel id='pageSizeLabel'>
          <Text tid='pageSize' />
        </InputLabel>
        <Select
          name={'pageSize'}
          value={props.itemCount}
          onChange={props.handleChange}
        >
          <MenuItem key={'10'} value={'10'}>
            10
          </MenuItem>
          <MenuItem key={'15'} value={'15'}>
            15
          </MenuItem>
          <MenuItem key={'20'} value={'20'}>
            20
          </MenuItem>
          <MenuItem key={'25'} value={'25'}>
            25
          </MenuItem>
        </Select>
      </FormControl>
    </Fragment>
  );
};

export default PageSizeDropDown;
