import React, { Fragment, useRef, useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Grid,
  Button,
  makeStyles,
  Theme,
  createStyles,
  TextField,
  InputAdornment,
  Input,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
  SnackbarContent,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ExpansionPanel,
  ExpansionPanelSummary,
  Typography,
  ExpansionPanelDetails,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Popper,
  Grow,
  ButtonGroup,
  Paper,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core';
import { default as MaterialLink } from '@material-ui/core/Link';
//import Switch from '@material-ui/core/Switch';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { buttonStyle } from '../../../common/common';
import { Http } from '../../../utils';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../reducers';
import { Loader } from '../..';
import {
  ITeamMetricsDetails,
  IMetricsTool,
  ICollectorConfigDetails,
  ICollectorConfig,
  IObjectConfigDetails,
  IServices,
} from '../../../model';
import { MANAGE_TEAMS } from '../../../pages/admin';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Success from '../../success-page';
import ClearIcon from '@material-ui/icons/Clear';
import CloseIcon from '@material-ui/icons/Close';
import { LightTooltip } from '../../common/tooltip';
import { ModalComponent } from '../../modal';
import { Text } from '../../../common/Language';
import '../../../css/assessments/style.css';
import './style.css';

import { MAX_SERVICE_HIERARCHY_LEVEL, OTHER_STRING } from '../create-team';

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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: 'auto',
      width: '100%',
      padding: '0 !important',
    },
    saveButton: {
      marginTop: '36px',
      position: 'relative',
      minWidth: '28%',
      ...buttonStyle,
    },
    backButton: {
      marginTop: '36px',
      position: 'relative',
      minWidth: '10%',
      marginRight: '20px',
      ...buttonStyle,
    },
    connectButton: {
      minWidth: '10%',
      float: 'right',
      marginBottom: '10px',
      ...buttonStyle,
    },
    formControl: {
      minWidth: '100%',
    },
    rootp: {
      width: '100%',
      padding: '10px'
    },
    extraBigColumn: {
      flexBasis: '70%',
    },
    mediumColumn: {
      flexBasis: '20%',
    },
    smallColumn: {
      flexBasis: '10%',
    },
    heading: {
      fontSize: theme.typography.pxToRem(20),
    },
    detailsNonHighlighted: {
      alignItems: 'center',
    },
    nonHighlighted: {
      color: 'inherit',
      backgroundColor: 'inherit',
    },
    noResultsContainer: {
      padding: '30px 0px',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    },
    title: {
      margin: '20px',
    },
    expansion: {
      margin: '5px',
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 2,
    },
    helpText: { fontSize: '12px', color: '#808080' },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
    },
    treeRoot: {
      margin: 'auto',
      width: '100%',
      padding: '0 !important',
    },
    indent: {
      margin: `0 0 0 ${theme.spacing(2)}px`,
      padding: '0 !important',
    },
    serviceListIcon: {
      minWidth: '25px',
    },
    serviceListItem: {
      padding: '0 6px !important',
    },
  })
);

interface connState {
  myConns: string[];
  childConns: connState[];
}

const MapMetricsTools = (props: any) => {
  const classes = useStyles();
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [teamMetricsTools, setTeamMetricsTools] = useState<ITeamMetricsDetails>(
    { config: {}, orgId: '', metrics: [], services: [], teamId: '', teamName: '' }
  );
  const [listSettings, setListSettings] = useState<{ [i: string]: boolean }>({});
  const [fetchedData, setFetchedData] = useState(false);
  const [failure, setFailure] = useState(false);
  const [failureMessage, setFailureMessage] = useState(
    <Text tid='somethingWentWrong' />
  );
  const [dataPosted, setDataPosted] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [deleteToolIndex, setDeleteToolIndex] = useState(-1);
  const [openToggle, setOpenToggle] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState({
    password: '',
    showPassword: false,
  });
  const [connectionState, setConnectionState] = useState<{ [key: string]: string[] }>({});
  const [selectedTreePath, setSelectedTreePath] = useState<number[]>([]);
  const [userNote, setUserNote] = useState('');
  const [selecedToolIndex, setSelectedToolIndex] = useState(-1);
  let msgFailure = failureMessage;
  let msgSuccess = <Text tid='teamDetailsUpdatedSuccessfully' />;

  useEffect(() => {
    fetchTeamMetricsDetails();
  }, []);

  const fetchTeamMetricsDetails = () => {
    Http.get({
      url: `/api/metrics/team/${props.teamId} `,
      state: stateVariable,
    })
      .then((response: any) => {
        let responseSorted: ITeamMetricsDetails = response;
        responseSorted.config = sortAllConfigAttributes(responseSorted);
        if (responseSorted.metrics) {
          responseSorted.metrics = responseSorted.metrics.map((tool: IMetricsTool) => sortToolsAttributes(tool, responseSorted.config));
        }
        if (responseSorted.services) {
          responseSorted.services = sortServiceMetricsToolAttributes(responseSorted.services, responseSorted.config);
        }

        setTeamMetricsTools(responseSorted);
        initializeListSettings(responseSorted.config);
        setConnectionState(initializeConnectionState(responseSorted.metrics, responseSorted.services, []));
        setFetchedData(true);
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
      });
  };

  function sortAllConfigAttributes(
    metricsDetails: ITeamMetricsDetails
  ): ICollectorConfigDetails {
    Object.keys(metricsDetails.config).forEach((key: string) => {
      metricsDetails.config[key].forEach(
        (toolConfig: ICollectorConfig, index: number) => {
          const toolConfigAttrSorted: any = {};
          const toolConfigAttrKeysSorted = Object.keys(
            toolConfig.attributes
          ).sort((a: any, b: any) => {
            if (
              toolConfig.attributes[a].position &&
              toolConfig.attributes[b].position &&
              toolConfig.attributes[a].position! >
              toolConfig.attributes[b].position!
            ) {
              return 1;
            } else if (
              toolConfig.attributes[a].position &&
              toolConfig.attributes[b].position &&
              toolConfig.attributes[a].position! <
              toolConfig.attributes[b].position!
            ) {
              return -1;
            } else {
              return toolConfig.attributes[a].displayName.toLowerCase() >
                toolConfig.attributes[a].displayName.toLowerCase()
                ? 1
                : -1;
            }
          });
          toolConfigAttrKeysSorted.forEach((el: string) => {
            toolConfigAttrSorted[el] = toolConfig.attributes[el];
          });
          metricsDetails.config[key][index].attributes = toolConfigAttrSorted;
        }
      );
    });
    return metricsDetails.config;
  }

  function sortServiceMetricsToolAttributes(services: IServices[], config: ICollectorConfigDetails): IServices[] {
    services.forEach((service: IServices, serviceIndex: number) => {
      if (service.metrics) {
        service.metrics = service.metrics.map((tool: IMetricsTool) => sortToolsAttributes(tool, config));
      }
      if (service.services) {
        service.services = sortServiceMetricsToolAttributes(service.services, config);
      }
    });

    return services;
  }

  function sortToolsAttributes(tool: IMetricsTool, config: ICollectorConfigDetails): IMetricsTool {
    let collector: any = {};
    for (let i = 0; i < config[tool.toolType].length; i++) {
      if (config[tool.toolType][i].name === tool.toolName) {
        collector = config[tool.toolType][i];
      }
    }
    const toolAttrSorted: IMetricsTool = {
      enabled: tool.enabled,
      toolName: tool.toolName,
      toolType: tool.toolType,
    };
    Object.keys(collector.attributes).forEach((key: string) => {
      toolAttrSorted[key] = tool[key] || {};
      if ((!tool[key] || !tool[key].value) && collector.attributes[key].mandatory) {
        toolAttrSorted[key].value = collector.attributes[key].defaultValue ?
          collector.attributes[key].defaultValue :
          collector.attributes[key].type === 'multi-list' ? [] : '';

        if (
          collector.attributes[key].type === 'list' ||
          collector.attributes[key].type === 'list-no-others' ||
          collector.attributes[key].type === 'multi-list'
        ) {
          if (!toolAttrSorted[key].options) {
            toolAttrSorted[key].options = {};
          }
          if (collector.attributes[key].defaultValue &&
            !Object.keys(toolAttrSorted[key].options).includes(collector.attributes[key].defaultValue)
          ) {
            toolAttrSorted[key].options[collector.attributes[key].defaultValue] = collector.attributes[key].defaultValue;
          }
        }
      }
    });
    return toolAttrSorted;
  }

  const initializeListSettings = (colConfig: ICollectorConfigDetails) => {
    const tempSettings: { [i: string]: boolean } = {};
    Object.keys(colConfig).forEach(
      (key: string) => (tempSettings[key] = false)
    );
    setListSettings(tempSettings);
  };

  const initializeConnectionState = (
    metrics: IMetricsTool[],
    services: IServices[],
    indexPath: number[]
  ): { [i: string]: string[] } => {

    let myConnState: { [i: string]: string[] } = {};
    const key = `[${indexPath.toString()}]`;
    myConnState[key] = [];

    if (metrics) {
      metrics.forEach((tool: IMetricsTool) => myConnState[key].push(''));
    }

    if (services) {
      services.forEach((service: IServices, index: number) => {
        const childConnState: { [i: string]: string[] } = initializeConnectionState(service.metrics, service.services, [...indexPath, index]);
        myConnState = { ...myConnState, ...childConnState };
      });
    }

    return myConnState;
  }

  const handleSave = () => {
    if (validateDataBeforeSave(teamMetricsTools) === 0) {
      const modifiedteamMetrics = stripOptions(teamMetricsTools);
      Http.post({
        url: `/api/metrics/team`,
        body: {
          orgId: teamMetricsTools.orgId,
          teamId: teamMetricsTools.teamId,
          services: modifiedteamMetrics.services,
          metrics: modifiedteamMetrics.metrics,
        },
        state: stateVariable,
      })
        .then((response: any) => {
          setDataPosted(true);
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

  function stripOptions(teamOrService: any): any {
    const newMetrics: IMetricsTool[] = [];
    if (teamOrService.metrics) {
      teamOrService.metrics.forEach((tool: IMetricsTool) => {
        let collector: any = {};
        for (let i = 0; i < teamMetricsTools.config[tool.toolType].length; i++) {
          if (teamMetricsTools.config[tool.toolType][i].name === tool.toolName) {
            collector = teamMetricsTools.config[tool.toolType][i];
          }
        }
        const newTool: IMetricsTool = { ...tool };
        Object.keys(tool).forEach((key: string) => {
          if (key !== 'toolName' && key !== 'toolType' && key !== 'enabled') {
            newTool[key] = {};
            newTool[key].value = tool[key].value;
            if (tool[key].options) {
              newTool[key].options = {};
              if (collector.attributes[key].type === 'multi-list') {
                if (tool[key].value) {
                  tool[key].value.forEach((val: string) => {
                    newTool[key].options[val] = tool[key].options[val];
                  });
                }
              } else {
                if (tool[key].value && (tool[key].value !== '')) {
                  newTool[key].options[tool[key].value] = tool[key].options[tool[key].value];
                }
              }
            }
          }
        });
        newMetrics.push(newTool);
      });
    }
    const newServices: IServices[] = [];
    if (teamOrService.services) {
      teamOrService.services.forEach((service: IServices) => {
        const newService: IServices = { ...service };
        const tempService = stripOptions(service);
        newService.metrics = tempService.metrics;
        newService.services = tempService.services;

        newServices.push(newService);
      });
    }

    return { metrics: newMetrics, services: newServices };
  }

  function validateDataBeforeSave(teamOrService: any): number {
    //Check for all the mandatory fields for all tools are being set.
    let errorCount = 0;

    if (teamOrService.metrics) {
      teamOrService.metrics.forEach((tool: IMetricsTool) => {
        let collector: any = {};
        for (let i = 0; i < teamMetricsTools.config[tool.toolType].length; i++) {
          if (teamMetricsTools.config[tool.toolType][i].name === tool.toolName) {
            collector = teamMetricsTools.config[tool.toolType][i];
          }
        }
        Object.keys(tool).forEach((key: string) => {
          if (key !== 'toolName' && key !== 'toolType' && key !== 'enabled') {
            if (collector.attributes[key].mandatory &&
              (!tool[key] || !tool[key].value ||
                (collector.attributes[key].type === 'multi-list' && tool[key].value.length === 0) ||
                (collector.attributes[key].type !== 'multi-list' && tool[key].value === ''))) {
              setFailureMessage(
                <Text tid='collector.tool.mandatory.fields.check' />
              );
              setFailure(true);
              errorCount += 1;
            }
          }
        });
      });
    }

    if (teamOrService.services) {
      teamOrService.services.forEach((service: IServices) => {
        errorCount += validateDataBeforeSave(service);
      });
    }

    return errorCount;
  }

  function validateDataBeforeConnect(tool: IMetricsTool): number {
    let errorCount = 0;

    let collector: any = {};
    for (let i = 0; i < teamMetricsTools.config[tool.toolType].length; i++) {
      if (teamMetricsTools.config[tool.toolType][i].name === tool.toolName) {
        collector = teamMetricsTools.config[tool.toolType][i];
      }
    }
    Object.keys(tool).forEach((key: string) => {
      //      if (key !== 'toolName' && key !== 'toolType' && key !== 'enabled') {
      //        if ((collector.attributes[key].type === 'string' || collector.attributes[key].type === 'password') &&
      //            (!tool[key] || !tool[key].value || tool[key].value === '')) {
      if (key === 'url' || key === 'userName' || key === 'password' || key === 'email' || key === 'appToken') {
        if ((!tool[key] || !tool[key].value || tool[key].value === '')) {
          setFailureMessage(
            <Text tid='server.athentication.details.check' />
          );
          setFailure(true);
          errorCount += 1;
        }
      }
    });

    return errorCount;
  }

  const handleConnect = (tool: IMetricsTool, toolIndex: number) => {
    if (validateDataBeforeConnect(tool) === 0) {
      const tempState = { ...connectionState };
      const key = `[${selectedTreePath.toString()}]`;
      tempState[key][toolIndex] = 'fetching';
      setConnectionState(tempState);
      Http.post({
        url: `/api/metrics/connect`,
        body: {
          tool: tool,
        },
        state: stateVariable,
      })
        .then((response: any) => {
          if (response.connect) {
            tempState[key][toolIndex] = 'success';
            setConnectionState(tempState);

            const temp: ITeamMetricsDetails = { ...teamMetricsTools };
            let teamOrService: any = temp;
            for (let i: number = 0; i < selectedTreePath.length; i++) {
              if (teamOrService && teamOrService.services) {
                teamOrService = teamOrService.services[selectedTreePath[i]];
              }
            }
            teamOrService.metrics[toolIndex] = sortToolsAttributes(
              response.tool,
              teamMetricsTools.config
            );
            setTeamMetricsTools(temp);
          } else {
            tempState[key][toolIndex] = 'failed';
            setConnectionState(tempState);
            setFailureMessage(
              <Text tid='server.connection.failed' />
            );
            setFailure(true);
          }
        })
        .catch((error) => {
          tempState[key][toolIndex] = 'failed';
          setConnectionState(tempState);

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

  const handleOpenDialog = () => {
    fetch('/metricsConfigurationHelp.txt')
      .then((note) => {
        note.text()
          .then(text => {
            setUserNote(text);
            setOpenDialog(true);
          })
      })
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseSnackbar = () => {
    setFailure(false);
  };

  const handleBackButton = () => {
    props.goBack(MANAGE_TEAMS);
  };

  const modalNoClicked = () => {
    setDeleteToolIndex(-1);
    setOpenModal(false);
  };

  const modalYesClicked = () => {
    setOpenModal(false);
    deleteMetricsTool();
  };

  const handleAddButtonClick = () => {
    initializeListSettings(teamMetricsTools.config);
    setOpenToggle((prevOpen) => !prevOpen);
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event: any) => {
    event.preventDefault();
  };

  const prevOpen = React.useRef(openToggle);
  React.useEffect(() => {
    if (prevOpen.current === true && openToggle === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = openToggle;
  }, [openToggle]);

  const handleChangeValue = (event: any, toolIndex: number, attrKey: string) => {
    const temp: ITeamMetricsDetails = { ...teamMetricsTools };
    let teamOrService: any = temp;
    for (let i: number = 0; i < selectedTreePath.length; i++) {
      if (teamOrService && teamOrService.services) {
        teamOrService = teamOrService.services[selectedTreePath[i]];
      }
    }

    if (teamOrService) {
      teamOrService.metrics[toolIndex][attrKey].value = event.target.value;
      setTeamMetricsTools(temp);
    }
  };

  const handleChangeMultiValue = (event: any, toolIndex: number, attrKey: string) => {
    const temp: ITeamMetricsDetails = { ...teamMetricsTools };
    let teamOrService: any = temp;
    for (let i: number = 0; i < selectedTreePath.length; i++) {
      if (teamOrService && teamOrService.services) {
        teamOrService = teamOrService.services[selectedTreePath[i]];
      }
    }

    if (teamOrService) {
      let valueArray = teamOrService.metrics[toolIndex][attrKey].value || [];
      valueArray = [...event.target.value];
      teamOrService.metrics[toolIndex][attrKey].value = valueArray;
      setTeamMetricsTools(temp);
    }
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

  const handleEnabledChange = (event: any, toolIndex: number) => {
    event.stopPropagation();
    const temp: ITeamMetricsDetails = { ...teamMetricsTools };
    let teamOrService: any = temp;
    for (let i: number = 0; i < selectedTreePath.length; i++) {
      if (teamOrService && teamOrService.services) {
        teamOrService = teamOrService.services[selectedTreePath[i]];
      }
    }

    if (teamOrService) {
      teamOrService.metrics[toolIndex].enabled = !teamOrService.metrics[toolIndex].enabled;
      setTeamMetricsTools(temp);
    }
  }

  const confirmAndDeleteTool = (event: any, toolIndex: number) => {
    event.stopPropagation();
    setDeleteToolIndex(toolIndex);
    setOpenModal(true);
  };

  const deleteMetricsTool = () => {
    if (deleteToolIndex >= 0) {
      const temp: ITeamMetricsDetails = { ...teamMetricsTools };
      let teamOrService: any = temp;
      for (let i: number = 0; i < selectedTreePath.length; i++) {
        if (teamOrService && teamOrService.services) {
          teamOrService = teamOrService.services[selectedTreePath[i]];
        }
      }

      if (teamOrService) {
        teamOrService.metrics.splice(deleteToolIndex, 1);
        setTeamMetricsTools(temp);
      }

      const tempState = { ...connectionState };
      const key = `[${selectedTreePath.toString()}]`;
      tempState[key].splice(deleteToolIndex, 1);
      setConnectionState(tempState);
    }
  };

  const changeListSettings = (id: string) => {
    const tempSettings: { [i: string]: boolean } = { ...listSettings };
    tempSettings[id] = !tempSettings[id];
    setListSettings(tempSettings);
  };

  const handleAddMetricsSelect = (colType: string, colName: string) => {
    setSelectedToolIndex(0)
    let collectorAttrs: IObjectConfigDetails = {};
    for (let i = 0; i < teamMetricsTools.config[colType].length; i++) {
      if (teamMetricsTools.config[colType][i].name === colName) {
        collectorAttrs = teamMetricsTools.config[colType][i].attributes;
      }
    }

    const newTool: IMetricsTool = { toolName: colName, toolType: colType, enabled: true };
    const attrKeys = Object.keys(collectorAttrs);
    for (let i = 0; i < attrKeys.length; i++) {
      newTool[attrKeys[i]] = {};
      if (
        collectorAttrs[attrKeys[i]].type === 'list' ||
        collectorAttrs[attrKeys[i]].type === 'list-no-others' ||
        collectorAttrs[attrKeys[i]].type === 'multi-list'
      ) {
        newTool[attrKeys[i]].options = {};
        newTool[attrKeys[i]].value = collectorAttrs[attrKeys[i]].type === 'multi-list' ? [] : '';
      } else {
        newTool[attrKeys[i]].value = collectorAttrs[attrKeys[i]].defaultValue ? collectorAttrs[attrKeys[i]].defaultValue : '';
      }
    }

    const temp: ITeamMetricsDetails = { ...teamMetricsTools };
    let teamOrService: any = temp;
    for (let i: number = 0; i < selectedTreePath.length; i++) {
      if (teamOrService && teamOrService.services) {
        teamOrService = teamOrService.services[selectedTreePath[i]];
      }
    }

    if (teamOrService) {
      if (!teamOrService.metrics) {
        teamOrService.metrics = [];
      }
      teamOrService.metrics.unshift(newTool);
      setTeamMetricsTools(temp);
    }

    const tempState = { ...connectionState };
    const key = `[${selectedTreePath.toString()}]`;
    if (!tempState[key]) {
      tempState[key] = [];
    }
    tempState[key].push('');
    setConnectionState(tempState);
    setOpenToggle(false);
  };

  const renderNoResultsFound = () => {
    return (
      <div className={classes.noResultsContainer}>
        <Text tid='noToolsAreMapped' />
      </div>
    );
  };

  const renderAttribute = (tool: IMetricsTool, attrKey: string, toolIndex: number) => {
    console.log(tool, attrKey, toolIndex);
    let collectorAttr: any = {};
    for (let i = 0; i < teamMetricsTools.config[tool.toolType].length; i++) {
      if (teamMetricsTools.config[tool.toolType][i].name === tool.toolName) {
        collectorAttr =
          teamMetricsTools.config[tool.toolType][i].attributes[attrKey];
      }
    }
    switch (collectorAttr.type) {
      case 'string':
        return (
          <Fragment>
            <TextField
              required={collectorAttr.mandatory}
              type='string'
              id={`field_${toolIndex}_${attrKey}`}
              name={`field_${toolIndex}_${attrKey}`}
              value={tool[attrKey].value ? tool[attrKey].value : ''}
              label={collectorAttr.displayName}
              onChange={(event: any) =>
                handleChangeValue(event, toolIndex, attrKey)
              }
              fullWidth
              autoComplete='off'
              className='textFieldStyle'
            />
            <Typography
              key={`help_${toolIndex}_${attrKey}`}
              className={classes.helpText}
            >
              {collectorAttr.helpText
                ? collectorAttr.helpText
                : ''}
            </Typography>
          </Fragment>
        );
      case 'number':
        return (
          <Fragment>
            <div className='numberInput'>
              <TextField
                required={collectorAttr.mandatory}
                type='number'
                id={`field_${toolIndex}_${attrKey}`}
                name={`field_${toolIndex}_${attrKey}`}
                value={tool[attrKey].value ? tool[attrKey].value : ''}
                label={collectorAttr.displayName}
                onChange={(event: any) =>
                  handleChangeValue(event, toolIndex, attrKey)
                }
                fullWidth
                autoComplete='off'
                InputProps={{ disableUnderline: true }}
                className='textFieldStyle'
              />
            </div>
            <Typography
              key={`help_${toolIndex}_${attrKey}`}
              className={classes.helpText}
            >
              {collectorAttr.helpText
                ? collectorAttr.helpText
                : ''}
            </Typography>
          </Fragment>
        );
      case 'password':
        return (
          <Fragment>
            <TextField
              required={collectorAttr.mandatory}
              type={values.showPassword ? 'text' : 'password'}
              id={`field_${toolIndex}_${attrKey}`}
              name={`field_${toolIndex}_${attrKey}`}
              value={tool[attrKey].value ? tool[attrKey].value : ''}
              label={collectorAttr.displayName}
              onChange={(event: any) =>
                handleChangeValue(event, toolIndex, attrKey)
              }
              fullWidth
              autoComplete='off'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      aria-label='toggle password visibility'
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                    >
                      {values.showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
                disableUnderline: true,
              }}
              className='textFieldStyle'
            />
            <Typography
              key={`help_${toolIndex}_${attrKey}`}
              className={classes.helpText}
            >
              {collectorAttr.helpText
                ? collectorAttr.helpText
                : ''}
            </Typography>
          </Fragment>
        );
      case 'list':
      case 'list-no-others':
        return (
          <Fragment>
            <FormControl className={classes.formControl}>
              <InputLabel
                id='demo-simple-select-label'
                required={collectorAttr.mandatory}
              >
                {collectorAttr.displayName}
              </InputLabel>
              <Select
                id={`field_${toolIndex}_${attrKey}`}
                name={`field_${toolIndex}_${attrKey}`}
                value={tool[attrKey].value ? tool[attrKey].value : ''}
                onChange={(event: any) =>
                  handleChangeValue(event, toolIndex, attrKey)
                }
              >
                {
                  (collectorAttr.options && collectorAttr.options.custom !== undefined) ?
                    (collectorAttr.options.custom.split(',').map((opt: string) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))) :
                    (tool[attrKey].options &&
                      Object.keys(tool[attrKey].options).map((opt: string) => (
                        <MenuItem key={opt} value={opt}>
                          {tool[attrKey].options[opt]}
                        </MenuItem>
                      )))
                }
              </Select>
            </FormControl>
            <Typography
              key={`help_${toolIndex}_${attrKey}`}
              className={classes.helpText}
            >
              {collectorAttr.helpText
                ? collectorAttr.helpText
                : ''}
            </Typography>
          </Fragment>
        );
      case 'multi-list':
        return (
          <Fragment>
            <FormControl className={classes.formControl}>
              <InputLabel
                id='demo-mutiple-chip-label'
                required={collectorAttr.mandatory}
              >
                {collectorAttr.displayName}
              </InputLabel>
              <Select
                id={`field_${toolIndex}_${attrKey}`}
                name={`field_${toolIndex}_${attrKey}`}
                multiple
                value={tool[attrKey].value ? tool[attrKey].value : []}
                onChange={(event: any) =>
                  handleChangeMultiValue(event, toolIndex, attrKey)
                }
                input={<Input id='select-multiple-chip' />}
                renderValue={renderChips}
                MenuProps={MenuProps}
              >
                {
                (collectorAttr.options && collectorAttr.options.custom !== undefined) ?
                (collectorAttr.options.custom.split(',').map((opt: string) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))) :
                (tool[attrKey].options &&
                  Object.keys(tool[attrKey].options).map((opt: string) => (
                    <MenuItem key={opt} value={opt}>
                      {tool[attrKey].options[opt]}
                    </MenuItem>
                  )))
                }
              </Select>
            </FormControl>
            <Typography
              key={`help_${toolIndex}_${attrKey}`}
              className={classes.helpText}
            >
              {collectorAttr.helpText
                ? collectorAttr.helpText
                : ''}
            </Typography>
          </Fragment>
        );
    }
  };

  const renderMetricsToolDetails = (tool: IMetricsTool, toolIndex: number) => {
    console.log(tool, toolIndex)
    return (
      <ExpansionPanel className={classes.expansion} expanded={toolIndex === selecedToolIndex} onChange={() => setSelectedToolIndex(toolIndex === selecedToolIndex ? -1 : toolIndex)}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='panel1c-content'
          id='panel1c-header'
          className={classes.nonHighlighted}
        >
          <div
            className={classes.smallColumn}
            style={{
              marginTop: '10px',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <LightTooltip
              title={<Text tid='detachCollector' />}
              aria-label='detach this collector'
            >
              <IconButton
                size='small'
                onClick={(event: any) => confirmAndDeleteTool(event, toolIndex)}
              >
                <ClearIcon />
              </IconButton>
            </LightTooltip>
          </div>
          <div className={classes.extraBigColumn} style={{ marginTop: '10px' }}>
            <Typography className={classes.heading}>{tool.toolName}</Typography>
          </div>
          <div className={classes.mediumColumn} style={{ marginTop: '10px' }}>
            <FormControlLabel
              style={{ paddingLeft: '36px' }}
              control={
                <Checkbox
                  checked={tool.enabled}
                  onChange={(event: any) => handleEnabledChange(event, toolIndex)}
                  value='true'
                  color="secondary"
                />
              }
              label={'Enabled'}
            />
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.detailsNonHighlighted}>
          <div style={{ display: 'block', width: '100%' }}>
            <Button
              className={classes.connectButton}
              variant='outlined'
              onClick={(event: any) => handleConnect(tool, toolIndex)}
            >
              <Text tid='connectServer' />
            </Button>
            {connectionState[`[${selectedTreePath.toString()}]`][toolIndex] === 'fetching' && (
              <Loader label='Connecting...' />
            )}
            {connectionState[`[${selectedTreePath.toString()}]`][toolIndex] === 'success' && (
              <Typography variant='h5' color='primary'>
                <Text tid='connectedSuccessfully' />
              </Typography>
            )}
            {connectionState[`[${selectedTreePath.toString()}]`][toolIndex] === 'failed' && (
              <Typography variant='h5' color='secondary'>
                <Text tid='connectionFailed' />
              </Typography>
            )}
            {Object.keys(tool).map((attrKey: string, i: number) =>
              attrKey !== 'toolName' && attrKey !== 'toolType' && attrKey !== 'enabled' ? (
                <div style={{ padding: '8px 5px' }} key={i}>
                  {renderAttribute(tool, attrKey, toolIndex)}
                </div>
              ) : (
                ''
              )
            )}
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  };

  const renderTeamSearviceTree = () => {
    return (
      <Paper>
        <Typography variant='h6' color='primary' style={{ padding: '4px 8px' }}>
          <Text tid='teamAndServices' />
        </Typography>
        <List className={classes.treeRoot}>
          <ListItem
            disableGutters={true}
            className={classes.serviceListItem}
            button
            key={`item_${teamMetricsTools.teamId}`}
            selected={selectedTreePath.length === 0}
            onClick={() => {
              setSelectedTreePath([])
              setSelectedToolIndex(-1)
            }}
          >
            <ListItemIcon
              className={classes.serviceListIcon}
              style={teamMetricsTools.services && (teamMetricsTools.services.length > 0) ? { visibility: 'visible' } : { visibility: 'hidden' }}
            >
              <ExpandMoreIcon />
            </ListItemIcon>
            <ListItemText primary={teamMetricsTools.teamName} />
          </ListItem>
          {teamMetricsTools.services && (teamMetricsTools.services.length > 0) ?
            teamMetricsTools.services.map((service, index) => {
              return (renderServiceTree(service, [index]))
            })
            : (<div />)
          }
        </List>
      </Paper>
    );
  };

  const renderServiceTree = (service: IServices, indexPath: number[]) => {
    return (
      <List className={classes.indent}>
        <ListItem
          disableGutters={true}
          className={classes.serviceListItem}
          button
          key={`item_${service.id}`}
          selected={indexPath.toString() === selectedTreePath.toString()}
          onClick={() => {
            setSelectedTreePath(indexPath)
            setSelectedToolIndex(-1)
          }}
        >
          <ListItemIcon
            className={classes.serviceListIcon}
            style={service.services && (service.services.length > 0) ? { visibility: 'visible' } : { visibility: 'hidden' }}
          >
            <ExpandMoreIcon />
          </ListItemIcon>
          <ListItemText primary={service.name} />
        </ListItem>
        {service.services && (service.services.length > 0) ?
          service.services.map((service, index) => {
            return (renderServiceTree(service, [...indexPath, index]))
          })
          : (<div />)
        }
      </List>
    );
  };

  const renderMetricsTools = () => {
    const temp: ITeamMetricsDetails = { ...teamMetricsTools };
    let teamOrService: any = temp;
    for (let i: number = 0; i < selectedTreePath.length; i++) {
      if (teamOrService && teamOrService.services) {
        teamOrService = teamOrService.services[selectedTreePath[i]];
      }
    }

    return teamOrService ?
      (teamOrService.metrics && (teamOrService.metrics.length > 0) ?
        (teamOrService.metrics.map((tool: IMetricsTool, i: number) => {
          return (
            <div key={i} className={classes.rootp}>
              {renderMetricsToolDetails(tool, i)}
            </div>
          );
        })
        )
        :
        renderNoResultsFound()
      )
      :
      (<div />)
  }

  const renderMetricsConfigurationArea = () => {
    return (
      <Paper>
        <div style={{ width: '100%' }} className={classes.root}>
          <ButtonGroup
            variant='contained'
            color='primary'
            ref={anchorRef}
            aria-label='split button'
            className={classes.title}
          >
            <Button
              color='primary'
              aria-controls={openToggle ? 'split-button-menu' : undefined}
              aria-expanded={openToggle ? 'true' : undefined}
              aria-label='select merge strategy'
              aria-haspopup='menu'
              onClick={handleAddButtonClick}
              endIcon={
                openToggle ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
              }
            >
              <Text tid='attachCollectors' />
            </Button>
          </ButtonGroup>
          <MaterialLink
            href='#'
            onClick={handleOpenDialog}
          >
            <Typography style={{ display: 'inline', float: 'right', padding: '25px' }}>
              <Text tid='metricsConfigureHelp' />
            </Typography>
          </MaterialLink>
          <Popper
            open={openToggle}
            anchorEl={anchorRef.current}
            role={undefined}
            placement={'bottom-start'}
            transition
          >
            {({ TransitionProps }) => (
              <Grow {...TransitionProps}>
                <Paper style={{ width: '133%' }}>
                  <List style={{ color: '#000' }}>
                    {Object.keys(teamMetricsTools.config).map(
                      (colKey: string) => (
                        <Fragment key={colKey}>
                          <ListItem
                            button
                            onClick={() => changeListSettings(colKey)}
                            style={{ textAlign: 'left' }}
                          >
                            <ListItemText inset primary={colKey} />
                            {listSettings[colKey] ? (
                              <ArrowDropUpIcon />
                            ) : (
                              <ArrowDropDownIcon />
                            )}
                          </ListItem>
                          <Collapse
                            in={listSettings[colKey]}
                            timeout='auto'
                            unmountOnExit
                          >
                            <List
                              disablePadding
                              style={{ fontSize: '8px' }}
                            >
                              {teamMetricsTools.config[colKey].map(
                                (
                                  collector: ICollectorConfig,
                                  colIndex: number
                                ) => (
                                  <ListItem
                                    key={colIndex}
                                    button
                                    onClick={() =>
                                      handleAddMetricsSelect(colKey, collector.name)
                                    }
                                    style={{ fontSize: '8px' }}
                                  >
                                    <ListItemText
                                      inset
                                      primary={collector.name}
                                      style={{
                                        fontSize: '8px',
                                        marginLeft: '8px',
                                      }}
                                    />
                                  </ListItem>
                                )
                              )}
                            </List>
                          </Collapse>
                          <Divider />
                        </Fragment>
                      )
                    )}
                  </List>
                </Paper>
              </Grow>
            )}
          </Popper>
          {renderMetricsTools()}
        </div>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={failure}
          onClose={handleCloseSnackbar}
          autoHideDuration={9000}
        >
          <SnackbarContent
            style={{ backgroundColor: '#dd0000' }}
            message={msgFailure}
          />
        </Snackbar>
        <ModalComponent
          message={'metricsToolPermanentDeletionWarning'}
          openModal={openModal}
          handleModalYesClicked={modalYesClicked}
          handleModalNoClicked={modalNoClicked}
        />
      </Paper>
    );
  }

  const renderMetricsConfigurationPage = () => {
    if (dataPosted) {
      return (
        <Fragment>
          <Success message={msgSuccess} />
          <div className='bottomButtonsContainer'>
            <Button
              className={classes.backButton}
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
      <Grid container spacing={3}>
        <Grid item xs={4}>
          {renderTeamSearviceTree()}
          <div className='bottomButtonsContainer'>
            <Button
              className={classes.backButton}
              variant='outlined'
              onClick={handleBackButton}
            >
              <Text tid='goBack' />
            </Button>
            <Button
              className={classes.saveButton}
              onClick={handleSave}
              variant='outlined'
            >
              <Text tid='save' />
            </Button>
          </div>
        </Grid>
        <Grid item xs={8}>
          {renderMetricsConfigurationArea()}
          <Dialog
            fullWidth={true}
            maxWidth='xl'
            onClose={handleCloseDialog} aria-labelledby="simple-dialog-title" open={openDialog}>
            <DialogTitle id="simple-dialog-title">
              <Text tid='metricsConfigureHelp' />
              <IconButton aria-label="close" className={classes.closeButton} onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <div dangerouslySetInnerHTML={{ __html: userNote }} />
            </DialogContent>
          </Dialog>
        </Grid>
      </Grid>
    );
  };

  return (
    <Fragment>
      {
        fetchedData ? (
          renderMetricsConfigurationPage()
        ) : (
          <Container style={{ textAlign: 'center' }}>
            <Loader />
          </Container>
        )}
    </Fragment>
  );
};

export default withRouter(MapMetricsTools);
