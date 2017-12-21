import browser from 'webextension-polyfill';
import logger from 'kiroku';
import {
  toggle as togglePopupWindow,
  onWindowRemoved,
  onWindowFocusChanged,
  onTabActived,
} from './utils/popup_window';

const contentScriptPorts = {};
const popupPorts         = {};

if (process.env.NODE_ENV === 'production') {
  logger.setLevel('INFO');
}
logger.info(`bebop starts initialization. log level ${logger.getLevel()}`);

function getContentScriptPorts() {
  return Object.values(contentScriptPorts);
}

function getPopupPorts() {
  return Object.values(popupPorts);
}

function postMessageToContentScript(type, payload) {
  const currentWindow = true;
  const active        = true;
  return browser.tabs.query({ currentWindow, active }).then((tabs) => {
    if (tabs.length > 0) {
      const targetUrl = tabs[0].url;
      getContentScriptPorts().forEach(p => p.postMessage({
        type,
        payload,
        targetUrl,
      }));
    }
  });
}

function handleContentScriptMessage() {}

browser.windows.onRemoved.addListener(onWindowRemoved);
browser.windows.onFocusChanged.addListener(onWindowFocusChanged);

browser.runtime.onConnect.addListener((port) => {
  const { name } = port;
  logger.info(`connect channel: ${name}`);
  if (name.startsWith('content-script')) {
    contentScriptPorts[name] = port;
    port.onDisconnect.addListener(() => {
      delete contentScriptPorts[name];
      port.onMessage.removeListener(handleContentScriptMessage);
    });
    port.onMessage.addListener(handleContentScriptMessage);
  } else if (name.startsWith('popup')) {
    popupPorts[name] = port;
    port.onDisconnect.addListener(() => {
      delete popupPorts[name];
      postMessageToContentScript('POPUP_CLOSE');
    });
  }
  logger.info(`There are ${Object.values(contentScriptPorts).length} channel`);
});

browser.tabs.onActivated.addListener((payload) => {
  getPopupPorts().forEach(p => p.postMessage({
    type: 'TAB_CHANGED',
    payload,
  }));
  setTimeout(() => onTabActived(payload), 10);
});

browser.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'toggle_popup_window':
      togglePopupWindow();
      break;
    default:
      break;
  }
});

logger.info('bebop is initialized.');
