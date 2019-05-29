import test from 'ava';
import ReactTestUtils from 'react-dom/test-utils';
import app, { start, stop } from '../src/options_ui';

const WAIT_MS = 250;
const delay  = ms => new Promise(resolve => setTimeout(resolve, ms));

app.then(a => stop(a)); // stop default app
let optionsUI = null;

const { getBoundingClientRect } =  Element.prototype;

function dispatchEvent(name, node, x, y) {
  const event = document.createEvent('MouseEvents');
  event.initMouseEvent(
    name, true, true, window, 0,
    x, y, x, y,
    false, false, false, false, 0,
    null,
  );
  node.dispatchEvent(event);
}

async function setup() {
  optionsUI = await start();
  Element.prototype.getBoundingClientRect = () => ({
    top:    0,
    left:   0,
    bottom: 10,
    right:  10,
    width:  10,
    height: 10,
  });
}

function restore() {
  stop(optionsUI);
  Element.prototype.getBoundingClientRect = getBoundingClientRect;
}

test.beforeEach(setup);
test.afterEach(restore);

test.serial('options_ui succeeds in rendering html', async (t) => {
  await delay(WAIT_MS);
  const { document } = window;
  const options = document.querySelector('div.options');
  t.truthy(options !== null);
  await delay(WAIT_MS);
});

test.serial('options_ui changes popup width', async (t) => {
  await delay(WAIT_MS);
  const { document } = window;
  const input = document.querySelector('.popupWidthInput');
  input.value = 500;
  ReactTestUtils.Simulate.change(input);
  t.pass();
  await delay(WAIT_MS);
});

test.serial('options_ui changes order of candidates', async (t) => {
  await delay(WAIT_MS);
  const { document } = window;
  const item = document.querySelector('.sortableListItem');
  t.truthy(item !== null);
  const { top: x, left: y } = item.getBoundingClientRect();
  dispatchEvent('mousedown', item, x, y);
  dispatchEvent('mousemove', item, x, y + 10);
  dispatchEvent('mouseup', item, x, y + 20);
  t.pass();
  await delay(WAIT_MS);
});

test.serial('options_ui changes max results for empty query', async (t) => {
  await delay(WAIT_MS);
  const { document } = window;
  const input = document.querySelector('.maxResultsInput');
  input.value = 10;
  ReactTestUtils.Simulate.change(input);
  t.pass();
  await delay(WAIT_MS);
});

test.serial('options_ui enable C-j,k move ', async (t) => {
  await delay(WAIT_MS);
  const { document } = window;
  const checkbox = document.querySelector('.cjkMoveCheckbox');
  ReactTestUtils.Simulate.change(checkbox, { target: { checked: true } });
  t.pass();
  await delay(WAIT_MS);
});

test.serial('options_ui change theme', async (t) => {
  await delay(WAIT_MS);
  const { document } = window;
  const select = document.querySelector('.themeSelect');
  const theme = 'some-theme-value';
  ReactTestUtils.Simulate.change(select, { target: { value: theme } });
  t.pass();
  await delay(WAIT_MS);
});
