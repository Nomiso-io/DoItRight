import React, { useEffect, useState, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  Typography,
  ExpansionPanelDetails,
  Grid,
  TextField,
  Container,
  Backdrop,
  CircularProgress,
  Button,
  makeStyles,
  Snackbar,
  SnackbarContent,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Popover,
  Tooltip,
} from '@material-ui/core';
import { IRootState } from '../../../reducers';
import ClearIcon from '@material-ui/icons/Clear';
import AddIcon from '@material-ui/icons/Add';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Loader from '../../loader';
import { Http } from '../../../utils';
import { MANAGE_SETTINGS } from '../../../pages/admin';
import Success from '../../success-page';
import { buttonStyle } from '../../../common/common';
import {
  IFieldConfigAttributes,
  ICollectorConfigDetails,
  ICollectorConfig,
} from '../../../model/system';
import { LightTooltip } from '../../common/tooltip';
import { Text } from '../../../common/Language';
import '../../../css/assessments/style.css';
import './style.css';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
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
    marginRight: '20px',
    ...buttonStyle,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  rootp: {
    width: '100%',
    padding: '10px 0px'
  },
  nonHighlighted: {
    color: 'inherit',
    backgroundColor: 'inherit',
  },
  smallColumn: {
    // flexBasis: '12.5%',
      flexBasis: '10%',
  },
  detailsNonHighlighted: {
    alignItems: 'center',
  },
  helpText: { fontSize: '12px', color: '#808080' },
  formContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  iconButton: {
    margin: theme.spacing(1),
    ...buttonStyle,
  },
  formControl: {
    minWidth: '100%',
  },
  typography: {
    padding: theme.spacing(2),
    width: '320px',
  },
  customTooltip: {
    maxWidth: 150,
    fontSize: '12px',
    backgroundColor: '#4c4c4c',
  },
  addButton: {
    marginTop: '20px',
    marginLeft: '40px',
    minWidth: '30%',
    ...buttonStyle,
  },
  cancelButton: {
    marginTop: '20px',
    float: 'right',
    marginRight: '40px',
    minWidth: '30%',
    ...buttonStyle,
  },
}));

const EditSettingsCollectorConfig = (props: any) => {
  const classes = useStyles();
  const [fetchedData, setFetchedData] = useState(false);
  const [collectors, setCollectors] = useState<ICollectorConfigDetails>({});
  const [immediateRun, setImmediateRun] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [collectorsPosted, setCollectorsPosted] = useState(false);

  const [openPopover, setOpenPopover] = useState(false);
  const [optionsKey, setOptionsKey] = useState({colKey: '', colIndex: -1, attrKey: ''});
  const [anchorEl, setAnchorEl] = useState(null);
  const [tags, setTags] = useState<string[]>([]);

  const [backdropOpen, setBackdropOpen] = useState(false);
  const [failure, setFailure] = useState(false);
  const [failureMessage, setFailureMessage] = useState(
    <Text tid='somethingWentWrong' />
  );
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  let msgFailure = failureMessage;
  let msgSuccess = <Text tid={`${props.objType}.UpdatedSuccessfully`} />;

  const fetchCollectorAttributes = () => {
    setBackdropOpen(true);
    Http.get({
      url: `/api/v2/settings/${props.objType}`,
      state: stateVariable,
    })
      .then((response: any) => {
        setCollectors(response.config);
        initializeImmediateRun(response.config);
        setFetchedData(true);
        setBackdropOpen(false);
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
        setBackdropOpen(false);
      });
  };

  useEffect(() => {
    fetchCollectorAttributes();
  }, []);

  const initializeImmediateRun = (config: ICollectorConfigDetails) => {
    let temp = { ...immediateRun };
    Object.keys(config).map((colKey: string) =>
      config[colKey].map((collector: ICollectorConfig) => {
        temp[collector.name] = false;
      })
    );
    setImmediateRun(temp);
  };

  const handleSubmit = () => {
    if (validatePostData()) {
      setImmediateRunTimestamps();
      Http.post({
        url: `/api/v2/settings/${props.objType}`,
        body: {
          ...collectors,
        },
        state: stateVariable,
      })
        .then((response: any) => {
          setCollectorsPosted(true);
          setBackdropOpen(false);
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
          setBackdropOpen(false);
        });
    }
  };

  const validatePostData = () => {
    let validState = true;

    Object.keys(collectors).map((colKey: string) =>
      collectors[colKey].map(
        (collector: ICollectorConfig, colIndex: number) => {
          if (
            collector.collectorSchedule < 1 ||
            collector.collectorSchedule > 24
          ) {
            setFailure(true);
            setFailureMessage(
              <Text tid='collector.schedule.range.check' />
            );
            validState = false;
          }
        }
      )
    );
    return validState;
  };

  const setImmediateRunTimestamps = () => {
    let temp: ICollectorConfigDetails = { ...collectors };
    Object.keys(temp).map((colKey: string) =>
      temp[colKey].map((collector: ICollectorConfig, colIndex: number) => {
        if (immediateRun[collector.name]) {
          temp[colKey][colIndex].nextCollectorRunTimestamp = Date.now();
        }
      })
    );
    setCollectors(temp);
  };

  const handleClose = () => {
    setFailure(false);
  };

  const handleCollectorScheduleChange = (
    event: any,
    colKey: string,
    colIndex: number
  ) => {
    let temp: ICollectorConfigDetails = { ...collectors };
    temp[colKey][colIndex].collectorSchedule = event.target.value;
    setCollectors(temp);
  };

  const handleToggleImmediateRun = (
    event: any,
    colKey: string,
    colIndex: number
  ) => {
    let tempRunList = { ...immediateRun };
    const colName = collectors[colKey][colIndex].name;
    tempRunList[colName] = !tempRunList[colName];
    setImmediateRun(tempRunList);
  };

  const handleChangeDefaultValue = (event: any, colKey: string, colIndex: number, attrKey: string) => {
    let temp: ICollectorConfigDetails = { ...collectors };
    temp[colKey][colIndex].attributes[attrKey].defaultValue = event.target.value;
    setCollectors(temp);
  };

  const handleAttrDisplayNameChange = (event: any, colKey: string, colIndex: number, attrKey: string) => {
    let temp: ICollectorConfigDetails = { ...collectors };
    temp[colKey][colIndex].attributes[attrKey].displayName = event.target.value;
    setCollectors(temp);
  };

  const handleAttrTypeChange = (event: any, colKey: string, colIndex: number, attrKey: string) => {
    let temp: ICollectorConfigDetails = { ...collectors };
    switch (event.target.value) {
      case 'list':
      case 'multi-list':
      case 'list-no-others': {
        if (
          temp[colKey][colIndex].attributes[attrKey].type !== 'list' &&
          temp[colKey][colIndex].attributes[attrKey].type !== 'multi-list' &&
          temp[colKey][colIndex].attributes[attrKey].type !== 'list-no-others'
        ) {
          temp[colKey][colIndex].attributes[attrKey].options = {};
          temp[colKey][colIndex].attributes[attrKey].options.custom = '';
        }
        break;
      }
      case 'string':
      case 'number':
      case 'password':
          default: {
        delete temp[colKey][colIndex].attributes[attrKey].options;
        break;
      }
    }
    temp[colKey][colIndex].attributes[attrKey].type = event.target.value;
    setCollectors(temp);
  };

  const handleAttrOptionsChange = (event: any, colKey: string, colIndex: number, attrKey: string) => {
    let temp: ICollectorConfigDetails = { ...collectors };
    if (tags.length > 0) {
      temp[colKey][colIndex].attributes[attrKey].options.custom = temp[colKey][colIndex].attributes[attrKey].options.custom.concat(
        (temp[colKey][colIndex].attributes[attrKey].options.custom === '') ? '' : ',',
        tags.join(',')
      );
      setCollectors(temp);
    }
    handleClosePopover();
  };

  const handleAttrMandatoryChange = (event: any, colKey: string, colIndex: number, attrKey: string) => {
    let temp: ICollectorConfigDetails = { ...collectors };
    temp[colKey][colIndex].attributes[attrKey].mandatory = !temp[colKey][colIndex].attributes[attrKey].mandatory;
    setCollectors(temp);
  };

  const handleOpenPopover = (event: any, colKey: string, colIndex: number, attrKey: string) => {
    setOptionsKey({colKey: colKey, colIndex: colIndex, attrKey: attrKey});
    setAnchorEl(event.currentTarget);
    setOpenPopover(true);
  };

  const handleClosePopover = () => {
    setOpenPopover(false);
    setAnchorEl(null);
    setTags([]);
    setFailureMessage(<Text tid='somethingWentWrong' />); //need to check statement
  };

  const isDuplicate = (newValue: string, originalValuesSring: string): boolean => {
    const newValueModified = newValue.replace(/[. -]/g, '').toLowerCase();
    const origValList = originalValuesSring.split(',');
    for (var i = 0; i < origValList.length; i++) {
      const valModified = origValList[i].replace(/[. -]/g, '').toLowerCase();
      if (valModified === newValueModified) {
        return true;
      }
    }
    for (var j = 0; j < tags.length; j++) {
      const valModified = tags[j].replace(/[. -]/g, '').toLowerCase();
      if (valModified === newValueModified) {
        return true;
      }
    }
    return false;
  };

  const removeTags = (indexToRemove: any) => {
    setTags([...tags.filter((_, index) => index !== indexToRemove)]);
  };

  const addTags = (event: any, colKey: string, colIndex: number, attrKey: string) => {
    const value = event.target.value.trim();
    if (value && tags) {
      if (isDuplicate(value, collectors[colKey][colIndex].attributes[attrKey].options.custom)) {
        setFailureMessage(
          <Text tid='similar.option.error' />
        );
      } else {
        setFailureMessage(<Text tid='somethingWentWrong' />);
        setTags([...tags, value]);
        event.target.value = '';
      }
    }
  };

  const renderPopover = (colKey: string, colIndex: number, attrKey: string) => {
    let temp: ICollectorConfigDetails = { ...collectors };
    return (
      <Popover
        id={`${colKey}_${colIndex}_${attrKey}_popover`}
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <div className={classes.typography}>
          <Typography>
            <Text tid='addOptions' />
          </Typography>
          <Typography style={{ fontWeight: 'lighter', margin: '10px 0px' }}>
            {temp[colKey][colIndex].attributes[attrKey].options ? temp[colKey][colIndex].attributes[attrKey].options.custom : ''}
          </Typography>
          <div className='tags-input'>
            <ul id='tags'>
              {tags.map((tag, index) => (
                <li key={index} className='tag'>
                  <span className='tag-title'>{tag}</span>
                  <span
                    className='tag-close-icon'
                    onClick={() => removeTags(index)}
                  >
                    x
                  </span>
                </li>
              ))}
            </ul>
            <input
              type='text'
              onKeyUp={(event) =>
                event.key === 'Enter' ? addTags(event, colKey, colIndex, attrKey) : null
              }
              placeholder='Press Enter key to input typed option'
            />
          </div>

          {/* {failureMessage.includes("Can't add.") && (
            <p className='errorMessage'>{failureMessage}</p>
          )} */}

          <Button
            onClick={(event: any) => {
              handleAttrOptionsChange(event, colKey, colIndex, attrKey);
            }}
            className={classes.addButton}
            variant='outlined'
            color='primary'
            size='small'
            disabled={false /*uniqueOption*/}
          >
            <Text tid='add' />
          </Button>
          <Button
            onClick={handleClosePopover}
            className={classes.cancelButton}
            variant='outlined'
            color='primary'
            size='small'
          >
            <Text tid='cancel' />
          </Button>
        </div>
      </Popover>
    );
  };

  const renderAttribute = (collector: ICollectorConfig, colKey: string, colIndex: number, attrKey: string) => {
    const collectorAttr: IFieldConfigAttributes = collector.attributes[attrKey];
    if(collector.name === 'JIRAIncidents') {
      console.log({collectorAttr: collectorAttr});
    }
    return (
      <TableRow key={`${colKey}_${colIndex}_${attrKey}`}>
        <TableCell
          component='th'
          scope='row'
          align='center'
          className='tableCell'
        >
          <TextField
            type='string'
            id={`${colKey}_${colIndex}_${attrKey}_name`}
            name={`${colKey}_${colIndex}_${attrKey}_name`}
            value={collectorAttr.displayName}
            onChange={(event: any) => {
              handleAttrDisplayNameChange(event, colKey, colIndex, attrKey);
            }}
            fullWidth
          />
        </TableCell>
        <TableCell
          component='th'
          scope='row'
          align='center'
          className='tableCell'
        >
          <FormControl className={classes.formControl}>
            <Select
              id={`${colKey}_${colIndex}_${attrKey}_type`}
              name={`${colKey}_${colIndex}_${attrKey}_type`}
              value={collectorAttr.type}
              onChange={(event: any) => {
                handleAttrTypeChange(event, colKey, colIndex, attrKey);
              }}
              disabled={true}
            >
              <MenuItem key={'string'} value={'string'}>
                <Text tid='stringInput' />
              </MenuItem>
              <MenuItem key={'number'} value={'number'}>
                <Text tid='numberInput' />
              </MenuItem>
              <MenuItem key={'password'} value={'password'}>
                <Text tid='passwordInput' />
              </MenuItem>
              <MenuItem key={'list'} value={'list'}>
                <Text tid='singleSelect' />
              </MenuItem>
              <MenuItem key={'list-no-others'} value={'list-no-others'}>
                <Text tid='listNoOtherOptions' />
              </MenuItem>
              <MenuItem key={'multi-list'} value={'multi-list'}>
                <Text tid='multiSelect' />
              </MenuItem>
            </Select>
          </FormControl>
        </TableCell>
        <TableCell
          component='th'
          scope='row'
          align='center'
          className='tableCell'
          style={{ paddingRight: 0 }}
        >
          {collectorAttr.type === 'list' ||
          collectorAttr.type === 'multi-list' ||
          collectorAttr.type === 'list-no-others' ? (
            collectorAttr.custom || (collectorAttr.options && collectorAttr.options.custom) ? (
              <Tooltip
                title={`${collectorAttr.options.custom}`}
                classes={{ tooltip: classes.customTooltip }}
                arrow
                disableHoverListener={collectorAttr.options.custom.length < 15}
              >
                <Typography
                  color='textSecondary'
                  style={{ marginTop: '18px' }}
                  className='option-data'
                >
                  {collectorAttr.options ? collectorAttr.options.custom : ''}
                </Typography>
              </Tooltip>
            ) : (
              <Typography color='textSecondary' style={{ marginTop: '18px' }}>
                --
              </Typography>
            )
          ) : (
            <Typography color='textSecondary' style={{ marginTop: '18px' }}>
              -NA-
            </Typography>
          )}
        </TableCell>
        <TableCell
          component='th'
          scope='row'
          align='left'
          className='tableCell'
          style={{ paddingLeft: 0 }}
        >
          {collectorAttr.type === 'list' ||
          collectorAttr.type === 'multi-list' ||
          collectorAttr.type === 'list-no-others' ? (
            collectorAttr.custom || (collectorAttr.options && collectorAttr.options.custom !== undefined) ? (
              <Fragment>
                <IconButton
                  className={classes.iconButton}
                  size='small'
                  onClick={(event: any) => handleOpenPopover(event, colKey, colIndex, attrKey)}
                >
                  <AddIcon />
                </IconButton>
                {optionsKey.colKey === colKey && optionsKey.colIndex === colIndex && optionsKey.attrKey === attrKey && renderPopover(colKey, colIndex, attrKey)}
              </Fragment>
            ) : (
              <Typography />
            )
          ) : (
            <Typography />
          )}
        </TableCell>
        <TableCell
          component='th'
          scope='row'
          align='center'
          className='tableCell'
        >
          <div>
            <FormControlLabel
              control={
                <Checkbox
                  checked={collectorAttr.mandatory}
                  onChange={(event: any) => {
                    handleAttrMandatoryChange(event, colKey, colIndex, attrKey);
                  }}
                  value='true'
                  disabled={!collectorAttr.custom}
                />
              }
              label={''}
            />
          </div>
        </TableCell>
        <TableCell
          component='th'
          scope='row'
          align='center'
          className='tableCell'
        >
          <TextField
            required={collectorAttr.mandatory}
            type='string'
            id={`${colKey}_${colIndex}_${attrKey}_val`}
            name={`${colKey}_${colIndex}_${attrKey}_val`}
            value={collectorAttr.defaultValue}
            label={collectorAttr.displayName}
            onChange={(event: any) =>
              handleChangeDefaultValue(event, colKey, colIndex, attrKey)
            }
            fullWidth
            autoComplete='off'
            className='textFieldStyle'
          />
        </TableCell>
      </TableRow>
    );
  };

  const renderCollectorsDetails = (colKey: string, colIndex: number, collector: ICollectorConfig) => {
    return (
      <ExpansionPanel className={classes.title}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='panel1c-content'
          id='panel1c-header'
          className={classes.nonHighlighted}
        >
          <Typography variant='h6' gutterBottom>
            {collector.name}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.detailsNonHighlighted}>
          <div style={{ display: 'block', width: '100%' }}>
            <Grid container alignItems='center'>
              <Grid item sm={1}>
                <InputLabel>
                  Run every {/*<Text tid='runEvery' />*/}
                </InputLabel>
              </Grid>
              <Grid item sm={1}>
                <TextField
                  required={true}
                  type='number'
                  id={`schedule_${collector.name}`}
                  name={`schedule_${collector.name}`}
                  value={collector.collectorSchedule}
                  label={''}
                  onChange={(event: any) =>
                    handleCollectorScheduleChange(event, colKey, colIndex)
                  }
                  autoComplete='off'
                  InputProps={{
                    inputProps: { min: 1, max: 24 },
                    disableUnderline: true,
                  }}
                  className='textFieldStyle'
                  style={{
                    paddingLeft: '8px',
                    paddingRight: '8px',
                  }}
                />
              </Grid>
              <Grid item sm={2}>
                <InputLabel>
                  hours {/*<Text tid='hours' />*/}
                </InputLabel>
              </Grid>
              <Grid item sm={3} />
              <Grid item sm={5}>
                <FormControlLabel
                  style={{ paddingLeft: '36px' }}
                  control={
                    <Checkbox
                      checked={
                        immediateRun[collectors[colKey][colIndex].name]
                      }
                      onChange={(event: any) => {
                        handleToggleImmediateRun(event, colKey, colIndex);
                      }}
                      value='true'
                    />
                  }
                  label={'Schedule for Immediate Run'}
                />
              </Grid>
            </Grid>
            <Paper className='tableArea'>
              <form
                className={classes.formContainer}
                noValidate
                autoComplete='off'
              >
                <Table className='table'>
                  <TableHead className='tableHead'>
                    <TableRow>
                      <TableCell className='tableHeadCell'>
                        <Typography className='tableHeadText'>
                          <Text tid='displayedLabel' />
                        </Typography>
                      </TableCell>
                      <TableCell align='center' className='tableHeadCell'>
                        <Typography className='tableHeadText'>
                          <Text tid='type' />
                        </Typography>
                      </TableCell>
                      <TableCell align='center' className='tableHeadCell'>
                        <Typography className='tableHeadText'>
                          <Text tid='options' />
                        </Typography>
                      </TableCell>
                      <TableCell align='left' className='tableHeadCell' />
                      <TableCell align='center' className='tableHeadCell'>
                        <Typography className='tableHeadText'>
                          <Text tid='mandatory?' />
                        </Typography>
                      </TableCell>
                      <TableCell align='center' className='tableHeadCell'>
                        <Typography className='tableHeadText'>
                          <Text tid='defaultValue' />
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(collector.attributes).map((attrKey: string, i: number) =>
                      renderAttribute(collector, colKey, colIndex, attrKey)
                    )}
                    {/*Object.keys(collector.attributes).map((attrKey: string, i: number) =>
                      (
                        <Grid item sm={12} key={i}>
                          {renderAttribute(collector, colKey, colIndex, attrKey)}
                        </Grid>
                      )
                      )*/}
                  </TableBody>
                </Table>
              </form>
            </Paper>
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }

  const renderCollectorsEditor = () => {
    if (collectorsPosted) {
      return (
        <Fragment>
          <Success message={msgSuccess} />
          <div className='bottomButtonsContainer'>
            <Button
              className={classes.backButton}
              variant='outlined'
              onClick={() => {
                props.goBack(MANAGE_SETTINGS);
              }}
            >
              <Text tid='goBack' />
            </Button>
          </div>
        </Fragment>
      );
    }
    return (
      <Container maxWidth='lg' component='div' className='containerRoot'>
        <Backdrop className={classes.backdrop} open={backdropOpen}>
          <CircularProgress color='inherit' />
        </Backdrop>
        <div style={{ width: '100%' }}>
          <Grid container spacing={3}>
            <Grid item sm={12}>
              <Typography variant='h6' gutterBottom className={classes.title}>
                <Text tid={`admin.settings.${props.objType}.name`} />
              </Typography>
            </Grid>
            <Grid item sm={12}>
              {Object.keys(collectors).map((colKey: string) =>
                collectors[colKey].map(
                  (collector: ICollectorConfig, colIndex: number) => {
                    return (
                      <div key={colIndex} className={classes.rootp}>
                        {renderCollectorsDetails(colKey, colIndex, collector)}
                      </div>
                    );
                  }                 
                )
              )}
            </Grid>
          </Grid>
        </div>
        {collectors && (
          <div className='bottomButtonsContainer'>
            <Button
              className={classes.backButton}
              variant='outlined'
              onClick={() => {
                props.goBack(MANAGE_SETTINGS);
              }}
            >
              <Text tid='goBack' />
            </Button>
            <Button
              className={classes.button}
              onClick={handleSubmit}
              variant='outlined'
            >
              <Text tid='save' />
            </Button>
          </div>
        )}
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
      </Container>
    );
  };

  return (
    <Fragment>
      {fetchedData ? (
        renderCollectorsEditor()
      ) : (
        <Container className='loaderStyle'>
          <Loader />
        </Container>
      )}
    </Fragment>
  );
};

export default withRouter(EditSettingsCollectorConfig);
