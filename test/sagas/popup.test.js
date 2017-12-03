import test from 'ava';
import { put } from 'redux-saga/effects';
import { dispatchEmptyQuery } from '../../src/sagas/popup';

test('dispatchEmptyQuery saga', (t) => {
  const gen = dispatchEmptyQuery();
  t.deepEqual(gen.next().value, put({ type: 'QUERY', payload: '' }));
});
