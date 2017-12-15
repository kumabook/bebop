import test from 'ava';
import nisemono from 'nisemono';
import ReactTestUtils from 'react-dom/test-utils';
import '../src/popup';

const WAIT_MS = 100;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const { close } = window;

function setup() {
  document.scrollingElement = { scrollTo: nisemono.func() };
  nisemono.expects(document.scrollingElement.scrollTo).returns();
  window.close = nisemono.func();
}

function restore() {
  document.scrollingElement = null;
  window.close = close;
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
  ReactTestUtils.Simulate.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
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
