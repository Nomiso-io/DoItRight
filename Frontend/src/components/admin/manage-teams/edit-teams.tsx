import React, { useState, useEffect, Fragment } from 'react';
import {
  Grid,
  makeStyles,
  MuiThemeProvider,
  TextField,
  Typography,
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
  Tooltip,
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import AddIcon from '@material-ui/icons/Add';
import { default as MaterialLink } from '@material-ui/core/Link';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../reducers';
import Loader from '../../loader';
import { IServiceInfo, /*ITeamAttributes*/IFieldConfigAttributes, ITeamParams, ITeamConfig } from '../../../model';
import { Http } from '../../../utils';
import Success from '../../success-page';
//import MapMetricsTools from '../map-metrics-tools';
import { withRouter } from 'react-router-dom';
import { MANAGE_TEAMS } from '../../../pages/admin';
import { buttonStyle, tooltipTheme } from '../../../common/common';
import { Text } from '../../../common/Language';
import '../../../css/assessments/style.css';

import  {MAX_SERVICE_HIERARCHY_LEVEL, OTHER_STRING } from '../create-team';

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
    marginRight: '20px',
    ...buttonStyle,
  },
  grid: {
    marginTop: theme.spacing(2),
    width: '90%'
  },
  grid2: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(5),
    border: '1px solid #dadde9',
    width: '95%'
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

const EditTeam = (props: any) => {
  const classes = useStyles();
  const [teamPosted, setTeamPosted] = useState(false);
  const [failure, setFailure] = useState(false);
  const [teamDataFetched, setTeamDataFetched] = useState(false);
  const [failureMessage, setFailureMessage] = useState(
    <Text tid='somethingWentWrong' />
  );
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [teamState, setTeamState] = React.useState<ITeamParams | undefined>();
  const [mapCollectors, setMapCollectors] = useState(false);
  let msgFailure = failureMessage;
  let msgSuccess = <Text tid='teamDetailsUpdatedSuccessfully' />;

  useEffect(() => {
    Http.get({
      url: `/api/v2/admin/createteam/${props.teamId} `,
      state: stateVariable,
    })
      .then((response: any) => {
        fixMultiSelectValuesAndSave(response);
      })
      .catch((error: any) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          props.history.push('/relogin');
        } else {
          props.history.push('/error');
        }
        setFailure(true);
      });
  }, []);

  const handleSave = (isMapCollectors?: boolean) => {
    const postData = teamState;
    Http.put({
      url: `/api/v2/admin/createteam`,
      body: {
        ...postData,
      },
      state: stateVariable,
    })
    .then((response: any) => {
      if (isMapCollectors) {
        setMapCollectors(true);
      } else {
        setTeamPosted(true);
      }      
    })
    .catch((error: any) => {
      const perror = JSON.stringify(error);
      const object = JSON.parse(perror);
      if (object.code === 400) {
        setFailureMessage(object.apiError.msg);
      } else if (object.code === 401) {
        props.history.push('/relogin');
      } else {
        setFailureMessage(<Text tid='somethingWentWrong' />);
        setFailure(true);
      }
    });
  };

  const fixMultiSelectValuesAndSave = (response: ITeamParams) => {
    if(response.values) {
      fixOtherValuesMultiSelect(response.teamConfig, response.values);
      if(response.values.services) {
        fixServicesMultiSelectValues(response.serviceConfig, response.values.services);
      }
    }
    setTeamState(response);
    setTeamDataFetched(true);
  };

  const fixServicesMultiSelectValues = (config: ITeamConfig, services: any[]) => {
    services.forEach((service: any) => {
      fixOtherValuesMultiSelect(config, service);
      if(service.services) {
        fixServicesMultiSelectValues(config, service.services);
      }
    });
  };

  const fixOtherValuesMultiSelect = (config: ITeamConfig, values: any) => {
    Object.keys(config).forEach((el) => {
      if (config[el].type === 'multi-list' && values && values[el]) {
        values[el].forEach((opt: any, index: number) => {
          if (config[el].options &&
              ((config[el].options.custom && !config[el].options.custom.includes(opt)) ||
              (config[el].options.customFixed && !config[el].options.customFixed.includes(opt)))) {
//            const index = response.values[el].indexOf(opt);
            values![el][index] = `${OTHER_STRING}:${opt}`;
          }
        });
      }
    });
  };

  const getMultiListOtherTextValue = (values: any) => {
    let ret_value = '';
    if (values) {
      values.forEach((el: string) => {
        if (el.includes(`${OTHER_STRING}:`)) {
          ret_value = el.substring(6);
        }
      });
    }
    return ret_value;
  };

  function mandatoryFieldsCheck(): boolean {
//    let countFilledElements = 0;
//    let totalCount = 0;
    let check: boolean = true;
    // tslint:disable-next-line: ter-arrow-parens
    if (!teamState) {
      return false;
    }
    Object.keys(teamState.teamConfig).forEach((el) => {
      if (teamState.teamConfig[el].mandatory) {
        if (!teamState.values || !teamState.values[el]) {
          check = false;
        } else if ((teamState.teamConfig[el].type === 'multi-list') &&
          (teamState.values[el].length === 0)) {
            check = false;
        }
      }
    });

    if(teamState.values && teamState.values.services && ! mandatoryServicesFieldsCheck(teamState.values.services)) {
      check = false;
    }
    return check;

/*
    Object.keys(teamState.teamConfig).map((el) => {
      if (teamState.teamConfig[el].mandatory) {
        if (teamState && teamState.values && teamState.values[el]) {
          if (teamState.teamConfig[el].type === 'multi-list') {
            if (teamState.values[el].length > 0) {
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
  */
  }

  function mandatoryServicesFieldsCheck(services: IServiceInfo[]): boolean {
    let check: boolean = true;

    if (!teamState) {
      return false;
    }

    services.forEach((service: IServiceInfo) => {
      Object.keys(teamState.serviceConfig).forEach((el) => {
        if (teamState.serviceConfig[el].mandatory) {
          if (!service[el]) {
            check = false;
          } else if ((service[el].type === 'multi-list') && (service[el].length === 0)) {
              check = false;
          }
        }
      });
  
      if(service.services && ! mandatoryServicesFieldsCheck(service.services)) {
        check = false;
      }
    });
    return check;
  }
  
  const handleChangeValue = (event: any, key: string, indexPath: number[]) => {
    if (teamState) {
      const temp: ITeamParams | null | undefined = { ...teamState };
      let values: any = temp.values;
      for(let i: number = 0; i < indexPath.length; i++) {
        if(values && values.services) {
          values = values.services[indexPath[i]];
        } else {
          values = null;
        }
      }

      if(values) {
        values[key] = event.target.value;
        setTeamState(temp);
      }
    }
  };
  
  const handleChangeOtherValueList = (event: any, key: string, indexPath: number[]) => {
    if (teamState) {
      const temp: ITeamParams | null | undefined = { ...teamState };
      let values: any = temp.values;
      for(let i: number = 0; i < indexPath.length; i++) {
        if(values && values.services) {
          values = values.services[indexPath[i]];
        } else {
          values = null;
        }
      }

      if(values) {
        if (event.target.value === '') {
          values[key] = OTHER_STRING;
        } else {
          values[key] = event.target.value;
        }
        setTeamState(temp);
      }
    }
  };

  const returnIndexOfOther = (array: string[]) => {
    let index = -1;
    array.forEach((el, i) => {
      if (el.includes(OTHER_STRING)) {
        index = i;
      }
    });
    return index;
  };

  const handleChangeOtherMultilist = (event: any, key: string, indexPath: number[]) => {
    if (teamState) {
      const temp: ITeamParams | null | undefined = { ...teamState };
      let values: any = temp.values;
      for(let i: number = 0; i < indexPath.length; i++) {
        if(values && values.services) {
          values = values.services[indexPath[i]];
        } else {
          values = null;
        }
      }

      if(values) {
        const updatedString = `${OTHER_STRING}: ${event.target.value}`;
        const valueArray = values[key] || [];
        const indexOfOther = returnIndexOfOther(valueArray);
        valueArray[indexOfOther] = updatedString;
        values[key] = valueArray;
        setTeamState(temp);
      }
    }
  };

  const handleChangeMultiValue = (event: any, key: string, indexPath: number[]) => {
    if (teamState) {
      const temp: ITeamParams | null | undefined = { ...teamState };
      let values: any = temp.values;
      for(let i: number = 0; i < indexPath.length; i++) {
        if(values && values.services) {
          values = values.services[indexPath[i]];
        } else {
          values = null;
        }
      }

      if(values) {
        let valueArray = values[key] || [];
        valueArray = [...event.target.value];
        values[key] = valueArray;
        setTeamState(temp);
       }
    }
  };

  const includesOther = (array: string[]) => {
    let otherExist = false;
    array.forEach((el) => {
      if (el.includes(OTHER_STRING)) {
        otherExist = true;
      }
    });
    return otherExist;
  };

  const renderChips = (selected: any) => {
    return (
      <div className={classes.chips}>
        {(selected as string[]).map((value) => {
          const val = value.includes(`${OTHER_STRING}:`) ? OTHER_STRING : value;
          return <Chip key={val} label={val} className={classes.chip} />;
        })}
      </div>
    );
  };

  const removeOthersText = (values: string[]) => {
    const val = values.forEach((el) => {
      if (el.includes(`${OTHER_STRING}:`)) {
        return OTHER_STRING;
      }
      return el;
    });
    return val;
  };

  const addService = (indexPath: number[]) => {
    if (teamState) {
      const temp: ITeamParams | null | undefined = { ...teamState };
      let values: any = temp.values;
      for(let i: number = 0; i < indexPath.length; i++) {
        if(values && values.services) {
          values = values.services[indexPath[i]];
        } else {
          values = null;
        }
      }

      if(values) {
        if(!values.services) {
          values.services = [];
        }
        values.services.push({name: '', active: 'true'});
        setTeamState(temp);
      }
    }
  }

  const deleteService = (indexPath: number[]) => {
    if (teamState) {
      const temp: ITeamParams | null | undefined = { ...teamState };
      let values: any = temp.values;
      for(let i: number = 0; i < indexPath.length; i++) {
        if(values && values.services) {
          values = values.services[indexPath[i]];
        } else {
          values = null;
        }
      }

      if(values) {
        values.active = 'false';
        setTeamState(temp);
      }
    }
  }

  // const handleMapMetricsBackButton = () => {
  //   if (props.isMapCollectors) {
  //     props.goBack(MANAGE_TEAMS);
  //   } else {
  //     setMapCollectors(false);
  //   }
  // };

  // const renderMapCollectors = () => {
  //   props.mapMetricsClicked(props.teamId);
  //   return (
  //     <MapMetricsTools teamId={props.teamId} />
  //   )
  // }

  const handleMapCollectorsButton = () => {
    handleSave(true);
  };

  const renderElements = (key: string, config: ITeamConfig, values: any, indexPath: number[]) => {
    const element: IFieldConfigAttributes = config[key];
//    const values = teamState ? teamState.values : null;
    switch (element.type) {
      case 'string':
        return (
          <TextField
            required={element.mandatory}
            type='string'
            id={`${key}_${indexPath.join('_')}`}
            name={`${key}_${indexPath.join('_')}`}
            value={values ? (values[key] ? values[key] : '') : ''}
            label={element.displayName}
//            disabled={key === 'teamName'}
            onChange={(event) => handleChangeValue(event, key, indexPath)}
            fullWidth
            autoComplete='off'
            className='textFieldStyle'
          />
        );
      case 'number':
        return (
          <div className='numberInput'>
            <TextField
              required={element.mandatory}
              type='number'
              id={`${key}_${indexPath.join('_')}`}
              name={`${key}_${indexPath.join('_')}`}
              value={values ? (values[key] ? values[key] : '') : ''}
              label={element.displayName}
              onChange={(event) => handleChangeValue(event, key, indexPath)}
              fullWidth
              autoComplete='off'
              InputProps={{ disableUnderline: true }}
              className='textFieldStyle'
            />
          </div>
        );
      case 'list':
        return (
          <Fragment>
            <FormControl className={classes.formControl}>
              <InputLabel
                id={`label_${key}_${indexPath.join('_')}`}
                required={element.mandatory}
              >
                {element.displayName}
              </InputLabel>
              <Select
                name={`select_${key}_${indexPath.join('_')}`}
                value={
                  values
                    ? values[key]
                      ? element.options
                        ? element.options.custom
                          ? element.options.custom.split(',').includes(values[key])
                            ? values[key]
                            : OTHER_STRING
                          : element.options.customFixed
                            ? element.options.customFixed.split(',').includes(values[key])
                              ? values[key]
                             : OTHER_STRING
                            : OTHER_STRING
                        : OTHER_STRING
                      : ''
                    : ''
                }
                onChange={(event) => handleChangeValue(event, key, indexPath)}
              >
                {element.options && element.options.custom ? (
                  element.options.custom.split(',').map((opt: string) => {
                    return (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    );
                  })
                ) : (
                  element.options && element.options.customFixed ? (
                    element.options.customFixed.split(',').map((opt: string) => {
                      return (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      );
                    })
                  ) : (
                    <div />
                  )
                )}
                <MenuItem key={OTHER_STRING} value={OTHER_STRING}>
                  <Text tid='other' />
                </MenuItem>
              </Select>
            </FormControl>
            <TextField
              required={element.mandatory}
              type='string'
              id={`text_${key}_${indexPath.join('_')}`}
              name={`text_${key}_${indexPath.join('_')}`}
              disabled={
                !values || !values[key] ||
                (element.options && element.options.custom && element.options.custom.split(',').includes(values[key])) ||
                (element.options && element.options.customFixed && element.options.customFixed.split(',').includes(values[key]))
              }
              label={`(specify, if ${OTHER_STRING})`}
              value={
                values &&
                values[key] &&
                !(element.options && element.options.custom && element.options.custom.split(',').includes(values[key])) &&
                !(element.options && element.options.customFixed && element.options.customFixed.split(',').includes(values[key]))
                ? values[key] === OTHER_STRING
                  ? ''
                  : values[key]
                : ''
              }
              onChange={(event) => handleChangeOtherValueList(event, key, indexPath)}
              autoComplete='off'
              className='textFieldStyle'
            />
          </Fragment>
        );
      case 'list-no-others':
        return (
          <FormControl className={classes.formControl}>
            <InputLabel
              id={`label_${key}_${indexPath.join('_')}`}
              required={element.mandatory}
            >
              {element.displayName}
            </InputLabel>
            <Select
              name={`select_${key}_${indexPath.join('_')}`}
              value={
                values
                  ? values[key]
                    ? element.options
                      ? element.options.custom
                        ? element.options.custom.split(',').includes(values[key])
                          ? values[key]
                          : ''
                        : element.options.customFixed
                          ? element.options.customFixed.split(',').includes(values[key])
                            ? values[key]
                           : ''
                          : ''
                      : ''
                    : ''
                  : ''
              }
              onChange={(event) => handleChangeValue(event, key, indexPath)}
            >
              {element.options && element.options.custom ? (
                element.options.custom.split(',').map((opt: string) => {
                  return (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  );
                })
              ) : (
                element.options && element.options.customFixed ? (
                  element.options.customFixed.split(',').map((opt: string) => {
                    return (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    );
                  })
                ) : (
                  <div />
                )
              )}
            </Select>
          </FormControl>
        );
      case 'multi-list':
        return (
          <Fragment>
            <FormControl className={classes.formControl}>
              <InputLabel
                id={`label_${key}_${indexPath.join('_')}`}
                required={element.mandatory}
              >
                {element.displayName}
              </InputLabel>
              <Select
                id={`select_${key}_${indexPath.join('_')}`}
                name={`select${key}_${indexPath.join('_')}`}
                multiple
                value={
                  values
                    ? values[key]
                      ? values[key] !== ''
                        ? removeOthersText(values[key])
                        : []
                      : []
                    : []
                }
                onChange={(event) => handleChangeMultiValue(event, key, indexPath)}
                input={<Input id='select-multiple-chip' />}
                renderValue={renderChips}
                MenuProps={MenuProps}
              >
                {element.options && element.options.custom ? (
                  element.options.custom.split(',').map((opt: string) => {
                    return (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    );
                  })
                ) : (
                  element.options && element.options.customFixed ? (
                    element.options.customFixed.split(',').map((opt: string) => {
                      return (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      );
                    })
                  ) : (
                    <div />
                  )
                )}
                <MenuItem key={OTHER_STRING} value={OTHER_STRING}>
                  <Text tid='other' />
                </MenuItem>
              </Select>
            </FormControl>
            <TextField
              required={element.mandatory}
              type='string'
              id={`text_${key}_${indexPath.join('_')}`}
              name={`text_${key}_${indexPath.join('_')}`}
              disabled={!(values && values[key] && includesOther(values[key]))}
              value={
                values
                  ? values[key]
                    ? getMultiListOtherTextValue(values[key])
                    : ''
                  : ''
              }
              label={'(specify, if ${OTHER_STRING})'}
              onChange={(event) => handleChangeOtherMultilist(event, key, indexPath)}
              autoComplete='off'
              className='textFieldStyle'
            />
          </Fragment>
        );
    }
  };

  const handleClose = () => {
    setFailure(false);
  };

  const renderService = (service: IServiceInfo, indexPath: number[]) => {
    return (
      <Fragment>
        <Grid item xs={11}>
          {Object.keys(teamState!.serviceConfig).map((el: string) => {
            return (
              <div key={el} style={{ padding: '5px' }}>
                {renderElements(el, teamState!.serviceConfig, service, indexPath)}
              </div>
            );
          })}
        </Grid>
        <Grid item xs={1}>
          <div style={{ cursor: 'pointer' }}>
            <MuiThemeProvider theme={tooltipTheme}>
              <Tooltip
                title={
                  <Typography style={{ fontSize: '12px', textAlign: 'center' }}>
                    <Text tid='delete' />
                  </Typography>
                }
              >
                <Typography>
                  <ClearIcon onClick={() => { deleteService(indexPath); }} />
                </Typography>
              </Tooltip>
            </MuiThemeProvider>
          </div>
        </Grid>
        {(indexPath.length < MAX_SERVICE_HIERARCHY_LEVEL) ?
          (
            <Grid container spacing={3} className={classes.grid}>
              <Typography color='textSecondary' style={{paddingLeft: '25px'}}>
                <Text tid='serviceSubComponents' />
              </Typography>
              {service.services && service.services.map((subService: IServiceInfo, index: number) => {
                if(subService.active === 'true') {
                  return (
                    <Grid container spacing={3} className={classes.grid2} key={index}>
                      {renderService(subService, [...indexPath, index])}
                    </Grid>
                  );
                }
              })}
              <Grid item xs={1}>
                <div style={{ cursor: 'pointer' }}>
                  <MuiThemeProvider theme={tooltipTheme}>
                    <Tooltip
                      title={
                        <Typography style={{ fontSize: '12px', textAlign: 'center' }}>
                          <Text tid='addServiceSubComponents' />
                        </Typography>
                      }
                    >
                      <Typography>
                        <AddIcon
                          fontSize='large'
                          onClick={() => {
                            addService(indexPath);
                          }}
                        />{' '}
                      </Typography>
                    </Tooltip>
                  </MuiThemeProvider>
                </div>
              </Grid>
            </Grid>
          ) : (<div/>)
        }
      </Fragment>
    );
  }
  
  const renderFormData = () => {
    if (teamPosted) {
      return (
        <Fragment>
          <Success message={msgSuccess} />
          <div className='bottomButtonsContainer'>
            <Button
              className={classes.button}
              variant='outlined'
              onClick={() => {
                props.goBack(MANAGE_TEAMS);
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
        <Grid container spacing={3} className={classes.grid}>
          {Object.keys(teamState!.teamConfig).map((el) => {
            return (
              <Grid key={el} item xs={12}>
                {renderElements(el, teamState!.teamConfig, teamState!.values, [])}
              </Grid>
            );
          })}
          <Grid container spacing={3} className={classes.grid}>
            <Typography  color='textSecondary' style={{paddingLeft: '25px'}}>
              <Text tid='serviceComponents' />
            </Typography>
            {teamState!.values!.services && teamState!.values!.services.map((service: IServiceInfo, index: number) => {
              if(service.active === 'true') {
                return (
                  <Grid container spacing={3} className={classes.grid2} key={index}>
                    {renderService(service, [index])}
                  </Grid>
                );
              }
            })}
            <Grid item xs={1}>
              <div style={{ cursor: 'pointer' }}>
                <MuiThemeProvider theme={tooltipTheme}>
                  <Tooltip
                    title={
                      <Typography style={{fontSize: '12px', textAlign: 'center' }}>
                        <Text tid='addServiceComponents' />
                      </Typography>
                    }
                  >
                  <Typography>
                    <AddIcon
                      fontSize='large'
                      onClick={() => {
                        addService([]);
                      }}
                      />{' '}
                    </Typography>
                  </Tooltip>
                </MuiThemeProvider>
              </div>
            </Grid>
          </Grid>
        </Grid>
        <div className='bottomButtonsContainer'>
          <Button
            className={classes.button}
            variant='outlined'
            onClick={() => {
              props.goBack(MANAGE_TEAMS);
            }}
          >
            <Text tid='goBack' />
          </Button>
          {mandatoryFieldsCheck() ? (
            <Button
              onClick={() => {
                handleSave(false)
              }}
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
            className={classes.button}
            onClick={handleMapCollectorsButton}
            variant='outlined'
          >
            <Text tid='mapCollectors' />
          </Button>
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
        </div>
      </Fragment>
    );
  };

  // const renderForm = () => {
  //   return renderFormData();
  // };

  return (
    <Fragment>
      {teamDataFetched ? (
        mapCollectors ? (
          props.mapMetricsClicked(props.teamId)
        ) : (
          renderFormData()
        )
      ) : (
        <Container className='loaderStyle'>
          <Loader />
        </Container>
      )}
    </Fragment>
  );
};

export default withRouter(EditTeam);
