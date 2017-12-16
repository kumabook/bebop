import 'regenerator-runtime/runtime';
import browser       from 'webextension-polyfill';
import React         from 'react';
import createHistory from 'history/createHashHistory';
import {
  Provider,
} from 'react-redux';
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
  HashRouter,
  Switch,
  Route,
} from 'react-router-dom';
import logger from 'kiroku';

import Popup from './containers/Popup';
import reducers from './reducers/popup';
import rootSaga from './sagas/popup';
import { init as candidateInit } from './candidates';
import { init as commandInit } from './commands';
import { start as appStart, stop } from './utils/app';

if (process.env.NODE_ENV === 'production') {
  logger.setLevel('INFO');
}

function updateWidth({ popupWidth }) {
  const width = popupWidth || 700;
  document.body.style.width = `${width}px`;
}

export function start() {
  return browser.storage.local.get().then((state) => {
    updateWidth(state);
    candidateInit(state.orderOfCandidates);
    commandInit();
    const history        = createHistory();
    const sagaMiddleware = createSagaMiddleware();
    const middleware     = applyMiddleware(sagaMiddleware, routerMiddleware(history));
    const store          = createStore(reducers, state, middleware);
    const container      = document.getElementById('container');
    const element = (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <HashRouter>
            <Switch>
              <Route default component={Popup} />
            </Switch>
          </HashRouter>
        </ConnectedRouter>
      </Provider>
    );
    return appStart(container, element, sagaMiddleware, rootSaga);
  });
}

export { stop };

window.onload = start;
