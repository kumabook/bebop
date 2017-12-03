import test from 'ava';
import { delay } from 'redux-saga';
import { put, call } from 'redux-saga/effects';
import {
  debounceDelayMs,
  dispatchEmptyQuery,
  searchCandidates,
} from '../../src/sagas/popup';
import commands from '../../src/commands';

test('dispatchEmptyQuery saga', (t) => {
  const gen = dispatchEmptyQuery();
  t.deepEqual(gen.next().value, put({ type: 'QUERY', payload: '' }));
});

test('searchCandidates saga', (t) => {
  const gen = searchCandidates({ payload: '' });
  t.deepEqual(gen.next().value, call(delay, debounceDelayMs));
  t.deepEqual(gen.next().value, call(commands.candidates, ''));
  t.deepEqual(gen.next().value, put({ type: 'CANDIDATES', payload: undefined }));
});
