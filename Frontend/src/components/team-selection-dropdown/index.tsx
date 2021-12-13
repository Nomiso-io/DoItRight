import React, { Fragment, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import { Http } from '../../utils';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  makeStyles,
} from '@material-ui/core';
import { useActions, saveUserTeams, saveUserTeam } from '../../actions';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    width: '100%',
    marginBottom: '20px',
  },
  formControl: {
    minWidth: '20%',
    marginLeft: '5px',
  },
}));

const TeamSelectionDropDown = (props: any) => {
  const classes = useStyles();
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const teamList = useSelector((state: IRootState) => {
    return state.user.teams;
  });
  const focusTeam = useSelector((state: IRootState) => {
    return state.user.team;
  });
  const setTeamList = useActions(saveUserTeams);
  const setFocusTeam = useActions(saveUserTeam);

  useEffect(() => {
    Http.get({
      url: `/api/v2/teamList/myteams`,
      state: stateVariable,
    })
      .then((response: any) => {
        setTeamList(response);
      })
      .catch((error) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          props.history.push('/relogin');
        } else {
          props.history.push('/error');
        }
      });
  }, []);

  const handleChangeFocusTeamValue = (event: any) => {
    setFocusTeam(event.target.value);
  };

  return (
    <Fragment>
      <div className={classes.container}>
        <FormControl className={classes.formControl}>
          <InputLabel id='demo-simple-select-label'>Choose Team</InputLabel>
          <Select
            value={focusTeam !== '' ? focusTeam : ''}
            onChange={handleChangeFocusTeamValue}
            disabled={teamList.length === 1}
          >
            {teamList &&
              teamList.map((opt: any) => {
                return (
                  <MenuItem key={opt.teamId} value={opt.teamId}>
                    {opt.teamName}
                  </MenuItem>
                );
              })}
          </Select>
        </FormControl>
      </div>
    </Fragment>
  );
};

export default withRouter(TeamSelectionDropDown);
