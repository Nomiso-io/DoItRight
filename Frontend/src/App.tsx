import React, { useEffect, useState } from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import { history } from './configureStore';
import { Home } from './pages';
import { PageHeader } from './components';
import { useSelector } from 'react-redux';
import { useActions, removeUserDetails } from './actions';
import { IRootState } from './reducers';
import ReactGA from 'react-ga';
import { LanguageProvider } from './common/Language';
import Layout from './Layout';

interface IDoitrightProps { }

const GA_id_prod = 'UA-154108167-2';
const GA_id_dev = 'UA-154108167-1';
const GA_id_beta = 'UA-154108167-3';

const DoItRight = (props: IDoitrightProps) => {
  const userData = useSelector((state: IRootState) => state.user.userDetails);
  const removeUserData = useActions(removeUserDetails);
  const [metricType, setMetricType] = useState('doraMetrics');
  const [metricSelection, setMetricSelection] = useState(true);
  const env = process.env.REACT_APP_STAGE;

  useEffect(() => {
    if (userData) {
      const date = Number(new Date());
      const dateSeconds = date / 1000;
      if (dateSeconds > userData.exp) {
        removeUserData();
      }
    }
    if (env === 'Prod') {
      ReactGA.initialize(GA_id_prod);
    } else if (env === 'Beta') {
      ReactGA.initialize(GA_id_beta);
    } else if (env === 'Dev') {
      ReactGA.initialize(GA_id_dev);
    }
    // https://levelup.gitconnected.com/using-google-analytics-with-react-3d98d709399b
    if (userData && userData.email) {
      ReactGA.set({
        userId: userData.email,
      });
    }
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  const getMetricsType = (type: any) => {
    setMetricSelection(!metricSelection)
    setMetricType(type);
  };

  return (
    <LanguageProvider>
      <Router history={history}>
        <PageHeader getMetricsType={(type: any) => getMetricsType(type)} />
        <Switch>
          <Route exact path='/' component={Home} />
          <Route render={() => <Layout metricType={metricType} metricSelection={metricSelection} />} />
        </Switch>
      </Router>
    </LanguageProvider >
  );
};

export default DoItRight;
