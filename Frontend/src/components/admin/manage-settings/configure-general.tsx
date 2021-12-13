import React, { useEffect, useState, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Typography,
  Grid,
  TextField,
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
  Snackbar,
  SnackbarContent,
  InputLabel,
} from '@material-ui/core';
import { IRootState } from '../../../reducers';
import { ChromePicker } from 'react-color';
import Loader from '../../loader';
import { Http } from '../../../utils';
import { MANAGE_SETTINGS } from '../../../pages/admin';
import ClearIcon from '@material-ui/icons/Clear';
import AddIcon from '@material-ui/icons/Add';
import Success from '../../success-page';
import { buttonStyle } from '../../../common/common';
import { ILevelAttributes, IGeneralConfigDetails } from '../../../model/system';
import { LightTooltip } from '../../common/tooltip';
import { Text } from '../../../common/Language';
import '../../../css/assessments/style.css';

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
  popover: {
    position: 'absolute',
    zIndex: 2,
  },
  cover: {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  },
}));

const EditSettingsGeneralConfig = (props: any) => {
  const classes = useStyles();
  const emptyAttribute: ILevelAttributes = {
    color: '#aaaaaa',
    name: '',
    lowerLimit: 0,
    upperLimit: 0,
  };
  const [fetchedData, setFetchedData] = useState(false);
  const [
    resultAttributes,
    setResultAttributes,
  ] = useState<IGeneralConfigDetails>({
    levels: [],
    performanceMetricsConstant: 3,
    archiveDays: 0,
  });
  const [attributesPosted, setAttributesPosted] = useState(false);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [failure, setFailure] = useState(false);
  const [failureMessage, setFailureMessage] = useState(
    <Text tid='somethingWentWrong' />
  );
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [displayColorRow, setDisplayColorRow] = useState(0);

  let msgFailure = failureMessage;
  let msgSuccess = <Text tid={`${props.objType}.UpdatedSuccessfully`} />;

  const fetchResultAttributes = () => {
    setBackdropOpen(true);
    Http.get({
      url: `/api/v2/settings/${props.objType}`,
      state: stateVariable,
    })
      .then((response: any) => {
        const sortedLevels = response.config.levels.sort(
          (a: ILevelAttributes, b: ILevelAttributes) => {
            return a.lowerLimit > b.lowerLimit ? 1 : -1;
          }
        );
        setResultAttributes({ ...response.config, levels: sortedLevels });
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
    fetchResultAttributes();
  }, []);

  const handleSubmit = () => {
    if (validatePostData()) {
      Http.post({
        url: `/api/v2/settings/${props.objType}`,
        body: {
          ...resultAttributes,
        },
        state: stateVariable,
      })
        .then((response: any) => {
          setAttributesPosted(true);
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
    }
  };

  const validatePostData = () => {
    if (resultAttributes.levels.length < 3) {
      setFailure(true);
      setFailureMessage(<Text tid='setAtleastThreeLevels' />);
      return false;
    }
    const sortedLevels: ILevelAttributes[] = resultAttributes.levels.sort(
      (a: ILevelAttributes, b: ILevelAttributes) => {
        return a.lowerLimit >= b.lowerLimit ? 1 : -1;
      }
    );
    for (let i: number = 0; i < sortedLevels.length; i++) {
      for (let j: number = i + 1; j < sortedLevels.length; j++) {
        if (
          sortedLevels[i].name.toLowerCase() ===
          sortedLevels[j].name.toLowerCase()
        ) {
          setFailure(true);
          setFailureMessage(<Text tid='haveUniqueName' />);
          return false;
        }
      }
      if (sortedLevels[i].name === '') {
        setFailure(true);
        setFailureMessage(<Text tid='haveUniqueName' />);
        return false;
      }
      if (
        0 > Number(sortedLevels[i].lowerLimit) ||
        100 <= Number(sortedLevels[i].lowerLimit) ||
        0 >= Number(sortedLevels[i].upperLimit) ||
        100 < Number(sortedLevels[i].upperLimit)
      ) {
        setFailure(true);
        setFailureMessage(<Text tid='haveValuesBetweenZeroToHundred' />);
        return false;
      }
      if (
        Number(sortedLevels[i].lowerLimit) >= Number(sortedLevels[i].upperLimit)
      ) {
        setFailure(true);
        setFailureMessage(
          <Text tid='lowerLimitOfaLevelShouldBeLessThanItsUpperLimit' />
        );
        return false;
      }
      if (
        i < sortedLevels.length - 1 &&
        Number(sortedLevels[i].upperLimit) !==
          Number(sortedLevels[i + 1].lowerLimit) - 1
      ) {
        setFailure(true);
        setFailureMessage(<Text tid='limitsOfEachLevelValues' />);
        return false;
      }
    }
    if (0 !== Number(sortedLevels[0].lowerLimit)) {
      setFailure(true);
      setFailureMessage(<Text tid='lowerLimitValue' />);
      return false;
    }
    if (100 !== Number(sortedLevels[sortedLevels.length - 1].upperLimit)) {
      setFailure(true);
      setFailureMessage(<Text tid='upperLimitValue' />);
      return false;
    }
    if (
      1 > resultAttributes.performanceMetricsConstant ||
      10 < resultAttributes.performanceMetricsConstant
    ) {
      setFailure(true);
      setFailureMessage(<Text tid='performanceMetricsConstantValue' />);
      return false;
    }
    return true;
  };

  const addLevelAttribute = () => {
    const attrMap: IGeneralConfigDetails = { ...resultAttributes };
    attrMap.levels.push(emptyAttribute);
    setResultAttributes(attrMap);
  };

  const deleteLevelAttribute = (i: number) => {
    const attrMap: IGeneralConfigDetails = { ...resultAttributes };
    attrMap.levels.splice(i, 1);
    setResultAttributes(attrMap);
  };

  const handleAttrNameChange = (event: any, i: number) => {
    const attrMap: IGeneralConfigDetails = { ...resultAttributes };
    attrMap.levels[i].name = event.target.value;
    setResultAttributes(attrMap);
  };

  const handleAttrLowerLimitChange = (event: any, i: number) => {
    const attrMap: IGeneralConfigDetails = { ...resultAttributes };
    attrMap.levels[i].lowerLimit = event.target.value;
    setResultAttributes(attrMap);
  };

  const handleAttrUpperLimitChange = (event: any, i: number) => {
    const attrMap: IGeneralConfigDetails = { ...resultAttributes };
    attrMap.levels[i].upperLimit = event.target.value;
    setResultAttributes(attrMap);
  };

  const handleAttrColorChange = (color: any, i: number) => {
    const attrMap: IGeneralConfigDetails = { ...resultAttributes };
    attrMap.levels[i].color = color.hex.toUpperCase();
    setResultAttributes(attrMap);
  };

  const openColorPicker = (index: number) => {
    setDisplayColorPicker(!displayColorPicker);
    setDisplayColorRow(index);
  };

  const closeColorPicker = () => {
    setDisplayColorPicker(false);
  };

  const handlePerformanceMetricsConstantChange = (event: any) => {
    const attrMap: IGeneralConfigDetails = { ...resultAttributes };
    attrMap.performanceMetricsConstant = event.target.value;
    setResultAttributes(attrMap);
  };
  
  const handleArchiveDaysChange = (event: any) => {
    const attrMap: IGeneralConfigDetails = { ...resultAttributes };
    attrMap.archiveDays = event.target.value;
    setResultAttributes(attrMap);
  };

  const handleClose = () => {
    setFailure(false);
  };

  const renderLevelAttribute = (attr: ILevelAttributes, i: number) => {
    return (
      <TableRow key={`level_${i}`}>
        <TableCell
          component='th'
          scope='row'
          align='center'
          className='tableCell'
        >
          <TextField
            type='string'
            id={`${i}_name`}
            name={`${i}_name`}
            value={attr.name}
            onChange={(event: any) => {
              handleAttrNameChange(event, i);
            }}
            fullWidth
            autoComplete='off'
          />
        </TableCell>
        <TableCell
          component='th'
          scope='row'
          align='center'
          className='tableCell'
        >
          <TextField
            type='number'
            id={`${i}_lowerLimit`}
            name={`${i}_lowerLimit`}
            value={attr.lowerLimit}
            onChange={(event: any) => {
              handleAttrLowerLimitChange(event, i);
            }}
            fullWidth
            autoComplete='off'
            InputProps={{ disableUnderline: true }}
          />
        </TableCell>
        <TableCell
          component='th'
          scope='row'
          align='center'
          className='tableCell'
        >
          <TextField
            type='number'
            id={`${i}_upperLimit`}
            name={`${i}_upperLimit`}
            value={attr.upperLimit}
            onChange={(event: any) => {
              handleAttrUpperLimitChange(event, i);
            }}
            fullWidth
            autoComplete='off'
            InputProps={{ disableUnderline: true }}
          />
        </TableCell>
        <TableCell
          component='th'
          scope='row'
          align='center'
          className='tableCell'
        >
          <TextField
            type='string'
            id={`${i}_color`}
            name={`${i}_color`}
            value={attr.color}
            onClick={() => {
              openColorPicker(i);
            }}
            fullWidth
            autoComplete='off'
          />
          {displayColorPicker && displayColorRow === i ? (
            <div className={classes.popover}>
              <div className={classes.cover} onClick={closeColorPicker} />
              <ChromePicker
                onChange={(event: any) => {
                  handleAttrColorChange(event, i);
                }}
                color={attr.color}
                disableAlpha={true}
              />
            </div>
          ) : null}
        </TableCell>
        <TableCell
          component='th'
          scope='row'
          align='center'
          className='tableCell'
        >
          <div style={{ marginTop: '10px', cursor: 'pointer' }}>
            <IconButton
              className={classes.iconButton}
              size='small'
              onClick={() => {
                deleteLevelAttribute(i);
              }}
              disabled={i < 3}
            >
              <LightTooltip
                title='Delete this attribute'
                aria-label='delete this attribute'
              >
                <ClearIcon />
              </LightTooltip>
            </IconButton>
          </div>
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
      <Container maxWidth='lg' component='div' className='containerRoot'>
        <Backdrop className={classes.backdrop} open={backdropOpen}>
          <CircularProgress color='inherit' />
        </Backdrop>
        <div style={{ width: '100%' }}>
          <Grid container spacing={3}>
            <Grid item sm={12}>
              <Typography variant='h6'>
                <Text tid={`admin.settings.${props.objType}.name`} />
              </Typography>
            </Grid>
          </Grid>
        </div>
        <form className={classes.formContainer} noValidate autoComplete='off'>
          <Paper style={{ width: '100%', marginTop: '20px', padding: '10px' }}>
            <Grid item sm={12}>
              <Typography variant='h6' gutterBottom>
                <Text tid='scoreIndexSettings' />
              </Typography>
            </Grid>
            <Table className='table'>
              <TableHead className='tableHead'>
                <TableRow>
                  <TableCell className='tableHeadCell'>
                    <Typography className='tableHeadText'>
                      <Text tid='levelName' />
                    </Typography>
                  </TableCell>
                  <TableCell align='center' className='tableHeadCell'>
                    <Typography className='tableHeadText'>
                      <Text tid='lowerLimit' />
                    </Typography>
                  </TableCell>
                  <TableCell align='center' className='tableHeadCell'>
                    <Typography className='tableHeadText'>
                      <Text tid='upperLimit' />
                    </Typography>
                  </TableCell>
                  <TableCell align='center' className='tableHeadCell'>
                    <Typography className='tableHeadText'>
                      <Text tid='levelColor' />
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
                {resultAttributes.levels.map((el: any, i: number) =>
                  renderLevelAttribute(el, i)
                )}
              </TableBody>
              {resultAttributes.levels.length <= 3 && (
                <TableFooter>
                  <TableRow style={{ margin: '10px', cursor: 'pointer' }}>
                    <TableCell className='tableHeadCell'>
                      <Button
                        className={classes.iconButton}
                        startIcon={<AddIcon />}
                        size='small'
                        onClick={() => {
                          addLevelAttribute();
                        }}
                      >
                        <Text tid='addAnotherLevel' />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </Paper>
          <Paper style={{ width: '100%', marginTop: '20px', padding: '10px' }}>
            <Grid container alignItems='center'>
              <Grid item sm={12}>
                <Typography variant='h6' gutterBottom>
                  <Text tid='otherSettings' />
                </Typography>
              </Grid>
              <Grid item sm={6}>
                <InputLabel>
                  <Text tid='highlightInPerformanceMetrics' />
                </InputLabel>
              </Grid>
              <Grid item sm={6}>
                <TextField
                  type='number'
                  id={'cutoffNum'}
                  name={'cutoffNum'}
                  value={resultAttributes.performanceMetricsConstant}
                  onChange={(event: any) => {
                    handlePerformanceMetricsConstantChange(event);
                  }}
                  autoComplete='off'
                  InputProps={{ disableUnderline: true }}
                />
              </Grid>
              <Grid item sm={6}>
                <InputLabel>
                  <Text tid='archiveBeforeDays' />
                </InputLabel>
              </Grid>
              <Grid item sm={6}>
                <TextField
                  type='number'
                  id={'archiveNum'}
                  name={'archiveNum'}
                  value={resultAttributes.archiveDays}
                  onChange={(event: any) => {
                    handleArchiveDaysChange(event);
                  }}
                  autoComplete='off'
                  InputProps={{ disableUnderline: true }}
                />
              </Grid>
            </Grid>
          </Paper>
        </form>
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
        {/*<ModalComponent
              message="There might be users with values set for this attribute. Deleting the attribute will also permanently delete its values from all those users. Do you really want to Delete it?"
              openModal={openModal}
              handleModalYesClicked={modalYesClicked}
              handleModalNoClicked={modalNoClicked}/>*/}
      </Container>
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

export default withRouter(EditSettingsGeneralConfig);
