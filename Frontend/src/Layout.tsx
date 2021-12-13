import React, { Fragment, useRef, useState } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import IdleTimer from 'react-idle-timer'
import { IdleTimeOutModal } from './components/idleTimeoutModal'
import {
  About,
  Admin,
  Assessment,
  AssessmentDetail,
  AssessmentSelect,
  Auth,
  ErrorPage,
  Logout,
  MetricSelect,
  Relogin,
  Result,
  TeamAssessments,
  TeamSelect,
  Trends,
  ViewAssessment,
  ViewTeams,
} from './pages';
import { QuestionRenderer } from './components';
import Dashboard from './components/admin/dashboard';

const Layout = (props: any) => {
  const [openDialog, setOpenDialog] = useState(false);
  const idleTimeout = 1000 * 60 * 60; // In milliseconds - 1000 (1 second) * 60 * 60 = 1 Hour
  const idleWarningTimeout = 1000 * 60 * 2; // In milliseconds - 1000 (1 second) * 60 * 2 = 2 minutes
  let idleTimerRef: any = useRef(null)
  let sessionTimeoutRef: any = useRef(null);

  const handleOnActive = () => {
    clearTimeout(sessionTimeoutRef.current);
  }

  const handleLogout = () => {
    setOpenDialog(false);
    clearTimeout(sessionTimeoutRef.current)
    props.history.push('/logout')
  }

  const handleOnIdle = () => {
    setOpenDialog(true);
    sessionTimeoutRef.current = setTimeout(handleLogout, idleWarningTimeout);
  }

  const handleClose = () => {
    setOpenDialog(false);
  }

  return (
    <Fragment>
      <IdleTimer
        ref={idleTimerRef}
        timeout={idleTimeout}
        onIdle={handleOnIdle}
        onActive={handleOnActive}
      />
      <Switch>
        <Route
          exact path='/auth' component={Auth}
        />
        <Route
          exact path='/logout' component={Logout}
        />
        <Route
          exact path='/assessment' component={Assessment}
        />
        <Route
          exact path='/assessmentselect' component={AssessmentSelect}
        />
        <Route
          exact path='/about' component={About}
        />
        <Route
          exact path='/relogin' component={Relogin}
        />
        <Route
          exact path='/admin' component={Admin}
        />
        <Route
          exact
          path='/metricSelect'
          render={() => <MetricSelect metricType={props.metricType} metricSelection={props.metricSelection} {...props} />}
        />
        <Route
          exact
          path='/assessment/history'
          component={ViewAssessment}
        />
        <Route
          exact path={`/assessment/:assessmentId/question/:index`}
          component={QuestionRenderer}
        />
        <Route
          exact
          path='/result/:assessmentId'
          component={Result}
        />
        <Route
          exact
          path='/assessment/detail/:assessmentId'
          component={AssessmentDetail}
        />
        <Route
          exact
          path='/assessment/teams'
          component={ViewTeams}
        />
        <Route
          exact
          path='/assessment/teams/:teamId/:assessmentName/:version'
          component={TeamAssessments}
        />
        <Route exact path='/teamselect' component={TeamSelect}
        />
        <Route exact path='/error' component={ErrorPage} />
        <Route exact path='/admin/dashboard' component={Dashboard} />
        <Route exact path='/trends' component={Trends} />
      </Switch>

      <IdleTimeOutModal
        openDialog={openDialog}
        handleClose={handleClose}
        handleLogout={handleLogout}
      />
    </Fragment>
  )
}

export default withRouter(Layout);