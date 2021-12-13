import React, { useEffect, useState, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Typography,
  Grid,
  FormControlLabel,
  TextField,
  Checkbox,
  Container,
  Backdrop,
  IconButton,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  CircularProgress,
  Button,
  makeStyles,
  FormControl,
  Select,
  MenuItem,
  Snackbar,
  SnackbarContent,
  Popover,
  Tooltip,
} from '@material-ui/core';
import { IRootState } from '../../../reducers';
import Loader from '../../loader';
import { Http } from '../../../utils';
import {
  //  EDIT_SETTINGS_TEAM_CONFIG,
  //  EDIT_SETTINGS_USER_CONFIG,
  MANAGE_SETTINGS,
} from '../../../pages/admin';
import ClearIcon from '@material-ui/icons/Clear';
import AddIcon from '@material-ui/icons/Add';
import Success from '../../success-page';
import { buttonStyle } from '../../../common/common';
import {
  IFieldConfigAttributes,
  IObjectConfigDetails,
} from '../../../model/system';
import { LightTooltip } from '../../common/tooltip';
import { ModalComponent } from '../../modal';
import { Text } from '../../../common/Language';
import '../../../css/assessments/style.css';
import './style.css';

const NEW_ATTR_KEY_PREFIX = 'newAttr';

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: '36px',
    position: 'relative',
    minWidth: '10%',
    ...buttonStyle,
  },
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

const EditSettingsObjectConfig = (props: any) => {
  const classes = useStyles();
  const emptyAttribute: IFieldConfigAttributes = {
    displayName: '',
    custom: true,
    mandatory: false,
    type: 'string',
  };
  const [fetchedData, setFetchedData] = useState(false);
  const [attributesMap, setAttributesMap] = useState<IObjectConfigDetails>({});
  const [attributesPosted, setAttributesPosted] = useState(false);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [failure, setFailure] = useState(false);
  const [failureMessage, setFailureMessage] = useState(
    <Text tid='somethingWentWrong' />
  );
  const [lastIndexAdded, setLastIndexAdded] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [deleteKey, setDeleteKey] = useState('');
  const [openPopover, setOpenPopover] = useState(false);
  const [optionsKey, setOptionsKey] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [tags, setTags] = useState<string[]>([]);
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  let msgFailure = failureMessage;
  let msgSuccess = <Text tid={`${props.objType}.UpdatedSuccessfully`} />

  const fetchAttributes = () => {
    setBackdropOpen(true);
    Http.get({
      url: `/api/v2/settings/${props.objType}`,
      state: stateVariable,
    })
      .then((response: any) => {
        const responseConfigSorted: any = {};
        const responseKeysSorted = Object.keys(response.config).sort(
          (a: any, b: any) => {
            return response.config[a].custom ? 1 : -1;
          }
        );
        responseKeysSorted.forEach((el: string) => {
          responseConfigSorted[el] = response.config[el];
        });
        setAttributesMap(responseConfigSorted);
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
    fetchAttributes();
  }, []);

  const handleSubmit = () => {
    if (validatePostData()) {
      setBackdropOpen(true);
      Http.post({
        url: `/api/v2/settings/${props.objType}`,
        body: {
          ...attributesMap,
        },
        state: stateVariable,
      })
        .then((response: any) => {
          setAttributesPosted(true);
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
    Object.keys(attributesMap).forEach((key: string) => {
      if (!validateAttribute(key)) {
        return false;
      }
    });
    return true;
  };

  const validateAttribute = (key: string) => {
    const attr: IFieldConfigAttributes = attributesMap[key];
    if (attr.displayName === '') {
      setFailure(true);
      setFailureMessage(<Text tid='fieldLabelCannotBeEmpty' />);
      return false;
    }
    if (
      attr.type === 'list' ||
      attr.type === 'multi-list' ||
      attr.type === 'list-no-others'
    ) {
      if (
        typeof attr.options === 'undefined' ||
        attr.options === {} ||
        (typeof attr.options.custom !== 'undefined' &&
          attr.options.custom === '')
      ) {
        setFailure(true);
        setFailureMessage(
          <Text tid='optionsMustBeProvidedForAttributeTypeListOrListNoOthersOrMultiList' />
        );
        return false;
      }
    }
    return true;
  };

  const addAttribute = () => {
    const key = `${NEW_ATTR_KEY_PREFIX}${lastIndexAdded}`;
    const attrMap: IObjectConfigDetails = { ...attributesMap };
    attrMap[key] = emptyAttribute;
    setAttributesMap(attrMap);
    setLastIndexAdded(lastIndexAdded + 1);
  };

  const confirmAndDeleteAttribute = (key: string) => {
    setDeleteKey(key);
    if (key.startsWith(NEW_ATTR_KEY_PREFIX)) {
      deleteAttribute();
    } else {
      setOpenModal(true);
    }
  };

  const deleteAttribute = () => {
    if (deleteKey !== '') {
      const attrMap: IObjectConfigDetails = { ...attributesMap };

      delete attrMap[deleteKey];
      setAttributesMap(attrMap);
      setDeleteKey('');
    }
  };

  const modalNoClicked = () => {
    setDeleteKey('');
    setOpenModal(false);
  };

  const modalYesClicked = () => {
    setOpenModal(false);
    deleteAttribute();
  };

  const handleAttrDisplayNameChange = (event: any, key: string) => {
    const attrMap: IObjectConfigDetails = { ...attributesMap };
    attrMap[key].displayName = event.target.value;
    setAttributesMap(attrMap);
  };

  const handleAttrTypeChange = (event: any, key: string) => {
    const attrMap: IObjectConfigDetails = { ...attributesMap };
    switch (event.target.value) {
      case 'list':
      case 'multi-list':
      case 'list-no-others': {
        if (
          attrMap[key].type !== 'list' &&
          attrMap[key].type !== 'multi-list' &&
          attrMap[key].type !== 'list-no-others'
        ) {
          attrMap[key].options = {};
          attrMap[key].options.custom = '';
        }
        break;
      }
      case 'string':
      case 'number':
      default: {
        attrMap[key].options = undefined;
        break;
      }
    }
    attrMap[key].type = event.target.value;
    setAttributesMap(attrMap);
  };

  const handleAttrOptionsChange = (event: any, key: string) => {
    const attrMap: IObjectConfigDetails = { ...attributesMap };
    if (tags.length > 0) {
      attrMap[key].options.custom = attrMap[key].options.custom.concat(
        (attrMap[key].options.custom === '') ? '' : ',',
        tags.join(',')
      );
      setAttributesMap(attrMap);
    }
    handleClosePopover();
  };

  const handleAttrMandatoryChange = (event: any, key: string) => {
    const attrMap: IObjectConfigDetails = { ...attributesMap };
    attrMap[key].mandatory = !attrMap[key].mandatory;
    setAttributesMap(attrMap);
  };

  const snackBarClose = () => {
    setFailure(false);
  };

  const handleOpenPopover = (event: any, key: string) => {
    setOptionsKey(key);
    setAnchorEl(event.currentTarget);
    setOpenPopover(true);
  };

  const handleClosePopover = () => {
    setOpenPopover(false);
    setAnchorEl(null);
    setTags([]);
    setFailureMessage(<Text tid='somethingWentWrong' />); //need to check statement
  };

  const isDuplicate = (
    newValue: string,
    originalValuesSring: string
  ): boolean => {
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

  const removeTags = (
    indexToRemove: any,
    /*tagToRemove: any,*/ key: string
  ) => {
    setTags([...tags.filter((_, index) => index !== indexToRemove)]);
  };

  const addTags = (event: any, key: string) => {
    const value = event.target.value.trim();
    if (value && tags) {
      if (isDuplicate(value, attributesMap[key].options.custom)) {
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

  const renderPopover = (el: string, i: number) => {
    const attr: IFieldConfigAttributes = attributesMap[el];
    return (
      <Popover
        id={`${el}_popover`}
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
            {attr.options ? attr.options.custom : ''}
          </Typography>
          <div className='tags-input'>
            <ul id='tags'>
              {tags.map((tag, index) => (
                <li key={index} className='tag'>
                  <span className='tag-title'>{tag}</span>
                  <span
                    className='tag-close-icon'
                    onClick={() => removeTags(index, el)}
                  >
                    x
                  </span>
                </li>
              ))}
            </ul>
            <input
              type='text'
              onKeyUp={(event) =>
                event.key === 'Enter' ? addTags(event, el) : null
              }
              placeholder='Press Enter key to input typed option'
            />
          </div>

          {/* {failureMessage.includes("Can't add.") && (
            <p className='errorMessage'>{failureMessage}</p>
          )} */}

          <Button
            onClick={(event: any) => {
              handleAttrOptionsChange(event, el);
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

  const renderAttribute = (el: string, i: number) => {
    const attr: IFieldConfigAttributes = attributesMap[el];
    return (
      <TableRow key={i}>
        <TableCell
          component='th'
          scope='row'
          align='center'
          className='tableCell'
        >
          <TextField
            type='string'
            id={`${el}_name`}
            name={`${el}_name`}
            value={attr.displayName}
            onChange={(event: any) => {
              handleAttrDisplayNameChange(event, el);
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
              id={`${el}_type`}
              name={`${el}_type`}
              value={attr.type}
              onChange={(event: any) => {
                handleAttrTypeChange(event, el);
              }}
              disabled={!el.startsWith(NEW_ATTR_KEY_PREFIX)}
            >
              <MenuItem key={'string'} value={'string'}>
                <Text tid='stringInput' />
              </MenuItem>
              <MenuItem key={'number'} value={'number'}>
                <Text tid='numberInput' />
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
          {attr.type === 'list' ||
          attr.type === 'multi-list' ||
          attr.type === 'list-no-others' ? (
            attr.custom || (attr.options && attr.options.custom) ? (
              <Tooltip
                title={`${attr.options.custom}`}
                classes={{ tooltip: classes.customTooltip }}
                arrow
                disableHoverListener={attr.options.custom.length < 15}
              >
                <Typography
                  color='textSecondary'
                  style={{ marginTop: '18px' }}
                  className='option-data'
                >
                  {attr.options ? attr.options.custom : ''}
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
          {attr.type === 'list' ||
          attr.type === 'multi-list' ||
          attr.type === 'list-no-others' ? (
            attr.custom || (attr.options && attr.options.custom !== undefined) ? (
              <Fragment>
                <IconButton
                  className={classes.iconButton}
                  size='small'
                  onClick={(event: any) => handleOpenPopover(event, el)}
                >
                  <AddIcon />
                </IconButton>
                {optionsKey === el && renderPopover(el, i)}
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
                  checked={attr.mandatory}
                  onChange={(event: any) => {
                    handleAttrMandatoryChange(event, el);
                  }}
                  value='true'
                  disabled={!attr.custom}
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
          {attr.custom ? (
            <div style={{ marginTop: '10px', cursor: 'pointer' }}>
              <LightTooltip
                title='Delete this attribute'
                aria-label='delete this attribute'
              >
                <IconButton
                  className={classes.iconButton}
                  size='small'
                  onClick={() => {
                    confirmAndDeleteAttribute(el);
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </LightTooltip>
            </div>
          ) : (
            <Typography color='textSecondary' style={{ marginTop: '20px' }}>
              <Text tid='systemAttribute' />
            </Typography>
          )}
        </TableCell>
      </TableRow>
    );
  };

  const renderAttributesEditor = () => {
    if (attributesPosted) {
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
      <Fragment>
        <Container maxWidth='lg' component='div' className='containerRoot'>
          <Backdrop className={classes.backdrop} open={backdropOpen}>
            <CircularProgress color='inherit' />
          </Backdrop>
          <div style={{ width: '100%' }}>
            <Grid container spacing={3}>
              <Grid item sm={6}>
                <Typography variant='h6'>
                  <Text tid={`admin.settings.${props.objType}.name`} />
                </Typography>
              </Grid>
              <Grid item sm={6} />
              <Grid item sm={12}>
                <Typography color='textSecondary'>
                  <Text tid='systemAttributesCannotBeDeletedOrChanged' />
                </Typography>
              </Grid>
            </Grid>
          </div>
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
                        <Text tid='delete' />
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(attributesMap).map((el: string, i: number) =>
                    renderAttribute(el, i)
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow style={{ margin: '10px', cursor: 'pointer' }}>
                    <TableCell className='tableHeadCell'>
                      <Button
                        className={classes.iconButton}
                        startIcon={<AddIcon />}
                        size='small'
                        onClick={() => {
                          addAttribute();
                        }}
                      >
                        <Text tid='addAnotherAttribute' />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </form>
          </Paper>
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
          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={failure}
            onClose={snackBarClose}
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
            message={'objectAttributePermanentDeletionWarning'}
            openModal={openModal}
            handleModalYesClicked={modalYesClicked}
            handleModalNoClicked={modalNoClicked}
          />
        </Container>
      </Fragment>
    );
  };

  return (
    <Fragment>
      {fetchedData ? (
        renderAttributesEditor()
      ) : (
        <Container className='loaderStyle'>
          <Loader />
        </Container>
      )}
    </Fragment>
  );
};

export default withRouter(EditSettingsObjectConfig);
