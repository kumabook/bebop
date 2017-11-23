import 'regenerator-runtime/runtime';
import React         from 'react';
import ReactDOM      from 'react-dom';
import createHistory from 'history/createHashHistory';
import {
  Provider,
}  from 'react-redux';
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

import Popup from './containers/Popup';
import reducers from './reducers/popup';
import rootSaga from './sagas/popup';

const history = createHistory();
const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducers, applyMiddleware(sagaMiddleware,
                                                    routerMiddleware(history)));
sagaMiddleware.run(rootSaga);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <HashRouter>
        <Switch>
          <Route default component={Popup} />
        </Switch>
      </HashRouter>
    </ConnectedRouter>
  </Provider>, document.getElementById('container'));
