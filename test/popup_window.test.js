import test from 'ava';
import {
  toggle,
  getPopupWindow,
  onWindowRemoved,
} from '../src/popup_window';

const delay  = ms => new Promise(resolve => setTimeout(resolve, ms));

test.serial('toggle removes popup window if popup window is already shown', async (t) => {
  await delay();
  t.falsy(getPopupWindow());
  toggle();
  await delay();
  t.truthy(getPopupWindow());
  toggle();
  await delay();
  t.falsy(getPopupWindow());
});

test.serial('onWindowRemoved removes popup window', async (t) => {
  t.falsy(getPopupWindow());
  toggle();
  await delay();
  t.truthy(getPopupWindow());
  await delay();
  onWindowRemoved(1);
  await delay();
  t.falsy(getPopupWindow());
});
