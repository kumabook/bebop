import test from 'ava';
import { delay } from 'redux-saga';
import { put, call, select } from 'redux-saga/effects';
import {
  debounceDelayMs,
  dispatchEmptyQuery,
  searchCandidates,
  candidateSelector,
  executeCommand,
} from '../../src/sagas/popup';
import candidates from '../../src/candidates';

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

test('executeCommand', (t) => {
  const command = { handler: () => Promise.resolve() };
  const gen = executeCommand(command, items);
  gen.next();
  gen.next();
  t.pass();

  const noCommandGen = executeCommand(null, items);
  noCommandGen.next();
  t.pass();
});

test('normalizeCandidate', (t) => {
  const noCandidateGen = normalizeCandidate(null);
  t.deepEqual(noCandidateGen.next().value, null);

  const gen = normalizeCandidate({ type: 'test' });
  t.deepEqual(gen.next().value, { type: 'test' });
});

