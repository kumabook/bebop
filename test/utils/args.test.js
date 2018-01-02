import test from 'ava';
import {
  getArgListener,
  setPostMessageFunction,
  requestArg,
} from '../../src/utils/args';

test('getArgListener returns arg listener', (t) => {
  const listener = getArgListener();
  t.truthy(listener);
});

test('requestArg calls postMessage', t => new Promise((resolve) => {
  setPostMessageFunction(resolve);
  requestArg({ type: 'number', title: 'title' });
  t.pass();
}));
