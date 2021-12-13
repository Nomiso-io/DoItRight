import { createBrowserHistory } from 'history';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import storage from 'redux-persist/es/storage';
import rootReducer from './reducers';
import { persistStore, persistReducer } from 'redux-persist';

// const persistConfig: PersistConfig = {
// 	key: 'root',
// 	version: 1,
// 	storage: localforage,
// 	blacklist: [],
// };

// const saveToSessionStorage = (state: any) => {
// 	try {
// 		const serializedState = JSON.stringify(state);
// 		sessionStorage.setItem('state', serializedState);
// 	} catch (e) {
// 		console.log('Error while saving state to local storage', e)
// 	}
// }
// const loadFromSessionStorage = () => {
// 	try {
// 		const serializedState = sessionStorage.getItem('state');
// 		if (serializedState === null) {
// 			return undefined;
// 		}
// 		return JSON.parse(serializedState)
// 	} catch (e) {
// 		console.log('Error while loading from localStorage', e);
// 		return undefined;
// 	}
// }
const logger = createLogger();
const history = createBrowserHistory();

const dev = process.env.NODE_ENV === 'development';

let middleware = dev ? applyMiddleware(logger, thunk) : applyMiddleware(thunk);

if (dev) {
  middleware = composeWithDevTools(middleware);
}

// const persistedReducer = rootReducer(history);
const reducer = persistReducer({ storage, key: 'root' }, rootReducer(history));
// const persistedState = loadFromSessionStorage();
export default () => {
  const store = createStore(reducer, {}, middleware);
  // store.subscribe(() => {
  // 	saveToSessionStorage(store.getState())
  // })
  const persistor = persistStore(store);
  return { store, persistor };
};

export { history };
