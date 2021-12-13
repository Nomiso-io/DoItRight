import React, { useEffect, useState, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Typography,
  Container,
  makeStyles,
  Button,
  Card,
  Snackbar,
  SnackbarContent,
} from '@material-ui/core';
import biglogo from '../../logo/big-logo.jpg';
import { Http } from '../../utils';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import { Loader } from '../../components';
import { useActions, saveUserTeam } from '../../actions';
import AutoCompleteComponent from '../../components/common/autocomplete';
import DropDown from '../../components/common/dropDown';
import { Text } from '../../common/Language';
import '../../css/assessments/style.css';

const useStyles = makeStyles((theme) => ({
  containerRoot: {
    textAlign: 'center',
    alignContent: 'center',
    height: '100vh',
    width: '100%',
    padding: '0px',
    paddingBottom: theme.spacing(4),
  },
  select: {
    minWidth: '100px',
  },
  button: {
    marginTop: '30px',
  },
  container: {
    position: 'absolute',
    top: '20%',
    left: '30%',
    paddingBottom: '40px',
    width: '40%',
  },
  image: {
    maxWidth: '100%',
  },
  submitButton: {
    borderRadius: '0px',
    boxShadow: '0 0 0 0',
    backgroundColor: '#3CB1DC',
    '&:hover, &:focus, &:active': {
      backgroundColor: '#3CB1DC !important',
      color: 'black',
    },
  },
  heading: {
    marginTop: theme.spacing(2),
    fontWeight: 500,
  },
  heading2: {
    fontWeight: 700,
    fontFamily: 'Slack-Lato,appleLogo,sans-serif',
  },
  text: {
    marginTop: '30px',
  },
}));

const TeamSelect = (props: any) => {
  const classes = useStyles();
  const [teamName, setTeamName] = React.useState('');
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const defaultTeams: Object[] = Array();
  const [allTeams, setAllTeams] = React.useState<any>(defaultTeams);
  const [teams, setTeams] = React.useState(defaultTeams);
  const [teamsFetched, setTeamsFetched] = React.useState(false);
  const updateTeam = useActions(saveUserTeam);
  const [failure, setFailure] = useState(false);
  const handleChange = (value: string) => {
    setTeamName(value);
  };
  const [departments, setDepartments] = useState<string[]>([]);
  const [focusDepartment, setFocusDepartment] = useState<string>('');

  const failureMessage = <Text tid='invalidTeamName' />;

  const getTeamId = () => {
    let teamId = '';
    teams.forEach((team: any) => {
      if (teamName === team.teamName) {
        teamId = team.teamId;
      }
    });
    return teamId;
  };

  const handleSubmit = () => {
    if (teamName === '') {
      alert('Invalid');
    } else {
      const teamId = getTeamId();
      if (teamId === '') {
        setFailure(true);
        return;
      }
      const teamArray: string[] = [teamId];
      Http.post({
        url: `/api/v2/teamlist/`,
        body: {
          teams: teamArray,
          userId: stateVariable.user.userDetails['cognito:username'],
        },
        state: stateVariable,
      })
      .then((response: any) => {
        updateTeam(teamId);
        props.history.push('/assessmentselect');
      })
      .catch((error: any) => {
        props.history.push('/assessmentselect');
      });
    }
  };

  const getDepartmentArray = (teams: any) => {
    const departmentList: string[] = [];
    for (const team of teams) {
      if (team.department) {
        if (!departmentList.includes(team.department)) {
          departmentList.push(team.department);
        }
      }
    }
    if (!(departments.includes('Others') || departments.includes('others') ||
          departments.includes('Other') || departments.includes('other'))) {
      departmentList.push('Others');
    }
    return departmentList;
  };

  const fetchTeamList = () => {
    Http.get({
      url: `/api/v2/teamlist/selectTeam`,
      state: stateVariable,
    })
      .then((response: any) => {
        const filteredResponse = response.filter((el: any) => {
          return el.active === 'true';
        });
        filteredResponse.sort((a: any, b: any) => {
          return a.teamName > b.teamName ? 1 : -1;
        });
        const departmentsList = getDepartmentArray(filteredResponse);
        setDepartments(departmentsList);
        setTeams(filteredResponse);
        setAllTeams(filteredResponse);
        setFocusDepartment(departmentsList[0]);
        setTeamsFetched(true);
      })
      .catch((error: any) => {});
  };

  useEffect(() => {
    fetchTeamList();
  }, []);

  useEffect(() => {
    const tempTeams: any = [];
    for (const team of allTeams) {
      if (team.department) {
        if (team.department === focusDepartment) {
          tempTeams.push(team);
        }
      } else {
        if ((focusDepartment.toLowerCase() === 'others') || (focusDepartment.toLowerCase() === 'other')) {
          tempTeams.push(team);
        }
      }
    }
    setTeams(tempTeams);
  }, [focusDepartment]);

  const handleClose = () => {
    setFailure(false);
  };

  const handleChangeDepartment = (event: any) => {
    setFocusDepartment(event.target.value);
  };

  const renderPage = () => {
    return (
      <Container className={classes.containerRoot}>
        <Card className={classes.container}>
          <img className={classes.image} src={biglogo} alt='DoItRight logo' />
          <Typography className={classes.heading} variant='h2'>
            <Text tid='welcomeTo' />
          </Typography>
          <Typography className={classes.heading2} variant='h3'>
            <Text tid='doItRight.io' />
          </Typography>
          <Typography className={classes.text}>
            <Text tid='selectYourDepartment' />
          </Typography>
          <DropDown
            value={focusDepartment}
            list={departments}
            label=''
            onChange={handleChangeDepartment}
          />
          <Typography className={classes.text}>
            <Text tid='selectYourTeam' />
          </Typography>
          <AutoCompleteComponent
            className={classes.select}
            options={[...teams]}
            handleChange={handleChange}
            value={teamName}
          />
          <div className={classes.button}>
            <Button
              className={classes.submitButton}
              variant='contained'
              onClick={handleSubmit}
            >
              <Text tid='continue' />
            </Button>
          </div>
        </Card>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={failure}
          onClose={handleClose}
          autoHideDuration={9000}
        >
          <SnackbarContent
            style={{
              backgroundColor: '#dd0000',
            }}
            message={failureMessage}
          />
        </Snackbar>
      </Container>
    );
  };

  return (
    <Fragment>
      {teamsFetched ? (
        renderPage()
      ) : (
        <Container className='loaderStyle'>
          <Loader />
        </Container>
      )}
    </Fragment>
  );
};

export default withRouter(TeamSelect);
