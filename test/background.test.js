import test from 'ava';
import browser from 'webextension-polyfill';
import {
  init,
  getContentScriptPorts,
  getPopupPorts,
  messageListener,
  commandListener,
  storageChangedListener,
} from '../src/background';
import { getPopupWindow } from '../src/popup_window';
import createPort from './create_port';

const delay  = ms => new Promise(resolve => setTimeout(resolve, ms));

const { onConnect, onMessage }      = browser.runtime;
const { onCommand }                 = browser.commands;
const { onFocusChanged }            = browser.windows;
const { onActivated, onRemoved }    = browser.tabs;
const { onChanged }                 = browser.storage;

const onConnectPort      = createPort();
const onMessagePort      = createPort();
const onCommandPort      = createPort();
const onRemovedPort      = createPort();
const onFocusChangedPort = createPort();
const onActivatedPort    = createPort();
const onChangedPort      = createPort();

async function setup() {
  browser.runtime.onConnect      = onConnectPort.onMessage;
  browser.runtime.onMessage      = onMessagePort.onMessage;
  browser.commands.onCommand     = onCommandPort.onMessage;
  browser.windows.onFocusChanged = onFocusChangedPort.onMessage;
  browser.tabs.onActivated       = onActivatedPort.onMessage;
  browser.tabs.onRemoved         = onRemovedPort.onMessage;
  browser.storage.onChanged      = onChangedPort.onMessage;
  init();
  delay(10);
}

function restore() {
  browser.runtime.onConnect      = onConnect;
  browser.runtime.onMessage      = onMessage;
  browser.commands.onCommand     = onCommand;
  browser.windows.onFocusChanged = onFocusChanged;
  browser.tabs.onActivated       = onActivated;
  browser.tabs.onRemoved         = onRemoved;
  browser.storage.onChanged      = onChanged;
}

test.before(setup);
test.after(restore);

test.serial('background', (t) => {
  t.pass();
});

test.serial('onCommand listener execute toggle_popup_window', (t) => {
  const promises =  onCommandPort.messageListeners.map((l) => {
    l('toggle_popup_window');
    return delay(10).then(() => t.truthy(getPopupWindow()));
  });
  return Promise.all(promises);
});

test.serial('onCommand listener do nothing', (t) => {
  onCommandPort.messageListeners.forEach((l) => {
    l('unknown_command');
    t.pass();
  });
});

test.serial('handle ACTIVE_CONTENT_TAB message', (t) => {
  onMessagePort.messageListeners.forEach((l) => {
    l({ type: 'ACTIVE_CONTENT_TAB' });
    t.pass();
  });
});

test.serial('handle tabs.onActivated event', (t) => {
  onActivatedPort.messageListeners.forEach((l) => {
    l({ tabId: 1, windowId: 1 });
    t.pass();
  });
});

test.serial('handle window focus changed event', (t) => {
  onFocusChangedPort.messageListeners.forEach((l) => {
    l(1);
    l(2);
    t.pass();
  });
});

test.serial('manage content script ports', (t) => {
  let contentDisconnectHandler = null;
  let popupDisconnectHandler = null;
  onConnectPort.messageListeners.forEach((l) => {
    l({
      name:         'content-script-0000',
      onDisconnect: {
        addListener: (listener) => {
          contentDisconnectHandler = listener;
        },
      },
      onMessage: {
        addListener:    () => {},
        removeListener: () => {},
      },
    });
    l({
      name:         'popup-0000',
      onDisconnect: {
        addListener: (listener) => {
          popupDisconnectHandler = listener;
        },
      },
      onMessage: {
        addListener:    () => {},
        removeListener: () => {},
      },
    });
  });
  t.is(getPopupPorts().length, 1);
  t.is(getContentScriptPorts().length, 1);

  popupDisconnectHandler();
  contentDisconnectHandler();

  t.is(getPopupPorts().length, 0);
  t.is(getContentScriptPorts().length, 0);
});

test('messageListener', (t) => {
  messageListener({ type: 'SEND_MESSAGE_TO_ACTIVE_CONTENT_TAB' });
  messageListener({ type: 'SEARCH_CANDIDATES', payload: '' });
  messageListener({
    type:    'EXECUTE_ACTION',
    payload: {
      actionId:   'google-search',
      candidates: [],
    },
  });
  t.pass();
});

test('commandListener', (t) => {
  commandListener('toggle_popup_window');
  commandListener('toggle_content_popup');
  t.pass();
});

test('storageChangedListener', async (t) => {
  await storageChangedListener();
  t.pass();
});
