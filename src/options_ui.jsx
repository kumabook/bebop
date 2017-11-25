import 'regenerator-runtime/runtime';
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

const sagaMiddleware = createSagaMiddleware();

const store = createStore(reducers, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga);

const element = (
  <Provider store={store}>
    <Options />
  </Provider>
);

ReactDOM.render(element, document.getElementById('container'));
