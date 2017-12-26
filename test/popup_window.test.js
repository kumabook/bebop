import test from 'ava';
import {
  toggle,
  getPopupWindow,
  getActiveTabId,
  onTabRemoved,
  onTabActivated,
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

test.serial('onTabRemoved removes popup window', async (t) => {
  t.falsy(getPopupWindow());
  toggle();
  await delay();
  t.truthy(getPopupWindow());
  await delay();
  onTabRemoved(1, { windowId: 1 });
  await delay();
  t.falsy(getPopupWindow());
});

test.serial('onTabActivated update activeTabId', async (t) => {
  t.falsy(getActiveTabId());
  onTabActivated({ tabId: 1, windowId: 2 });
  await delay();
  t.is(getActiveTabId(), 1);
  await delay();
  onTabRemoved(1, { windowId: 1 });
  await delay();
  t.falsy(getActiveTabId());
});
