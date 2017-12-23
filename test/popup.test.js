import test from 'ava';
import nisemono from 'nisemono';
import ReactTestUtils from 'react-dom/test-utils';
import browser from 'webextension-polyfill';
import app, { start, stop } from '../src/popup';
import { port } from '../src/sagas/popup';
import search from '../src/candidates';

const WAIT_MS = 250;
const delay  = ms => new Promise(resolve => setTimeout(resolve, ms));
const ENTER = 13;
const SPC   = 32;

app.then(a => stop(a)); // stop default app

const { close } = window;
const { sendMessage } = browser.runtime;
let popup = null;

function code(c) {
  return c.toUpperCase().charCodeAt(0);
}

function keyDown(node, keyCode, { s = false, c = false, m = false } = {}) {
  ReactTestUtils.Simulate.keyDown(node, {
    keyCode,
    key:      keyCode,
    which:    keyCode,
    shiftKey: s,
    ctrlKey:  c,
    metaKey:  m,
  });
}

function* setup() {
  document.scrollingElement = { scrollTo: nisemono.func() };
  nisemono.expects(document.scrollingElement.scrollTo).returns();
  window.close = nisemono.func();
  browser.runtime.sendMessage = ({ type, payload }) => {
    switch (type) {
      case 'SEARCH_CANDIDATES':
        return search(payload);
      default:
        return Promise.resolve();
    }
  };
  popup = yield start();
}

function restore() {
  document.scrollingElement = null;
  window.close = close;
  browser.runtime.sendMessage = sendMessage;
  stop(popup);
}

test.beforeEach(setup);
test.afterEach(restore);

test.serial('popup succeeds in rendering html', async (t) => {
  await delay(WAIT_MS);
  const { document } = window;
  const input = document.querySelector('.commandInput');
  t.truthy(input !== null);
  const candidate = document.querySelector('.candidate');
  t.truthy(candidate !== null);
  await delay(500);
});

test.serial('popup selects a candidate by `return`', async (t) => {
  await delay(WAIT_MS);
  const { document } = window;
  const input = document.querySelector('.commandInput');
  input.value = 'aa';
  ReactTestUtils.Simulate.change(input);
  keyDown(input, ENTER);
  t.pass();
  await delay(WAIT_MS);
});

test.serial('popup selects a candidate by `click`', async (t) => {
  await delay(WAIT_MS);
  const { document } = window;
  const candidate = document.querySelector('.candidate');
  ReactTestUtils.Simulate.click(candidate);
  t.pass();
  await delay(WAIT_MS);
});

test.serial('popup selects action lists', async (t) => {
  await delay(WAIT_MS);
  const { document } = window;
  const input = document.querySelector('.commandInput');
  ReactTestUtils.Simulate.change(input);
  keyDown(input, code('i'), { c: true });
  await delay(WAIT_MS);
  keyDown(input, code('i'), { c: true });
  t.pass();
  await delay(WAIT_MS);
});


test.serial('popup selects a action and `return`', async (t) => {
  await delay(WAIT_MS);
  const { document } = window;
  const input = document.querySelector('.commandInput');
  ReactTestUtils.Simulate.change(input);
  keyDown(input, code('i'), { c: true });
  await delay(WAIT_MS);
  keyDown(input, ENTER);
  t.pass();
  await delay(WAIT_MS);
});

test.serial('popup selects a action and `click`', async (t) => {
  await delay(WAIT_MS);
  const { document } = window;
  const input = document.querySelector('.commandInput');
  ReactTestUtils.Simulate.change(input);
  keyDown(input, code('i'), { c: true });
  await delay(WAIT_MS);
  const candidate = document.querySelector('.candidate');
  ReactTestUtils.Simulate.click(candidate);
  t.pass();
  await delay(WAIT_MS);
});

test.serial('popup marks candidates', async (t) => {
  await delay(WAIT_MS);
  const { document } = window;
  const input = document.querySelector('.commandInput');
  keyDown(input, SPC, { c: true });
  await delay(WAIT_MS);
  const candidate = document.querySelector('.candidate.marked');
  t.truthy(candidate !== null);
  await delay(WAIT_MS);
});

test.serial('popup cannot marks actions', async (t) => {
  await delay(WAIT_MS);
  const { document } = window;
  const input = document.querySelector('.commandInput');
  keyDown(input, code('i'), { c: true });
  await delay(WAIT_MS);
  keyDown(input, SPC, { c: true });
  await delay(WAIT_MS);
  const markedCandidate = document.querySelector('.candidate.marked');
  t.truthy(markedCandidate === null);
  await delay(WAIT_MS);
});

test.serial('popup handles TAB_CHANGED action and close', async (t) => {
  await delay(WAIT_MS);
  port.messageListeners.forEach((l) => {
    l({ type: 'TAB_CHANGED' });
  });
  t.pass();
  await delay(WAIT_MS);
});

test.serial('popup handles TAB_CHANGED action re-focus', async (t) => {
  await delay(WAIT_MS);
  port.messageListeners.forEach((l) => {
    l({ type: 'TAB_CHANGED', payload: { canFocusToPopup: true } });
  });
  t.pass();
  await delay(WAIT_MS);
});


test.serial('popup handles QUIT action re-focus', async (t) => {
  await delay(WAIT_MS);
  port.messageListeners.forEach((l) => {
    l({ type: 'QUIT' });
  });
  t.true(window.close.isCalled);
  await delay(WAIT_MS);
});
