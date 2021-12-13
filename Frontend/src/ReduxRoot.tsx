import * as React from 'react';
import { Provider } from 'react-redux';
import DoitRight from './App';
import configureStore from './configureStore';
import { PersistGate } from 'redux-persist/integration/react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#042E5B',
    },
  },
});

const { store, persistor } = configureStore();

function ReduxRoot() {
  return (
    <PersistGate persistor={persistor}>
      <Provider store={store}>
        <MuiThemeProvider theme={theme}>
          <DoitRight />
        </MuiThemeProvider>
      </Provider>
    </PersistGate>
  );
}

export default ReduxRoot;
