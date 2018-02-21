import test                 from 'ava';
import { mount }            from 'enzyme';
import React                from 'react';
import createHistory from 'history/createHashHistory';
import { Provider } from 'react-redux';
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

import Popup from '../../src/containers/Popup';
import reducers from '../../src/reducers/popup';

const history = createHistory();
const store = createStore(reducers, applyMiddleware(routerMiddleware(history)));
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

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

test('<Popup />', async (t) => {
  const wrapper = mount(element);
  await delay(500);
  t.is(wrapper.find('form.commandForm').length, 1);
  t.is(wrapper.find('input.commandInput').length, 1);
  t.is(wrapper.find('ul.candidatesList').length, 1);
});
