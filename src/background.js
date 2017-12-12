import browser from 'webextension-polyfill';
import logger from 'kiroku';

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

browser.commands.onCommand.addListener((command) => {
  switch (command) {
    default:
      break;
  }
});

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

function handleContentScriptMessage() {
}

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
    browser.runtime.getPlatformInfo().then(payload => port.postMessage({
      type: 'PLATFORM_INFO',
      payload,
    }));
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
});

logger.info('bebop is initialized.');
