import * as React from 'react';
import { makeStyles } from '@material-ui/styles';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { Text } from '../../common/Language';

export interface IDropdownItem {
  key: string;
  value: string;
}
interface IDropdownList {
  data: IDropdownItem[];
  onSelect: (key: string) => void;
}
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  formControl: {
    minWidth: 200,
  },
  inputRoot: {
    fontSize: '24px',
  },
}));
const Dropdown = (props: IDropdownList) => {
  const classes = useStyles();
  const [selectedAssessment, setSelectedAssessment] = React.useState(
    props.data[0].key
  );
  const handleChange = (event: any) => {
    setSelectedAssessment(event.target.value);
    props.onSelect(event.target.value);
  };
  return (
    <form className={classes.root} autoComplete='off'>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor='age-auto-width'>
          <Text tid='assessmentDate' />
        </InputLabel>
        <Select
          value={selectedAssessment}
          className={classes.inputRoot}
          onChange={handleChange}
          autoWidth
        >
          <MenuItem value=''>
            <em>
              <Text tid='none' />
            </em>
          </MenuItem>
          {props.data.map((item) => {
            return (
              <MenuItem
                className={classes.inputRoot}
                key={item.key}
                value={item.key}
              >
                {item.value}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </form>
  );
};
export default Dropdown;
