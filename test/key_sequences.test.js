import test from 'ava';
import { JSDOM } from 'jsdom';
import keySequence from '../src/key_sequences';

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
function code(c) {
  return c.charCodeAt(0);
}

function key(k, { s = false, c = false, m = false } = {}) {
  const { window: { KeyboardEvent } } = jsdom;
  return new KeyboardEvent('keydown', {
    keyCode:  k,
    shiftKey: s,
    ctrlKey:  c,
    metaKey:  m,
  });
}

test('keySequence returns key sequences from keyEvent', (t) => {
  t.is(keySequence(key(code('a'))), 'a');
  t.is(keySequence(key(code('a'), { c: true })), 'C-a');
  t.is(keySequence(key(code('a'), { m: true })), 'M-a');
});
