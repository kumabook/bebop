import browser       from 'webextension-polyfill';
import React         from 'react';
import createHistory from 'history/createHashHistory';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import {
  applyMiddleware,
  createStore,
} from 'redux';
import {
  ConnectedRouter,
  routerMiddleware,
} from 'react-router-redux';
import {
  Switch,
  Route,
} from 'react-router-dom';
import logger from 'kiroku';

import Popup from './containers/Popup';
import reducers from './reducers/popup';
import rootSaga from './sagas/popup';
import { init as candidateInit } from './candidates';
import { init as actionInit } from './actions';
import { init as keySequenceInit } from './sagas/key_sequence';
import { start as appStart, stop } from './utils/app';

if (process.env.NODE_ENV === 'production') {
  logger.setLevel('FATAL');
}

function updateWidth({ popupWidth }) {
  const width = popupWidth || 700;
  document.body.style.width = `${width}px`;
}

export function start() {
  return browser.storage.local.get().then((state) => {
    updateWidth(state);
    candidateInit(state);
    keySequenceInit(state);
    actionInit();
    const history        = createHistory();
    const sagaMiddleware = createSagaMiddleware();
    const middleware     = applyMiddleware(sagaMiddleware, routerMiddleware(history));
    const store          = createStore(reducers, state, middleware);
    const container      = document.getElementById('container');
    const element = (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Switch>
            <Route default component={Popup} />
          </Switch>
        </ConnectedRouter>
      </Provider>
    );
    return appStart(container, element, sagaMiddleware, rootSaga);
  });
}

export { stop };

export default start();
