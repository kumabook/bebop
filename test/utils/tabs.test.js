import test from 'ava';
import nisemono from 'nisemono';
import { getActiveTabId, sendMessageToActiveTab } from '../../src/utils/tabs';

const { browser } = global;
const { query, sendMessage }   = browser.tabs;
function setup(tabs) {
  browser.tabs.query = nisemono.func();
  browser.tabs.sendMessage = nisemono.func();
  nisemono.expects(browser.tabs.query).resolves(tabs);
  nisemono.expects(browser.tabs.sendMessage).resolves();
}

function restore() {
  browser.tabs.query = query;
  browser.tabs.sendMessage = sendMessage;
}

test.afterEach(() => {
  restore();
});

test('getActiveTabId returns active tab id', (t) => {
  setup([{ id: 1 }]);
  return getActiveTabId().then(tabId => t.is(tabId, 1));
});
test('getActiveTabId returns null if there is no active tab', (t) => {
  setup([]);
  return getActiveTabId().then(tabId => t.is(tabId, null));
});

test('sendMessageToActiveTab send message to active tab', (t) => {
  setup([{ id: 1 }]);
  return sendMessageToActiveTab({ type: 'MESSAGE_TYPE' }).then(() => {
    t.is(browser.tabs.sendMessage.calls.length, 1);
  });
});
