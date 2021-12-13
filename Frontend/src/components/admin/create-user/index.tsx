import React, { useState, useEffect, Fragment } from 'react';
import {
  Grid,
  makeStyles,
  TextField,
  Button,
  FormControl,
  Container,
  MenuItem,
  Select,
  InputLabel,
  Input,
  Chip,
  Snackbar,
  SnackbarContent,
} from '@material-ui/core';
import { IRootState } from '../../../reducers';
import Loader from '../../loader';
import { Http } from '../../../utils';
import Success from '../../success-page';
import { useSelector } from 'react-redux';
import { IUserParams, ITeamInfo, IUserAttributes } from '../../../model';
import { withRouter } from 'react-router-dom';
import { buttonStyle } from '../../../common/common';
import { Text } from '../../../common/Language';
import '../../../css/assessments/style.css';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: '36px',
    position: 'relative',
    minWidth: '10%',
    ...buttonStyle,
  },
  backButton: {
    marginTop: '36px',
    position: 'relative',
    minWidth: '10%',
    ...buttonStyle,
    marginRight: '20px',
  },
  formControl: {
    minWidth: '100%',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
}));

const CreateUser = (props: any) => {
  const classes = useStyles();
  const [newUserPosted, setNewUserPosted] = useState(false);
  const [failure, setFailure] = useState(false);
  const [failureMessage, setFailureMessage] = useState(
    <Text tid='somethingWentWrong' />
  );
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [teams, setTeams] = React.useState<ITeamInfo[]>([]);
  const [createUserParams, setCreateUserParams] = React.useState<IUserParams | null>(null);
  const [userParamState, setUserParamState] = React.useState<any>({});
  const [teamDataFetched, setTeamDataFetched] = useState(false);

  let msgFailure = failureMessage;
  let msgSuccess = <Text tid='userProfileIsCreated' />;

  useEffect(() => {
    fetchTeamList();
    fetchUserConfig();
  }, []);

  const fetchTeamList = () => {
    Http.get({
      url: `/api/v2/teamlist`,
      state: stateVariable,
    })
    .then((response: any) => {
      response.sort((a: any, b: any) => {
        if (a.active === b.active) {
          return a.teamName.toLowerCase() <= b.teamName.toLowerCase()
            ? -1
            : 1;
        }
        return a.active === 'true' ? -1 : 1;
      });
      setTeams(response);
      setTeamDataFetched(true);
    })
    .catch((error: any) => {
      const perror = JSON.stringify(error);
      const object = JSON.parse(perror);
      if (object.code === 401) {
        props.history.push('/relogin');
      } else {
        props.history.push('/error');
      }
    })
  };

  const fetchUserConfig = () => {
    Http.get({
      url: '/api/v2/admin/users/createuser',
      state: stateVariable,
    })
    .then((response: any) => {
      const responseConfigSorted: any = {};
      const responseKeysSorted = Object.keys(response.config).sort(
        (a: any, b: any) => {
          return response.config[a].displayName >
            response.config[b].displayName
            ? 1
            : -1;
        }
      );
      responseKeysSorted.forEach((el: string) => {
        responseConfigSorted[el] = response.config[el];
      });
      response.config = responseConfigSorted;
      setCreateUserParams(response);
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
  };

  const handleSubmit = () => {
    const postData = userParamState;
    postData['orgId'] = createUserParams ? createUserParams['orgId'] : '';
    Http.post({
      url: `/api/v2/admin/users`,
      body: {
        ...postData,
      },
      state: stateVariable,
    })
    .then((response: any) => {
      setNewUserPosted(true);
    })
    .catch((error) => {
      const perror = JSON.stringify(error);
      const object = JSON.parse(perror);
      if (object.code === 400) {
        setFailureMessage(object.apiError.msg);
        setFailure(true);
      } else if (object.code === 401) {
        props.history.push('/relogin');
      } else {
        setFailureMessage(<Text tid='somethingWentWrong' />);
        setFailure(true);
      }
    });
  };

  function mandatoryFieldsCheck(): boolean {
    let countFilledElements = 0;
    let totalCount = 0;
    // tslint:disable-next-line: ter-arrow-parens
    Object.keys(createUserParams!.config).forEach((el) => {
      if (createUserParams!.config[el].Mandatory) {
        if (userParamState && userParamState[el]) {
          countFilledElements = countFilledElements + 1;
        }
        totalCount = totalCount + 1;
      }
    });
    if (totalCount === countFilledElements) {
      return true;
    }
    return false;
  }

  const handleChangeValue = (event: any) => {
    if (userParamState) {
      const temp: any = { ...userParamState };
      temp[event.target.name] = event.target.value;
      setUserParamState(temp);
    }
  };

  const handleChangeMultiValue = (event: any) => {
    if (userParamState) {
      const temp: any = { ...userParamState };
      let valueArray = temp[event.target.name] || [];
      valueArray = [...event.target.value];
      temp[event.target.name] = valueArray;
      setUserParamState(temp);
    }
  };

  const renderChips = (selected: any, el: string) => {
    return (
      <div className={classes.chips}>
        {(selected as string[]).map((value) => (
          <Chip
            key={value}
            label={el === 'teams' ? teams.find((t: ITeamInfo) => t.teamId === value)!.teamName : value}
            className={classes.chip}
          />
        ))}
      </div>
    );
  };

  function getStyles(values: any, opt: string, el: string) {
    if (values && values[el] && values[el].includes(opt)) {
      return {
        color: 'white',
        backgroundColor: '#042E5B',
      };
    }
  }

  const renderElements = (el: string) => {
    const element: IUserAttributes = createUserParams!.config[el];
    const values = userParamState ? userParamState : null;
    switch (element.type) {
      case 'string':
        return (
          <TextField
            required={element.Mandatory}
            type='string'
            id={el}
            name={el}
            value={values ? (values[el] ? values[el] : '') : ''}
            label={element.displayName}
            onChange={handleChangeValue}
            fullWidth
            autoComplete='off'
            className='textFieldStyle'
          />
        );
      case 'number':
        return (
          <div className='numberInput'>
            <TextField
              required={element.Mandatory}
              type='number'
              id={el}
              name={el}
              value={values ? (values[el] ? values[el] : '') : ''}
              label={element.displayName}
              onChange={handleChangeValue}
              fullWidth
              autoComplete='off'
              InputProps={{ disableUnderline: true }}
              className='textFieldStyle'
            />
          </div>
        );
      case 'list':
        return (
          <FormControl className={classes.formControl}>
            <InputLabel
              id='demo-simple-select-label'
              required={element.Mandatory}
            >
              {element.displayName}
            </InputLabel>
            <Select
              name={el}
              value={
                values
                  ? values[el]
                    ? element.options.includes(values[el])
                      ? values[el]
                      : 'Other'
                    : ''
                  : ''
              }
              onChange={handleChangeValue}
            >
              {element.options.map((opt: string) => {
                return (
                  <MenuItem key={opt} value={opt}>
                    {
                      el === 'teams'
                      ? teams.find((t: ITeamInfo) => t.teamId === opt)!.teamName
                      : opt
                    }
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        );
      case 'multi-list':
        return (
          <FormControl className={classes.formControl}>
            <InputLabel
              id='demo-mutiple-chip-label'
              required={element.Mandatory}
            >
              {element.displayName}
            </InputLabel>
            <Select
              id='demo-mutiple-chip'
              name={el}
              multiple
              value={
                values
                  ? values[el]
                    ? values[el] !== ''
                      ? values[el]
                      : []
                    : []
                  : []
              }
              onChange={handleChangeMultiValue}
              input={<Input id='select-multiple-chip' />}
              renderValue={(value: any) => renderChips(value, el)}
              MenuProps={MenuProps}
            >
              {element.options.map((opt: any) => (
                <MenuItem
                  key={opt}
                  value={opt}
                  style={getStyles(values, opt, el)}
                >
                  {
                    el === 'teams'
                    ? teams.find((t: ITeamInfo) => t.teamId === opt)!.teamName
                    : opt
                  }
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
    }
  };

  const handleClose = () => {
    setFailure(false);
  };

  const renderFormData = () => {
    if (newUserPosted) {
      return (
        <Fragment>
          <Success message={msgSuccess} />
          <div className='bottomButtonsContainer'>
            <Button
              className={classes.backButton}
              variant='outlined'
              onClick={() => {
                setNewUserPosted(false);
                setUserParamState({});
              }}
            >
              <Text tid='goBack' />
            </Button>
          </div>
        </Fragment>
      );
    }
    return (
      <Fragment>
        <Grid container spacing={3}>
          {Object.keys(createUserParams!.config).map((el) => {
            return (
              <Grid key={el} item xs={6}>
                {renderElements(el)}
              </Grid>
            );
          })}
        </Grid>
        <div className='bottomButtonsContainer'>
          <Button
            className={classes.backButton}
            variant='outlined'
            onClick={props.goBack}
          >
            <Text tid='goBack' />
          </Button>
          {mandatoryFieldsCheck() ? (
            <Button
              onClick={handleSubmit}
              className={classes.button}
              variant='outlined'
            >
              <Text tid='submit' />
            </Button>
          ) : (
            <Button className={classes.button} disabled variant='outlined'>
              <Text tid='submit' />
            </Button>
          )}
        </div>
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
            message={msgFailure}
          />
        </Snackbar>
      </Fragment>
    );
  };

  const renderForm = () => {
    return renderFormData();
  };

  return (
    <Fragment>
      {(createUserParams !== null && teamDataFetched) ? (
        renderForm()
      ) : (
        <Container className='loaderStyle'>
          <Loader />
        </Container>
      )}
    </Fragment>
  );
};

export default withRouter(CreateUser);
