import test from 'ava';
import { delay } from 'redux-saga';
import { put, call, select } from 'redux-saga/effects';
import {
  debounceDelayMs,
  dispatchAction,
  dispatchEmptyQuery,
  searchCandidates,
  handleKeySequece,
  candidateSelector,
} from '../../src/sagas/popup';
import candidates from '../../src/candidates';

test('dispatchAction saga', (t) => {
  const gen = dispatchAction('TEST', {})();
  t.deepEqual(gen.next().value, put({ type: 'TEST', payload: {} }));
});

test('dispatchEmptyQuery saga', (t) => {
  const gen = dispatchEmptyQuery();
  t.deepEqual(gen.next().value, put({ type: 'QUERY', payload: '' }));
});

test('searchCandidates saga', (t) => {
  const gen = searchCandidates({ payload: '' });
  t.deepEqual(gen.next().value, call(delay, debounceDelayMs));
  t.deepEqual(gen.next().value, select(candidateSelector));
  t.deepEqual(gen.next().value, call(candidates, ''));
  t.deepEqual(gen.next().value, put({ type: 'CANDIDATES', payload: undefined }));
});

test('handleKeySequece saga', (t) => {
  const noCommandGen = handleKeySequece({ payload: 'a' });
  t.deepEqual(noCommandGen.next(), { done: true, value: undefined });

  const nextGen = handleKeySequece({ payload: 'C-n' });
  nextGen.next();
  t.deepEqual(nextGen.next(), { done: true, value: undefined });

  const deleteGen = handleKeySequece({ payload: 'C-h' });
  deleteGen.next();
  t.deepEqual(deleteGen.next().value, put({ type: 'QUERY', payload: '' }));
  t.deepEqual(deleteGen.next(), { done: true, value: undefined });
});
