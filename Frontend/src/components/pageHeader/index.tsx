import React, { useState, Fragment } from 'react';
import bigLogo from '../../logo/big-logo.jpg';
import {
  AppBar,
  Toolbar,
  Typography,
  makeStyles,
  Grid,
  Tooltip,
  Button,
  Menu,
  MenuItem,
} from '@material-ui/core';
import { useSelector } from 'react-redux';
import './style.css';
import { NavLink, withRouter } from 'react-router-dom';
import { IRootState } from '../../reducers';
import { ModalComponent } from '../modal';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import HomeIcon from '@material-ui/icons/Home';
import {
  resetBothDisplayText,
  useActions,
  setAppBarRightText,
} from '../../actions';
import * as constantValues from '../../common/constantValues';
import { buttonStyle } from '../../common/common';
import { Link } from 'react-scroll';
// import LanguageSelector from '../language-selection-dropdown/index';
import { Text } from '../../common/Language';

const timeoutLength = 50;

interface PageRedirectState {
  type: string;
}

const useStyles = makeStyles((theme) => ({
  headerItem: {
    color: 'black',
    padding: theme.spacing(1),
    cursor: 'pointer',
    fontSize: '16px',
  },
  headerItemDisabled: {
    color: '#9E9E9E',
    // color: theme.palette.grey,
    padding: theme.spacing(1),
    cursor: 'default',
    fontSize: '16px',
  },
  headerButton: {
    ...buttonStyle,
  },
  menu: {
    top: '30px !important',
  },
  menuitem: {
    color: '#042E5B',
  },
  logo: {
    maxWidth: '48px',
    maxHeight: '48px',
  },
  bigLogo: {
    height: '45px',
    backgroundColor: '#F7F7F7',
  },
  appBar: {
    minWidth: '100%',
    backgroundColor: '#042E5B',
    boxShadow: 'none',
    height: '50px',
    position: 'fixed',
    top: 50,
  },
  appBarMini: {
    minWidth: '100%',
    backgroundColor: '#042E5B',
    boxShadow: 'none',
    height: '2px',
    position: 'fixed',
    top: 50,
  },
  topBar: {
    width: '100%',
    height: '50px',
    backgroundColor: '#F7F7F7',
    position: 'fixed',
    zIndex: 100,
    top: 0,
  },
  appBarTextRight: {
    // width: "100%",
    textAlign: 'right',
    paddingTop: '4px',
  },
  appBarTextCenter: {
    // width: "100%",
    fontSize: '18px',
    textAlign: 'center',
    weight: '400',
  },
  appBarTextLeft: {
    // marginRight: "auto",
    fontSize: '18px',
    weight: '400',
  },
}));

const metricsMenu = [
  { link: 'doraMetrics', name: 'doraMetrics' },
  { link: 'build', name: 'buildCICD' },
  { link: 'repository', name: 'gitRepository' },
  { link: 'requirements', name: 'requirements' },
  { link: 'quality', name: 'quality' },
];

const dashboardMenu = [
  { link: 'overallMaturity', name: 'overallMaturity' },
  { link: 'categorywiseMaturity', name: 'categoryWiseMaturity' },
  { link: 'performanceMetrics', name: 'performanceMetrics' },
  { link: 'questionwiseMetrics', name: 'questionWiseMetrics' },
];

const trendsMenu = [
  { link: 'assessmentWise', name: 'assessmentWise' },
  { link: 'teamWise', name: 'teamWise' },
];

const PageHeader = (props: any) => {
  const classes = useStyles();
  const userStatus = useSelector((state: IRootState) => {
    return state.user;
  });
  const displayTextLeft = useSelector((state: IRootState) => {
    return state.display.topBarTextLeft;
  });
  const displayTextCenter = useSelector((state: IRootState) => {
    return state.display.topBarTextCenter;
  });
  const displayTextRight = useSelector((state: IRootState) => {
    return state.display.topBarTextRight;
  });
  const currentPage = useSelector((state: IRootState) => {
    return state.display.currentPage;
  });
  const url = window.location.href;
  const currentUrl = url.substring(url.length - 6, url.length);
  const resetBothTexts = useActions(resetBothDisplayText);
  const setDisplayTextRight = useActions(setAppBarRightText);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorMetricsEl, setAnchorMetricsEl] = useState(null);
  const [anchorDashboardEl, setAnchorDashboardEl] = useState(null);
  const [anchorTrendsEl, setAnchorTrendsEl] = useState(null);
  const [openModalLogout, setOpenModalLogout] = useState(false);
  const [openModalLeavePage, setOpenModalLeavePage] = useState(false);
  const [focusURL, setFocusURL] = useState('');
  const [adminPageState, setAdminPageState] = useState(
    currentUrl.includes('admin') ? true : false
  );
  const [pageRedirectState, setPageRedirectState] = useState<PageRedirectState>(
    { type: '' }
  );

  let redirectUrl: string;
  const systemDetails = useSelector((state: IRootState) => state.systemDetails);
  redirectUrl = `https://${systemDetails.appClientURL}/login?response_type=token&client_id=${systemDetails.appClientId}&redirect_uri=https://${window.location.host}/auth`;

  if (
    props.location.pathname === '/' ||
    systemDetails.mode === constantValues.TRIAL_MODE
  ) {
    resetBothTexts();
  } else {
    setDisplayTextRight(
      userStatus && userStatus.userDetails && userStatus.userDetails.email
        ? userStatus.userDetails.email
        : ''
    );
  }

  const onClick = () => {
    window.open(
      redirectUrl,
      '_self',
      `toolbar=no, location=no, directories=no, status=no, menubar=no,
            scrollbars=no, resizable=no, copyhistory=no, width=${500},
            height=${5000}, top=${300}, left=${300}`
    );
  };

  const logoutModalActivate = () => {
    setOpenModalLogout(true);
  };

  const modalNoClickedLogout = () => {
    setOpenModalLogout(false);
  };

  const modalYesClickedLogout = () => {
    setOpenModalLogout(false);
    props.history.push('/logout');
  };

  const renderUserStatus = () => {
    return (
      <div className='header-item last-item'>
        {userStatus.idToken ? (
          <Tooltip title={<Typography>Logout</Typography>}>
            <Typography
              onClick={logoutModalActivate}
              className={classes.headerItem}
            >
              <ExitToAppIcon />
            </Typography>
          </Tooltip>
        ) : (
          <Typography onClick={onClick} className={classes.headerItem}>
            <Text tid='login' />
          </Typography>
        )}
      </div>
    );
  };

  const handleAssessment = (event: any) => {
    // setAdminPageState(false);
    const { getMetricsType } = props;
    setAnchorEl(event.currentTarget);
    getMetricsType('doraMetrics');
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMetricsMenuClick = (event: any) => {
    setAnchorMetricsEl(event.currentTarget);
    setAdminPageState(false);
    props.history.push('/metricSelect');
  };

  const handleMetricsMenuClose = () => {
    setAnchorMetricsEl(null);
  };

  const handleMetricsMenuOptionClick = (metricType: any) => {
    const { getMetricsType } = props;
    handleMetricsMenuClose();
    getMetricsType(metricType);
  };

  function handleDashboardMenuClick(event: any) {
    const { getMetricsType } = props;
    setAnchorDashboardEl(event.currentTarget);
    setAdminPageState(false);
    props.history.push('/admin/dashboard');
    getMetricsType('doraMetrics');
  }

  function handleTrendsMenuClick(event: any) {
    const { getMetricsType } = props;
    setAnchorTrendsEl(event.currentTarget);
    setAdminPageState(false);
    props.history.push('/trends');
  }

  const handleDashboardMenuClose = () => {
    setAnchorDashboardEl(null);
  };

  const handleDashboardMenuOptionClick = () => {
    handleDashboardMenuClose();
  };

  const handleTrendsMenuClose = () => {
    setAnchorTrendsEl(null);
  };

  const handleTrendsMenuOptionClick = () => {
    handleTrendsMenuClose();
  };

  const handleAdminButtonClick = () => {
    const { getMetricsType } = props;
    getMetricsType('doraMetrics');
    setAdminPageState(true);
    if (currentPage === constantValues.QUESTION_PAGE_NOT_TIMED) {
      setOpenModalLeavePage(true);
      setFocusURL('/admin');
    } else {
      props.history.push('/admin');
    }
  };

  const leaveMetricMenu = () => {
    setTimeout(() => {
      setAnchorMetricsEl(null);
    }, timeoutLength);
  };

  const leaveDashboardMenu = () => {
    setTimeout(() => {
      setAnchorDashboardEl(null);
    }, timeoutLength);
  };

  const leaveTrendsMenu = () => {
    setTimeout(() => {
      setAnchorTrendsEl(null);
    }, timeoutLength);
  };

  const renderViewAssessment = () => {
    if (!userStatus.idToken) {
      return <div />;
    }
    if (currentPage === constantValues.QUESTION_PAGE_TIMED) {
      return (
        <div className='header-item'>
          <Tooltip
            title={
              <Typography>
                <Text tid='notAvailableDuringThisAssessment' />
              </Typography>
            }
          >
            <Typography className={classes.headerItemDisabled}>
              <Text tid='assessments' />
            </Typography>
          </Tooltip>
        </div>
      );
    }

    return (
      <div className='header-item'>
        <Typography className={classes.headerItem} onClick={handleAssessment}>
          <Text tid='assessments' />
        </Typography>
      </div>
    );
  };

  const handleTrialClose = () => {
    props.history.push('/trial/close');
  };

  const renderViewMetrics = () => {
    if (!userStatus.idToken) {
      return <div />;
    }
    return (
      <div className='header-item'>
        <Typography
          className={classes.headerItem}
          onClick={handleMetricsMenuClick}
        >
          <Text tid='metrics' />
        </Typography>
      </div>
    );
  };

  const renderMetricsMenuItems = () => {
    if (!userStatus.roles) {
      return;
    }
    if (
      userStatus.roles!.indexOf('Admin') !== -1 ||
      userStatus.roles!.indexOf('Manager') !== -1
    ) {
      return (
        <Menu
          id='menu-list-grow'
          anchorEl={anchorMetricsEl}
          keepMounted
          open={Boolean(anchorMetricsEl)}
          onClose={handleMetricsMenuClose}
          MenuListProps={{
            onMouseLeave: leaveMetricMenu,
          }}
          className={classes.menu}
        >
          {metricsMenu.map((menuList: any, index: number) => {
            return (
              <MenuItem className={classes.menuitem} key={index} onClick={() => handleMetricsMenuOptionClick(menuList.link)}>
                <Text tid={menuList.name} />
              </MenuItem>
            );
          })}
        </Menu>
      );
    }
    return;
  };

  const renderAdminPage = () => {
    if (!userStatus.roles) {
      return;
    }
    if (
      userStatus.roles!.indexOf('Admin') === -1 &&
      userStatus.roles!.indexOf('Manager') !== -1
    ) {
      if (currentPage === constantValues.QUESTION_PAGE_TIMED) {
        return (
          <div className='header-item'>
            <Tooltip
              title={
                <Typography>
                  <Text tid='notAvailableDuringThisAssessment' />
                </Typography>
              }
            >
              <Typography className={classes.headerItemDisabled}>
                <Text tid='manage' />
              </Typography>
            </Tooltip>
          </div>
        );
      }
      return (
        <div className='header-item'>
          <Typography
            onClick={handleAdminButtonClick}
            className={classes.headerItem}
          >
            <Text tid='manage' />
          </Typography>
        </div>
      );
    }
    if (userStatus.roles!.indexOf('Admin') !== -1) {
      if (currentPage === constantValues.QUESTION_PAGE_TIMED) {
        return (
          <div className='header-item'>
            <Tooltip
              title={
                <Typography>
                  <Text tid='notAvailableDuringThisAssessment' />
                </Typography>
              }
            >
              <Typography className={classes.headerItemDisabled}>
                <Text tid='admin' />
              </Typography>
            </Tooltip>
          </div>
        );
      }
      return (
        <div className='header-item'>
          <Typography
            onClick={handleAdminButtonClick}
            className={classes.headerItem}
          >
            <Text tid='admin' />
          </Typography>
        </div>
      );
    }
    return;
  };

  const renderDashboardPage = () => {
    if (!userStatus.roles) {
      return;
    }
    if (
      userStatus.roles!.indexOf('Admin') !== -1 ||
      userStatus.roles!.indexOf('Manager') !== -1
    ) {
      if (currentPage === constantValues.QUESTION_PAGE_TIMED) {
        return (
          <div className='header-item'>
            <Tooltip
              title={
                <Typography>
                  <Text tid='notAvailableDuringThisAssessment' />
                </Typography>
              }
            >
              <Typography className={classes.headerItemDisabled}>
                <Text tid='dashboards' />
              </Typography>
            </Tooltip>
          </div>
        );
      }
      return (
        <div className='header-item'>
          <Typography
            onClick={handleDashboardMenuClick}
            className={classes.headerItem}
          >
            <Text tid='dashboards' />
          </Typography>
        </div>
      );
    }
    return;
  };

  const renderDashboardMenuItems = () => {
    if (!userStatus.roles) {
      return;
    }
    if (
      userStatus.roles!.indexOf('Admin') !== -1 ||
      userStatus.roles!.indexOf('Manager') !== -1
    ) {
      return (
        <Menu
          id='menu-list-grow'
          anchorEl={anchorDashboardEl}
          keepMounted
          open={Boolean(anchorDashboardEl)}
          onClose={handleDashboardMenuClose}
          MenuListProps={{
            onMouseLeave: leaveDashboardMenu,
          }}
          className={classes.menu}
        >
          {dashboardMenu.map((menuList: any, index: number) => {
            return (
              <MenuItem className={classes.menuitem} key={index}>
                <Link
                  activeClass='active'
                  to={menuList.link}
                  spy={true}
                  smooth={true}
                  onClick={handleDashboardMenuOptionClick}
                >
                  {<Text tid={menuList.name} />}
                </Link>
              </MenuItem>
            );
          })}
        </Menu>
      );
    }
    return;
  };

  const renderTrendsPage = () => {
    if (!userStatus.roles) {
      return;
    }
    if (
      userStatus.roles!.indexOf('Admin') !== -1 ||
      userStatus.roles!.indexOf('Manager') !== -1
    ) {
      if (currentPage === constantValues.QUESTION_PAGE_TIMED) {
        return (
          <div className='header-item'>
            <Tooltip
              title={
                <Typography>
                  <Text tid='notAvailableDuringThisAssessment' />
                </Typography>
              }
            >
              <Typography className={classes.headerItemDisabled}>
                <Text tid='trends' />
              </Typography>
            </Tooltip>
          </div>
        );
      }
      return (
        <div className='header-item'>
          <Typography
            onClick={handleTrendsMenuClick}
            className={classes.headerItem}
          >
            <Text tid='trends' />
          </Typography>
        </div>
      );
    }
    return;
  };

  const renderTrendsMenuItems = () => {
    if (!userStatus.roles) {
      return;
    }
    if (
      userStatus.roles!.indexOf('Admin') !== -1 ||
      userStatus.roles!.indexOf('Manager') !== -1
    ) {
      return (
        <Menu
          id='menu-list-grow'
          anchorEl={anchorTrendsEl}
          keepMounted
          open={Boolean(anchorTrendsEl)}
          onClose={handleTrendsMenuClose}
          MenuListProps={{
            onMouseLeave: leaveTrendsMenu,
          }}
          className={classes.menu}
        >
          {trendsMenu.map((menuList: any, index: number) => {
            return (
              <MenuItem className={classes.menuitem} key={index}>
                <Link
                  activeClass='active'
                  to={menuList.link}
                  spy={true}
                  smooth={true}
                  onClick={handleTrendsMenuOptionClick}
                >
                  {<Text tid={menuList.name} />}
                </Link>
              </MenuItem>
            );
          })}
        </Menu>
      );
    }
    return;
  };

  const renderSecondTopBar = () => {
    if (systemDetails.mode === constantValues.TRIAL_MODE) {
      return (
        <AppBar
          position='static'
          color='primary'
          className={classes.appBarMini}
        ></AppBar>
      );
    } else {
      return (
        <AppBar position='static' color='primary' className={classes.appBar}>
          <Toolbar>
            <Grid container>
              <Grid item sm={4} className={classes.appBarTextLeft}>
                {displayTextLeft}
              </Grid>
              <Grid item sm={4} className={classes.appBarTextCenter}>
                {displayTextCenter}
              </Grid>
              <Grid item sm={4} className={classes.appBarTextRight}>
                {displayTextRight}
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      );
    }
  };

  const handleMyAssessments = () => {
    setAdminPageState(false);
    if (currentPage === constantValues.QUESTION_PAGE_NOT_TIMED) {
      handleClose();
      setOpenModalLeavePage(true);
      setFocusURL('/assessment/history');
    } else {
      handleClose();
      props.history.push('/assessment/history');
    }
  };

  const handleTeamAssessments = () => {
    setAdminPageState(false);
    if (currentPage === constantValues.QUESTION_PAGE_NOT_TIMED) {
      handleClose();
      setOpenModalLeavePage(true);
      setFocusURL('/assessment/teams');
    } else {
      handleClose();
      props.history.push('/assessment/teams');
    }
  };

  const handleTakeAssessment = () => {
    setAdminPageState(false);
    if (currentPage === constantValues.QUESTION_PAGE_NOT_TIMED) {
      handleClose();
      setOpenModalLeavePage(true);
      setFocusURL('/assessmentselect');
    } else {
      handleClose();
      props.history.push('/assessmentselect');
    }
  };

  const renderMenuItems = () => {
    if (userStatus && userStatus.roles) {
      if (
        userStatus.roles.includes('Admin') ||
        userStatus.roles.includes('Manager')
      ) {
        return (
          <Menu
            id='menu-list-grow'
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            className={classes.menu}
          >
            <MenuItem
              className={classes.menuitem}
              onClick={handleMyAssessments}
            >
              <Text tid='myAssessments' />
            </MenuItem>
            <MenuItem
              className={classes.menuitem}
              onClick={handleTeamAssessments}
            >
              <Text tid='teamAssessments' />
            </MenuItem>
            <MenuItem
              className={classes.menuitem}
              onClick={handleTakeAssessment}
            >
              <Text tid='takeAssessment' />
            </MenuItem>
          </Menu>
        );
      }
    }
    return (
      <Menu
        id='menu-list-grow'
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        className={classes.menu}
      >
        <MenuItem onClick={handleMyAssessments}>
          <Text tid='myAssessments' />
        </MenuItem>
        <MenuItem className={classes.menuitem} onClick={handleTakeAssessment}>
          <Text tid='takeAssessment' />
        </MenuItem>
      </Menu>
    );
  };

  const handleHomeIconClick = () => {
    setFocusURL('/');
    setPageRedirectState({ type: '' });
    setOpenModalLeavePage(true);
  };

  const modalYesClickedLeavePage = () => {
    setOpenModalLeavePage(false);
    if (focusURL) {
      if (pageRedirectState.type) {
        props.history.push({ pathname: focusURL, state: pageRedirectState });
        setPageRedirectState({ type: '' });
      } else {
        props.history.push(focusURL);
      }
      setFocusURL('');
    }
  };

  const modalNoClickedLeavePage = () => {
    setFocusURL('');
    setOpenModalLeavePage(false);
  };

  const renderHomeButton = () => {
    if (currentPage === constantValues.QUESTION_PAGE_TIMED) {
      return (
        <div className='header-item'>
          <Tooltip
            title={
              <Typography>
                <Text tid='homepageIsForbidden' />
              </Typography>
            }
          >
            <Typography className={classes.headerItemDisabled}>
              <HomeIcon />
            </Typography>
          </Tooltip>
        </div>
      );
    }
    if (currentPage === constantValues.QUESTION_PAGE_NOT_TIMED) {
      return (
        <div className='header-item'>
          <Typography className={classes.headerItem}>
            <HomeIcon />
          </Typography>
        </div>
      );
    }
    return (
      <div className='header-item'>
        <NavLink to='/'>
          <Typography className={classes.headerItem}>
            <HomeIcon />
          </Typography>
        </NavLink>
      </div>
    );
  };

  const renderLogo = () => {
    if (systemDetails.mode === constantValues.TRIAL_MODE) {
      return (
        <div className='topbar-header-logo'>
          <img className={classes.bigLogo} src={bigLogo} alt='logo' />
        </div>
      );
    }
    if (currentPage === constantValues.QUESTION_PAGE_TIMED) {
      return (
        <div className='topbar-header-logo'>
          <Tooltip
            title={
              <Typography>
                <Text tid='homepageIsForbidden' />
              </Typography>
            }
          >
            <img className={classes.bigLogo} src={bigLogo} alt='logo' />
          </Tooltip>
        </div>
      );
    }
    if (currentPage === constantValues.QUESTION_PAGE_NOT_TIMED) {
      return (
        <div className='topbar-header-logo'>
          <div onClick={handleHomeIconClick}>
            <img className={classes.bigLogo} src={bigLogo} alt='logo' />
          </div>
        </div>
      );
    }
    return (
      <div className='topbar-header-logo'>
        <NavLink to='/'>
          <img className={classes.bigLogo} src={bigLogo} alt='logo' />
        </NavLink>
      </div>
    );
  };

  return (
    <Fragment>
      <div className={classes.topBar}>
        {renderLogo()}
        <div className='topbar-header-links'>
          {systemDetails.mode !== constantValues.TRIAL_MODE ? (
            <div className='header-container'>
              {/* {<LanguageSelector />} */}
              {renderHomeButton()}
              {renderAdminPage()}
              {renderViewMetrics()}
              {renderMetricsMenuItems()}
              {renderDashboardPage()}
              {renderDashboardMenuItems()}
              {renderTrendsPage()}
              {renderTrendsMenuItems()}
              {renderViewAssessment()}
              {renderMenuItems()}
              <div className='header-item last-item'>{renderUserStatus()}</div>
            </div>
          ) : (
            <div className='header-item'>
              <Button
                onClick={handleTrialClose}
                className={classes.headerButton}
                variant='outlined'
              >
                <Text tid='close' />
              </Button>
            </div>
          )}
        </div>
        {!adminPageState && renderSecondTopBar()}
      </div>
      <ModalComponent
        message={'wantToLogout'}
        openModal={openModalLogout}
        handleModalYesClicked={modalYesClickedLogout}
        handleModalNoClicked={modalNoClickedLogout}
      />
      <ModalComponent
        message={'wantToLeaveThisPage'}
        messageSecondary={'unsavedChangesWillBeLost'}
        openModal={openModalLeavePage}
        handleModalYesClicked={modalYesClickedLeavePage}
        handleModalNoClicked={modalNoClickedLeavePage}
      />
    </Fragment>
  );
};
export default withRouter(PageHeader);
