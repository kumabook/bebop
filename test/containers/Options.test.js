import test            from 'ava';
import { mount }       from 'enzyme';
import React           from 'react';
import { Provider }    from 'react-redux';
import { createStore } from 'redux';

import Options from '../../src/containers/Options';
import reducers from '../../src/reducers/options';

const store = createStore(reducers);

const element = (
  <Provider store={store}>
    <Options />
  </Provider>
);

test('<Popup />', (t) => {
  const wrapper = mount(element);
  t.is(wrapper.find('div.options').length, 1);
  t.is(wrapper.find('input.popupWidthInput').length, 1);
});
