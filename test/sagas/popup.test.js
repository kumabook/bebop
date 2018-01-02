import test from 'ava';
import { delay } from 'redux-saga';
import { put, call, select } from 'redux-saga/effects';
import {
  debounceDelayMs,
  dispatchEmptyQuery,
  searchCandidates,
  modeSelector,
  candidateSelector,
  executeAction,
  normalizeCandidate,
  getTargetCandidates,
} from '../../src/sagas/popup';

const items = [{
  id:         'google-search-test',
  label:      'test Search with Google',
  type:       'search',
  args:       ['test'],
  faviconUrl: null,
}];

test('dispatchEmptyQuery saga', (t) => {
  const gen = dispatchEmptyQuery();
  t.deepEqual(gen.next().value, put({ type: 'QUERY', payload: '' }));
});

test('searchCandidates saga', (t) => {
  const gen = searchCandidates({ payload: '' });
  t.deepEqual(gen.next().value, call(delay, debounceDelayMs));
  t.deepEqual(gen.next().value, select(candidateSelector));
  t.deepEqual(gen.next().value, select(modeSelector));
});

test('executeAction', (t) => {
  const action = { handler: () => Promise.resolve() };
  const gen = executeAction(action, items);
  gen.next();
  gen.next();
  t.pass();

  const noActionGen = executeAction(null, items);
  noActionGen.next();
  t.pass();
});

test('normalizeCandidate', (t) => {
  const noCandidateGen = normalizeCandidate(null);
  t.deepEqual(noCandidateGen.next().value, null);

  const gen = normalizeCandidate({ type: 'test' });
  t.deepEqual(gen.next().value, { type: 'test' });
});

test('getTargetCandidates', (t) => {
  const markedCandidateIds = { 'google-search-test': true };
  const gen = getTargetCandidates({ markedCandidateIds, items, index: 0 });
  t.deepEqual(gen.next().value, items);
});
