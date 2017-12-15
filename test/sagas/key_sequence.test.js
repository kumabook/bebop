import test from 'ava';
import { put } from 'redux-saga/effects';
import {
  dispatchAction,
  handleKeySequece,
} from '../../src/sagas/key_sequence';

test('dispatchAction saga', (t) => {
  const gen = dispatchAction('TEST', {})();
  t.deepEqual(gen.next().value, put({ type: 'TEST', payload: {} }));
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
