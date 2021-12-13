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
import { useSelector } from 'react-redux';
import { IRootState } from '../../../reducers';
import Loader from '../../loader';
import { ITeamInfo, IUserAttributes, IUserParams } from '../../../model';
import { Http } from '../../../utils';
import Success from '../../success-page';
import { withRouter } from 'react-router-dom';
import { MANAGE_USERS } from '../../../pages/admin';
import { ModalComponent } from '../../modal';
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
  deleteButton: {
    marginTop: '36px',
    position: 'relative',
    minWidth: '10%',
    ...buttonStyle,
    marginLeft: '20px',
  },
  makeAdminButton: {
    marginTop: '36px',
    position: 'relative',
    minWidth: '10%',
    ...buttonStyle,
    marginLeft: '20px',
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

const EditUser = (props: any) => {
  const classes = useStyles();
  const [userPosted, setUserPosted] = useState(false);
  const [userDeleted, setUserDeleted] = useState(false);
  const [failure, setFailure] = useState(false);
  const [userDataFetched, setUserDataFetched] = useState(false);
  const [teamDataFetched, setTeamDataFetched] = useState(false);
  const [failureMessage, setFailureMessage] = useState(
    <Text tid='somethingWentWrong' />
  );
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const userRoles = useSelector((state: IRootState) => {
    return state.user.roles;
  });
  const [teams, setTeams] = React.useState<ITeamInfo[]>([]);
  const [userState, setUserState] = React.useState<IUserParams | undefined>();
  const [openModal, setOpenModal] = useState(false);
  const [openMakeAdminModal, setOpenMakeAdminModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    <Text tid='userProfileUpdatedSuccessfully' />
  );
  let msgFailure = failureMessage;
  let msgSuccess = successMessage;

  useEffect(() => {
    fetchTeamList();
    fetchUserDetails();
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
      if (object.code === 400) {
        setFailureMessage(object.apiError.msg);
        setFailure(true);
      } else if (object.code === 401) {
        props.history.push('/relogin');
      } else {
        props.history.push('/error');
      }
    })
  };

  const fetchUserDetails = () => {
    Http.get({
      url: `/api/v2/admin/users/getusers?email=${props.user}`,
      state: stateVariable,
    })
      .then((response: any) => {
        setUserState(response);
        setUserDataFetched(true);
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
          props.history.push('/error');
        }
      });
  };

  const handleDelete = () => {
    const userId = userState!.values.id;
    Http.deleteReq({
      url: `/api/v2/admin/users/${userId}`,
      state: stateVariable,
    })
      .then((response: any) => {
        setUserDeleted(true);
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

  const handleSubmit = () => {
    const postData = userState!.values;
    Http.put({
      url: `/api/v2/admin/users`,
      body: {
        ...postData,
      },
      state: stateVariable,
    })
      .then((response: any) => {
        setUserPosted(true);
        setSuccessMessage(<Text tid='userProfileUpdatedSuccessfully' />);
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

  const handleMakeAdmin = () => {
    setOpenMakeAdminModal(true);
  };

  const modalMakeAdminNoClicked = () => {
    setOpenMakeAdminModal(false);
  };

  const modalMakeAdminYesClicked = () => {
    const postData = userState!.values;
    postData.roles = ['Admin'];
    setOpenMakeAdminModal(false);
    Http.put({
      url: `/api/v2/admin/users`,
      body: {
        ...postData,
      },
      state: stateVariable,
    })
      .then((response: any) => {
        setUserPosted(true);
        setSuccessMessage(<Text tid='userTypeChangedToAdmin' />);
      })
      .catch((error) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 400) {
          setFailureMessage(object.apiError.msg);
        } else {
          setFailureMessage(<Text tid='somethingWentWrong' />);
        }
        if (object.code === 401) {
          props.history.push('/relogin');
        }
        setFailure(true);
      });
  };

  function mandatoryFieldsCheck(): boolean {
    let countFilledElements = 0;
    let totalCount = 0;
    // tslint:disable-next-line: ter-arrow-parens
    if (!userState) {
      return false;
    }
    Object.keys(userState.config).map((el) => {
      if (userState.config[el].Mandatory) {
        if (userState && userState.values[el]) {
          if (userState.config[el].type === 'multi-list') {
            if (userState.values[el].length > 0) {
              countFilledElements = countFilledElements + 1;
            }
          } else {
            countFilledElements = countFilledElements + 1;
          }
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
    if (userState) {
      const temp: IUserParams | null | undefined = { ...userState };
      temp.values[event.target.name] = event.target.value;
      setUserState(temp);
    }
  };

  const handleChangeMultiValue = (event: any) => {
    if (userState) {
      const temp: IUserParams | null | undefined = { ...userState };
      let valueArray = temp.values[event.target.name] || [];
      valueArray = [...event.target.value];
      temp!.values[event.target.name] = valueArray;
      setUserState(temp);
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

  const renderElements = (el: string) => {
    const element: IUserAttributes = userState!.config[el];
    const values = userState ? userState.values : null;
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
            disabled={el === 'emailId'}
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
              value={values ? (values[el] ? values[el] : 0) : 0}
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
              value={values ? (values[el] ? values[el] : '') : ''}
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
                <MenuItem key={opt} value={opt}>
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

  const deleteClicked = () => {
    setOpenModal(true);
  };

  const modalNoClicked = () => {
    setOpenModal(false);
  };

  const modalYesClicked = () => {
    handleDelete();
  };

  const renderFormData = () => {
    if (userPosted) {
      return (
        <Fragment>
          <Success message={msgSuccess} />
          <div className='bottomButtonsContainer'>
            <Button
              className={classes.backButton}
              variant='outlined'
              onClick={() => {
                props.goBack(MANAGE_USERS);
              }}
            >
              <Text tid='goBack' />
            </Button>
          </div>
        </Fragment>
      );
    }
    if (userDeleted) {
      return (
        <Fragment>
          <Success message={<Text tid='userProfileDeletedSuccessfully' />} />
          <div className='bottomButtonsContainer'>
            <Button
              className={classes.backButton}
              variant='outlined'
              onClick={() => {
                props.goBack(MANAGE_USERS);
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
          {Object.keys(userState!.config).map((el) => {
            return (
              <Grid key={el} item xs={12}>
                {renderElements(el)}
              </Grid>
            );
          })}
        </Grid>
        <div className='bottomButtonsContainer'>
          <Button
            className={classes.backButton}
            variant='outlined'
            onClick={() => {
              props.goBack(MANAGE_USERS);
            }}
          >
            <Text tid='goBack' />
          </Button>
          {mandatoryFieldsCheck() ? (
            <Button
              onClick={handleSubmit}
              className={classes.button}
              variant='outlined'
            >
              <Text tid='save' />
            </Button>
          ) : (
            <Button className={classes.button} disabled variant='outlined'>
              <Text tid='save' />
            </Button>
          )}
          <Button
            className={classes.makeAdminButton}
            variant='outlined'
            onClick={handleMakeAdmin}
            disabled={!(userRoles && userRoles.includes('Admin'))}
          >
            <Text tid='makeAdmin' />
          </Button>
          <Button
            className={classes.deleteButton}
            variant='outlined'
            onClick={deleteClicked}
          >
            <Text tid='delete' />
          </Button>
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
        <ModalComponent
          message={'deleteTheUser'}
          openModal={openModal}
          handleModalYesClicked={modalYesClicked}
          handleModalNoClicked={modalNoClicked}
        />
        <ModalComponent
          message={'changeTheUserToAnAdmin'}
          openModal={openMakeAdminModal}
          handleModalYesClicked={modalMakeAdminYesClicked}
          handleModalNoClicked={modalMakeAdminNoClicked}
        />
      </Fragment>
    );
  };

  const renderForm = () => {
    return renderFormData();
  };

  return (
    <Fragment>
      {userDataFetched && teamDataFetched ? (
        renderForm()
      ) : (
        <Container className='loaderStyle'>
          <Loader />
        </Container>
      )}
    </Fragment>
  );
};

export default withRouter(EditUser);
