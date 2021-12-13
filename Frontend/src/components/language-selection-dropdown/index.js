import React, { Fragment, useContext, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { Select, MenuItem, makeStyles } from '@material-ui/core';
import { languageOptions } from '../../languages';
import { Text, LanguageContext } from '../../common/Language';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '20%',
  },
  formControl: {
    marginLeft: '5px',
  },
}));

const LanguageSelector = () => {
  const classes = useStyles();
  const { userLanguage, userLanguageChange } = useContext(LanguageContext);

  // set selected language by calling context method
  const handleLanguageChange = (e) => userLanguageChange(e.target.value);

  useEffect(() => {
    let defaultLanguage = window.localStorage.getItem('rcml-lang');
    if (!defaultLanguage) {
      defaultLanguage = window.navigator.language.substring(0, 2);
    }
    userLanguageChange(defaultLanguage);
  }, [userLanguageChange]);

  // console.log(languageOptions, userLanguage);

  return (
    <Fragment>
      <div className={classes.container}>
        <Text tid='chooseLanguage' />
        {/* <FormControl className={classes.formControl}> */}
        <Select
          onChange={handleLanguageChange}
          value={userLanguage}
          className={classes.formControl}
        >
          {Object.entries(languageOptions).map(([id, name]) => {
            return (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            );
          })}
        </Select>
        {/* </FormControl> */}
      </div>
    </Fragment>
  );
};

export default withRouter(LanguageSelector);
