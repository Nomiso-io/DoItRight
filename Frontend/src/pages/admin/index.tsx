import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import { Redirect } from 'react-router';
import clsx from 'clsx';
import {
  makeStyles,
  Drawer,
  CssBaseline,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  AppBar,
  Toolbar,
  Tooltip,
  Container,
  Grid,
} from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DashboardIcon from '@material-ui/icons/Dashboard';
import MenuIcon from '@material-ui/icons/Menu';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline';
import GroupIcon from '@material-ui/icons/Group';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import AssignmentIcon from '@material-ui/icons/Assignment';
import AssignmentOutlinedIcon from '@material-ui/icons/AssignmentOutlined';
import BallotIcon from '@material-ui/icons/Ballot';
import BallotOutlinedIcon from '@material-ui/icons/BallotOutlined';
import FeedbackIcon from '@material-ui/icons/Feedback';
import SettingsIcon from '@material-ui/icons/Settings';
import {
  useActions,
  setAppBarCenterText,
  setAppBarLeftText,
} from '../../actions';
import Dashboard from '../../components/admin/dashboard';
import CreateUser from '../../components/admin/create-user';
import ManageUsers from '../../components/admin/manage-users';
import EditUser from '../../components/admin/manage-users/edit-user';
import { CreateTeam /*, Feedback*/ } from '../../components';
import ManageTeams from '../../components/admin/manage-teams';
import EditTeam from '../../components/admin/manage-teams/edit-teams';
import AssignAssessment from '../../components/admin/assign-assessment';
import MapMetricsTools from '../../components/admin/map-metrics-tools';
import CreateQuestionnaire from '../../components/admin/questionnaire/create-questionnaire';
import ManageAssessments from '../../components/admin/questionnaire/manage-questionnaire';
import EditAssessment from '../../components/admin/questionnaire/manage-questionnaire/editQuestionnaire';
import CreateQuestion, {
  IQuestionDetails,
} from '../../components/admin/create-question';
import ManageQuestion from '../../components/admin/manage-question';
import EditQuestion from '../../components/admin/manage-question/edit-question';
import AdminFeedback from '../../components/admin/feedback';
import ManageSettings from '../../components/admin/manage-settings';
import EditSettingsObjectConfig from '../../components/admin/manage-settings/configure-objects';
import EditSettingsGeneralConfig from '../../components/admin/manage-settings/configure-general';
import EditSettingsCollectorConfig from '../../components/admin/manage-settings/configure-collector';
import { Text } from '../../common/Language';
import './style.css';

export const ADMIN_HOME = 'admin-home';
export const DASHBOARD = 'dashboard';
export const CREATE_USER = 'create-user';
export const MANAGE_USERS = 'manageUsers';
export const EDIT_USER = 'edit-user';
export const CREATE_TEAM = 'create-team';
export const MANAGE_TEAMS = 'manageTeams';
export const EDIT_TEAM = 'edit-team';
export const ASSIGN_ASSESSMENT = 'assign-assessment';
export const MAP_METRICS_TOOLS = 'map-metrics-tools';
export const CREATE_QUESTIONNAIRE = 'create-questionnaire';
export const MANAGE_QUESTIONNAIRES = 'manageQuestionnaire';
export const EDIT_QUESTIONNAIRE = 'edit-assessment';
export const CREATE_QUESTION = 'create-question';
export const MANAGE_QUESTION = 'manageQuestions';
export const EDIT_QUESTION = 'edit-question';
export const FEEDBACK = 'feedback';
export const MANAGE_SETTINGS = 'manage-settings';
export const EDIT_SETTINGS_USER_CONFIG = 'UserConfig';
export const EDIT_SETTINGS_TEAM_CONFIG = 'TeamConfig';
export const EDIT_SETTINGS_SERVICE_CONFIG = 'ServiceConfig';
export const EDIT_SETTINGS_GENERAL_CONFIG = 'GeneralConfig';
export const EDIT_SETTINGS_COLLECTOR_CONFIG = 'CollectorConfig';
const drawerWidth = 220;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    // ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    // marginRight: theme.spacing(2),
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
    fontSize: '16px',
  },
  drawerPaper: {
    position: 'fixed',
    top: 50,
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(7),
    },
  },
  appBarSpacer: {
    marginTop: '75px',
    // height: '78vh',
    // marginLeft: drawerWidth,
    overflow: 'auto',
  },
  content: {
    flexGrow: 1,
    // padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 10,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  // content: {
  //   flexGrow: 1,
  //   height: '100vh',
  //   overflow: 'auto',
  // },
  container: {
    paddingTop: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  // fixedHeight: {
  //   marginTop: 50,
  //   height: 240,
  // },
  topMargin: {
    paddingTop: '5px',
  },
  iconWidth: {
    minWidth: '40px',
  },
  smallText: {
    fontSize: '20px',
    weight: '50',
    color: '#606060',
    paddingLeft: '5px',
  },
}));

export default function Admin() {
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const [buttonValue, setButtonValue] = useState('');
  const [focusTeamId, setFocusTeamId] = useState('');
  const [
    focusQuestionData,
    setFocusQuestionData,
  ] = useState<IQuestionDetails>();
  const [focusUserName, setFocusUserName] = useState('');
  const [focusQuestionnaire, setFocusQuestionnaire] = useState<any>();
  const [mapQuestionStandalone, setMapQuestionStandalone] = useState(false);
  const [title, setTitle] = useState('');
  const userToken = useSelector((state: IRootState) => state.user.idToken);
  const user = useSelector((state: IRootState) => state.user);
  const setDisplayTextCenter = useActions(setAppBarCenterText);
  const setDisplayTextLeft = useActions(setAppBarLeftText);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  useEffect(() => {
    setDisplayTextCenter('');
    setDisplayTextLeft('');
  }, []);

  const switchToAdminHome = (event: any) => {
    setButtonValue(ADMIN_HOME);
    setTitle('')
  };

  const switchPage = (pageName: string) => {
    setButtonValue(pageName);
    setTitle(pageName)
  };

  const handleDashboard = () => {
    setButtonValue(DASHBOARD);
    setTitle('dashboard');
  };

  const handleCreateUser = () => {
    setButtonValue(CREATE_USER);
    setTitle('createUser');
  };

  const handleManageUsers = () => {
    setButtonValue(MANAGE_USERS);
    setTitle('manageUsers');
  };

  const editUserClickHandler = (userName: string) => {
    setButtonValue(EDIT_USER);
    setFocusUserName(userName);
    setTitle('editUser');
  };

  const handleCreateTeam = () => {
    setButtonValue(CREATE_TEAM);
    setTitle('createTeam');
  };

  const handleManageTeams = () => {
    setButtonValue(MANAGE_TEAMS);
    setTitle('manageTeams');
  };

  const editTeamClickHandler = (teamId: string) => {
    setButtonValue(EDIT_TEAM);
    setFocusTeamId(teamId);
    setTitle('editTeams');
  };

  const handleAssignClicked = (teamId: string) => {
    setButtonValue(ASSIGN_ASSESSMENT);
    setFocusTeamId(teamId);
    setTitle('assignAssessment');
  };

  const handleMapMetricsClicked = (teamId: string) => {
    setButtonValue(MAP_METRICS_TOOLS);
    setFocusTeamId(teamId);
    setTitle('mapMetricsTools');
  };

  const handleCreateQuestionnaire = () => {
    setButtonValue(CREATE_QUESTIONNAIRE);
    setTitle('createQuestionnaire');
  };

  const handleManageQuestionnaires = () => {
    setButtonValue(MANAGE_QUESTIONNAIRES);
    setTitle('manageQuestionnaire');
  };

  const switchToEditQuestionnaire = (questionnaire: any) => {
    setButtonValue(EDIT_QUESTIONNAIRE);
    setFocusQuestionnaire(questionnaire);
    setMapQuestionStandalone(false);
    setTitle('editQuestionnaire');
  };

  const switchToMapQuestionsStandalone = (questionnaire: any) => {
    setButtonValue(EDIT_QUESTIONNAIRE);
    setFocusQuestionnaire(questionnaire);
    setMapQuestionStandalone(true);
    setTitle('manageQuestionnaire');
  };

  const handleCreateQuestion = () => {
    setButtonValue(CREATE_QUESTION);
    setTitle('createQuestion');
  };

  const handleManageQuestion = () => {
    setButtonValue(MANAGE_QUESTION);
    setTitle('manageQuestions');
  };

  const editQuestionClickHandler = (questionData: IQuestionDetails) => {
    setButtonValue(EDIT_QUESTION);
    setFocusQuestionData(questionData);
    setTitle('editQuestions');
  };

  const handleFeedbackClick = () => {
    setButtonValue(FEEDBACK);
    setTitle('feedback');
  };

  const handleManageSettings = () => {
    setButtonValue(MANAGE_SETTINGS);
    setTitle('manageSettings');
  };

  const editSettingsClickHandler = (settingsType: any) => {
    setButtonValue(settingsType);
    setTitle('editSettings');
  };

  // const handleDrawerClose = () => {
  //   setOpen(false);
  // };

  const renderDefault = () => {
    if (
      user &&
      user.roles &&
      user.roles.includes('Manager') &&
      !user.roles.includes('Admin')
    ) {
      return (
        // tslint:disable-next-line: jsx-wrap-multiline
        <Grid container spacing={3} className={classes.topMargin}>
          <Grid item xs={12}>
            {/* <Paper className={fixedHeightPaper}> */}
            <Typography variant='h4'>
              <Text tid='manager-title' />
              {/* Welcome Manager! */}
            </Typography>
            <br />
            <br />
            <Typography variant='h5' className={classes.smallText}>
              <Text tid='manager-description-line1' />
              <br /> <br />
              <Text tid='manager-description-line2' />
              <br />
              <Text tid='manager-description-line3' />
              {/* You have the managerial privileges to create and manage users and
            teams using the screens on the left panel.
            You can also access summary views using the 'Dashboard' option on the left. */}
            </Typography>
            {/* </Paper> */}
          </Grid>
        </Grid>
      );
    }

    return (
      // tslint:disable-next-line: jsx-wrap-multiline
      <Grid container spacing={3} className={classes.topMargin}>
        <Grid item xs={12}>
          <Typography variant='h4'>
            <Text tid='admin-title' />
          </Typography>
          <br />
          <br />
          <Typography variant='h5' className={classes.smallText}>
            <Text tid='admin-description-line1' />
            {/* You have the administrative privileges to create and manage users,
          teams, questionnaires and questions using the screens on the left panel. <br /><br />
          You can access summary views using the 'Dashboard' option. */}
            {/* <br />
          You can also check the feedback given by the assessment takers using the 'View Feedback' option on the left panel. */}
          </Typography>
          {/* <br /> */}
          <Typography variant='h5' className={classes.smallText}>
            <ul>
              <li>
                <Text tid='admin-description-line2' />
              </li>
              <li>
                <Text tid='admin-description-line3' />
              </li>
              <li>
                <Text tid='admin-description-line4' />
              </li>
            </ul>
          </Typography>
        </Grid>
      </Grid>
    );
  };
  const renderComponent = () => {
    switch (buttonValue) {
      case ADMIN_HOME:
        return renderDefault();
      case DASHBOARD:
        return <Dashboard sideMenu={true} />;
      case CREATE_USER:
        return <CreateUser goBack={switchToAdminHome} />;
      case MANAGE_USERS:
        return (
          <ManageUsers
            team={focusTeamId}
            editUserClicked={editUserClickHandler}
            goBack={switchToAdminHome}
          />
        );
      case EDIT_USER:
        return <EditUser user={focusUserName} goBack={switchPage} />;
      case CREATE_TEAM:
        return <CreateTeam goBack={switchToAdminHome} />;
      case MANAGE_TEAMS:
        return (
          <ManageTeams
            editClicked={editTeamClickHandler}
            goBack={switchToAdminHome}
            assignClicked={handleAssignClicked}
            mapMetricsClicked={handleMapMetricsClicked}
          />
        );
      case EDIT_TEAM:
        return <EditTeam teamId={focusTeamId} goBack={switchPage} mapMetricsClicked={handleMapMetricsClicked} />;
      case ASSIGN_ASSESSMENT:
        return <AssignAssessment teamId={focusTeamId} goBack={switchPage} />;
      case MAP_METRICS_TOOLS:
        return <MapMetricsTools teamId={focusTeamId} goBack={switchPage} />;
      case CREATE_QUESTIONNAIRE:
        return <CreateQuestionnaire goBack={switchToAdminHome} />;
      case MANAGE_QUESTIONNAIRES:
        return (
          <ManageAssessments
            handleEditQuestionnaire={switchToEditQuestionnaire}
            handleMapQuestionStandalone={switchToMapQuestionsStandalone}
            goBack={switchToAdminHome}
          />
        );
      case EDIT_QUESTIONNAIRE:
        return (
          <EditAssessment
            questionnaire={focusQuestionnaire}
            handleMapQuestionStandalone={switchToMapQuestionsStandalone}
            goBack={switchPage}
            isMapQuestions={mapQuestionStandalone}
          />
        );
      case CREATE_QUESTION:
        return <CreateQuestion goBack={switchToAdminHome} />;
      case MANAGE_QUESTION:
        return (
          <ManageQuestion
            editQuestionClicked={editQuestionClickHandler}
            goBack={switchToAdminHome}
          />
        );
      case EDIT_QUESTION:
        return (
          <EditQuestion question={focusQuestionData} goBack={switchPage} />
        );
      case FEEDBACK:
        return <AdminFeedback goBack={switchToAdminHome} />;
      case MANAGE_SETTINGS:
        return (
          <ManageSettings
            editSettingsClicked={editSettingsClickHandler}
            goBack={switchToAdminHome}
          />
        );
      case EDIT_SETTINGS_USER_CONFIG:
      case EDIT_SETTINGS_TEAM_CONFIG:
      case EDIT_SETTINGS_SERVICE_CONFIG:  
        return (
          <EditSettingsObjectConfig objType={buttonValue} goBack={switchPage} />
        );
      case EDIT_SETTINGS_GENERAL_CONFIG:
        return (
          <EditSettingsGeneralConfig
            objType={buttonValue}
            goBack={switchPage}
          />
        );
      case EDIT_SETTINGS_COLLECTOR_CONFIG:
        return (
          <EditSettingsCollectorConfig
            objType={buttonValue}
            goBack={switchPage}
          />
        );
      default:
        return renderDefault();
    }
  };

  if (userToken === null) {
    return <Redirect to='/relogin' />;
  }
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position='fixed'
        className={clsx(classes.appBar, open && classes.appBarShift)}
        style={{ marginTop: '50px' }}
      >
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge='start'
            color='inherit'
            aria-label='open drawer'
            onClick={handleDrawerOpen}
            className={clsx(
              classes.menuButton,
              open && classes.menuButtonHidden
            )}
          >
            <MenuIcon />
          </IconButton>
          <Typography color='inherit' noWrap className={classes.title}>
            <Text tid={title} />
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant='permanent'
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List disablePadding={true} style={{ padding: '-10px 0px' }}>
          <ListItem button onClick={handleDashboard}>
            <Tooltip
              title={<Typography>{<Text tid='dashboard2' />}</Typography>}
              disableHoverListener={open ? true : false}
              placement='right'
              arrow={true}
            >
              <ListItemIcon className={classes.iconWidth}>
                <DashboardIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={<Text tid='dashboard2' />} />
          </ListItem>
        </List>
        <Divider />
        <List disablePadding={true}>
          <ListItem button onClick={handleCreateUser}>
            <Tooltip
              title={<Typography>{<Text tid='createUser2' />}</Typography>}
              disableHoverListener={open ? true : false}
              placement='right'
              arrow={true}
            >
              <ListItemIcon className={classes.iconWidth}>
                <PersonAddIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={<Text tid='createUser2' />} />
          </ListItem>
        </List>
        <List disablePadding={true}>
          <ListItem
            button
            onClick={handleManageUsers}
            style={{ paddingTop: '0px' }}
          >
            <Tooltip
              title={<Typography>{<Text tid='manageUsers2' />}</Typography>}
              disableHoverListener={open ? true : false}
              placement='right'
              arrow={true}
            >
              <ListItemIcon className={classes.iconWidth}>
                <PeopleOutlineIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={<Text tid='manageUsers2' />} />
          </ListItem>
        </List>
        <Divider />
        <List disablePadding={true}>
          <ListItem button onClick={handleCreateTeam}>
            <Tooltip
              title={<Typography>{<Text tid='createTeam2' />}</Typography>}
              disableHoverListener={open ? true : false}
              placement='right'
              arrow={true}
            >
              <ListItemIcon className={classes.iconWidth}>
                <GroupAddIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={<Text tid='createTeam2' />} />
          </ListItem>
        </List>
        <List disablePadding={true}>
          <ListItem button onClick={handleManageTeams}>
            <Tooltip
              title={<Typography>{<Text tid='manageTeams2' />}</Typography>}
              disableHoverListener={open ? true : false}
              placement='right'
              arrow={true}
            >
              <ListItemIcon className={classes.iconWidth}>
                <GroupIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={<Text tid='manageTeams2' />} />
          </ListItem>
        </List>
        <Divider />
        <List disablePadding={true}>
          <ListItem
            button
            onClick={handleCreateQuestionnaire}
            disabled={!(user && user.roles && user.roles.includes('Admin'))}
          >
            <Tooltip
              title={
                <Typography>{<Text tid='createQuestionnaire2' />}</Typography>
              }
              disableHoverListener={open ? true : false}
              placement='right'
              arrow={true}
            >
              <ListItemIcon className={classes.iconWidth}>
                <AssignmentIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={<Text tid='createQuestionnaire2' />} />
          </ListItem>
        </List>
        <List disablePadding={true}>
          <ListItem
            button
            onClick={handleManageQuestionnaires}
            disabled={!(user && user.roles && user.roles.includes('Admin'))}
          >
            <Tooltip
              title={
                <Typography>{<Text tid='manageQuestionnaire2' />}</Typography>
              }
              disableHoverListener={open ? true : false}
              placement='right'
              arrow={true}
            >
              <ListItemIcon className={classes.iconWidth}>
                <BallotIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={<Text tid='manageQuestionnaire2' />} />
          </ListItem>
        </List>
        <Divider />
        <List disablePadding={true}>
          <ListItem
            button
            onClick={handleCreateQuestion}
            disabled={!(user && user.roles && user.roles.includes('Admin'))}
          >
            <Tooltip
              title={<Typography>{<Text tid='createQuestion2' />}</Typography>}
              disableHoverListener={open ? true : false}
              placement='right'
              arrow={true}
            >
              <ListItemIcon className={classes.iconWidth}>
                <AssignmentOutlinedIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={<Text tid='createQuestion2' />} />
          </ListItem>
        </List>
        <List disablePadding={true}>
          <ListItem
            button
            onClick={handleManageQuestion}
            disabled={!(user && user.roles && user.roles.includes('Admin'))}
          >
            <Tooltip
              title={<Typography>{<Text tid='manageQuestions2' />}</Typography>}
              disableHoverListener={open ? true : false}
              placement='right'
              arrow={true}
            >
              <ListItemIcon className={classes.iconWidth}>
                <BallotOutlinedIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={<Text tid='manageQuestions2' />} />
          </ListItem>
        </List>
        <Divider />
        <List disablePadding={true}>
          <ListItem
            button
            onClick={handleFeedbackClick}
            disabled={!(user && user.roles && user.roles.includes('Admin'))}
          >
            <Tooltip
              title={<Typography>{<Text tid='viewFeedback' />}</Typography>}
              disableHoverListener={open ? true : false}
              placement='right'
              arrow={true}
            >
              <ListItemIcon className={classes.iconWidth}>
                <FeedbackIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={<Text tid='viewFeedback' />} />
          </ListItem>
        </List>
        <Divider />
        <List disablePadding={true}>
          <ListItem
            button
            onClick={handleManageSettings}
            disabled={!(user && user.roles && user.roles.includes('Admin'))}
          >
            <Tooltip
              title={<Typography>{<Text tid='settings' />}</Typography>}
              disableHoverListener={open ? true : false}
              placement='right'
              arrow={true}
            >
              <ListItemIcon className={classes.iconWidth}>
                <SettingsIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={<Text tid='settings' />} />
          </ListItem>
        </List>
      </Drawer>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div
          className={classes.appBarSpacer}
          style={{ paddingLeft: open ? '220px' : '40px' }}
        >
          <Container className={classes.container} maxWidth='lg'>
            {renderComponent()}
          </Container>
        </div>
      </main>
      {/* <main style={{ position: 'absolute' }}>
        <div className={classes.appBarSpacer}>
          <Container maxWidth="lg" className={classes.container}>
            {renderComponent()}
          </Container>
        </div>
      </main> */}
    </div>
  );
}
