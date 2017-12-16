import 'regenerator-runtime/runtime';
import browser       from 'webextension-polyfill';
import React         from 'react';
import ReactDOM      from 'react-dom';
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

if (process.env.NODE_ENV === 'production') {
  logger.setLevel('INFO');
}

export function start() {
  return browser.storage.local.get().then((state) => {
    const container = document.getElementById('container');
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(reducers, state, applyMiddleware(sagaMiddleware));
    const task = sagaMiddleware.run(rootSaga);
    const element = (
      <Provider store={store}>
        <Options />
      </Provider>
    );
    ReactDOM.render(element, document.getElementById('container'));
    return { container, task };
  });
}

export function stop({ container, task }) {
  ReactDOM.unmountComponentAtNode(container);
  task.cancel();
}

window.onload = () => start();
