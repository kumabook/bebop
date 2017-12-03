import test from 'ava';
import { JSDOM } from 'jsdom';
import keySequence from '../src/key_sequences';

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
function code(c) {
  return c.toUpperCase().charCodeAt(0);
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

const up = 38;

test('keySequence returns key sequences from keyEvent', (t) => {
  const s = true;
  const c = true;
  const m = true;
  t.is(keySequence(key(code('a'))), 'a');
  t.is(keySequence(key(code('a'), { s })), 'S-a');
  t.is(keySequence(key(code('a'), { c })), 'C-a');
  t.is(keySequence(key(code('a'), { m })), 'M-a');
  t.is(keySequence(key(code('a'), { c, m })), 'C-M-a');
  t.is(keySequence(key(up)), 'up');
  t.is(keySequence(key(up, { s })), 'S-up');
});
