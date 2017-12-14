import test      from 'ava';
import { mount } from 'enzyme';
import React     from 'react';

import Candidate from '../../src/components/Candidate';

const noop = () => {};

const item = {
  id:    '1',
  label: 'label',
  type:  'content',
  name:  'name',
};

test('<Candidate isSelected=true isMarked=true />', (t) => {
  const element = <Candidate isSelected isMarked item={item} onClick={noop} />;
  const wrapper = mount(element);
  t.is(wrapper.find('div.candidate').length, 1);
  t.is(wrapper.find('div.candidate.selected').length, 1);
  t.is(wrapper.find('div.candidate.marked').length, 1);
});

test('<Candidate />', (t) => {
  const element = <Candidate isSelected={false} isMarked={false} item={item} onClick={noop} />;
  const wrapper = mount(element);
  t.is(wrapper.find('div.candidate').length, 1);
  t.is(wrapper.find('div.candidate.selected').length, 0);
  t.is(wrapper.find('div.candidate.marked').length, 0);
});

test('<Candidate isSelected=true />', (t) => {
  const element = <Candidate isSelected isMarked={false} item={item} onClick={noop} />;
  const wrapper = mount(element);
  t.is(wrapper.find('div.candidate').length, 1);
  t.is(wrapper.find('div.candidate.selected').length, 1);
  t.is(wrapper.find('div.candidate.marked').length, 0);
});

test('<Candidate isMarked=true />', (t) => {
  const element = <Candidate isSelected={false} isMarked item={item} onClick={noop} />;
  const wrapper = mount(element);
  t.is(wrapper.find('div.candidate').length, 1);
  t.is(wrapper.find('div.candidate.selected').length, 0);
  t.is(wrapper.find('div.candidate.marked').length, 1);
});
