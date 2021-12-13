import React, { Fragment } from 'react';
import {
  FormControl,
  IconButton,
  makeStyles,
  Paper,
  TextField,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

interface IProps {
  searchString: string;
  handleSearch: any;
}

const useStyles = makeStyles((theme) => ({
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  searchRoot: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'inherit',
    boxShadow: 'none',
  },
  formControl: {
    minWidth: '100%',
  },
}));

const SearchControl = (props: IProps) => {
  const classes = useStyles();

  const keyPressSearchBar = (event: any) => {
    if (event.keyCode === 13) {
      props.handleSearch();
    }
  };

  const startSearch = () => {
    props.handleSearch();
  };

  const clearSearch = () => {
    props.handleSearch('');
  };

  const updateSearchQuery = (event: any) => {
    props.handleSearch(event.target.value);
  };

  return (
    <Fragment>
      <FormControl className={classes.formControl}>
        <Paper className={classes.searchRoot}>
          <TextField
            className={classes.input}
            type='string'
            autoFocus={false}
            multiline={false}
            label='Search'
            value={props.searchString}
            onChange={updateSearchQuery}
            placeholder='Search'
            onKeyDown={keyPressSearchBar}
          />
          {props.searchString !== '' ? (
            <IconButton className={classes.iconButton} onClick={clearSearch}>
              <ClearIcon />
            </IconButton>
          ) : (
            <div />
          )}
          <IconButton className={classes.iconButton} onClick={startSearch}>
            <SearchIcon />
          </IconButton>
        </Paper>
      </FormControl>
    </Fragment>
  );
};

export default SearchControl;
