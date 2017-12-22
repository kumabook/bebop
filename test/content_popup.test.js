import test from 'ava';
import {
  toggle,
  hasPopup,
  messageListener,
} from '../src/content_popup';

const delay  = ms => new Promise(resolve => setTimeout(resolve, ms));

test.serial('toggle toggles popup from content', async (t) => {
  await delay();
  t.falsy(hasPopup());
  toggle();
  await delay();
  t.truthy(hasPopup());
  toggle();
  await delay();
  t.falsy(hasPopup());
});

test.serial('messageListener handles message if origin is not extension url', (t) => {
  const data        = JSON.stringify({ type: 'CLOSE' });
  const unknownData = JSON.stringify({ type: 'UNKNOWN' });
  messageListener({ origin: 'http://example.com', data });
  messageListener({ origin: 'http://example.com', data: unknownData });
  messageListener({ origin: 'chrome-extension://xxxxx/popup/index.html', data });
  messageListener({ origin: 'chrome-extension://xxxxx/popup/index.html', data: unknownData });
  t.pass();
});
