import test from 'ava';
import nisemono from 'nisemono';
import {
  getActiveContentTab,
  sendMessageToActiveContentTab,
  sendMessageToActiveContentTabViaBackground,
} from '../../src/utils/tabs';
import { onTabActived } from '../../src/popup_window';

const { browser } = global;
const { get, query, sendMessage }   = browser.tabs;
const { sendMessage: sendMessageToRuntime } = browser.runtime;

function setup(tabs) {
  browser.tabs.get = nisemono.func();
  browser.tabs.query = nisemono.func();
  browser.tabs.sendMessage = nisemono.func();
  browser.runtime.sendMessage = nisemono.func();
  nisemono.expects(browser.tabs.query).resolves(tabs);
  nisemono.expects(browser.tabs.sendMessage).resolves();
  nisemono.expects(browser.runtime.sendMessage).resolves(tabs[0]);
}

function restore() {
  browser.tabs.get = get;
  browser.tabs.query = query;
  browser.tabs.sendMessage = sendMessage;
  browser.runtime.sendMessage = sendMessageToRuntime;
}

test.afterEach(() => {
  restore();
});

test('getActiveContentTab returns active content tab id', (t) => {
  setup([{ id: 1 }]);
  nisemono.expects(browser.tabs.get).resolves({ id: 1 });
  onTabActived({ tabId: 1 });
  return getActiveContentTab().then(tab => t.is(tab.id, 1));
});

test('getActiveContentTab returns active tab id if no content tab', (t) => {
  setup([{ id: 1 }]);
  nisemono.expects(browser.tabs.get).resolves(null);
  onTabActived({});
  return getActiveContentTab().then(tab => t.is(tab.id, 1));
});

test('getActiveContentTab returns null if there is no active tab', (t) => {
  setup([]);
  return getActiveContentTab().then(tab => t.is(tab, null));
});

test('sendMessageToActiveContentTab send message to active tab', (t) => {
  setup([{ id: 1 }]);
  return sendMessageToActiveContentTab({ type: 'MESSAGE_TYPE' }).then(() => {
    t.is(browser.tabs.sendMessage.calls.length, 1);
  });
});

test('sendMessageToActiveContentTabViaBackground send message to active tab', (t) => {
  setup([{ id: 1 }]);
  return sendMessageToActiveContentTabViaBackground({ type: 'MESSAGE_TYPE' }).then(() => {
    t.is(browser.runtime.sendMessage.calls.length, 1);
  });
});
