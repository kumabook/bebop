import test      from 'ava';
import { mount } from 'enzyme';
import React     from 'react';

import Candidate from '../../src/components/Candidate';

const noop = () => {};
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

test('<Candidate isSelected=false />', (t) => {
  const item = {
    id:    '1',
    label: 'label',
    type:  'content',
    name:  'name',
  };
  const element = <Candidate isSelected={false} item={item} onClick={noop} />;
  const wrapper = mount(element);
  t.deepEqual(wrapper.find('div.candidate').length, 1);
  t.deepEqual(wrapper.find('div.candidate.selected').length, 0);
});

test('<Candidate isSelected=true />', (t) => {
  const item = {
    id:    '1',
    label: 'label',
    type:  'content',
    name:  'name',
  };
  const element = <Candidate isSelected item={item} onClick={noop} />;
  const wrapper = mount(element);
  t.is(wrapper.find('div.candidate').length, 1);
  t.is(wrapper.find('div.candidate.selected').length, 1);
  return delay(500);
});
