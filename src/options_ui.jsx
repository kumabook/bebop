import 'regenerator-runtime/runtime';
import browser from 'webextension-polyfill';
import React   from 'react';
import {
  Provider,
}  from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import {
  applyMiddleware,
  createStore,
} from 'redux';
import logger from 'kiroku';

import Options from './containers/Options';
import reducers from './reducers/options';
import rootSaga from './sagas/options';
import { start as appStart, stop } from './utils/app';

if (process.env.NODE_ENV === 'production') {
  logger.setLevel('INFO');
}

export function start() {
  return browser.storage.local.get().then((state) => {
    const container = document.getElementById('container');
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(reducers, state, applyMiddleware(sagaMiddleware));
    const element = (
      <Provider store={store}>
        <Options />
      </Provider>
    );
    return appStart(container, element, sagaMiddleware, rootSaga);
  });
}

export { stop };

window.onload = start;
