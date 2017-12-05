import browser from 'webextension-polyfill';
import logger from 'kiroku';
import { init as commandInit, get as getCommand } from './commands';

const contentScriptPorts = {};
const popupPorts         = {};

if (process.env.NODE_ENV === 'production') {
  logger.setLevel('INFO');
}
logger.info(`bebop starts initialization. log level ${logger.getLevel()}`);
function getPort(name) {
  if (!name) {
    return null;
  }
  if (name.startsWith('content-script')) {
    return contentScriptPorts[name];
  } else if (name.startsWith('popup')) {
    return popupPorts[name];
  }
  return null;
}

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

function handlePopupMessage(msg) {
  const { portName, type, payload } = msg;
  logger.info(`handlePopupMessage ${type} from ${portName}`);
  const port = getPort(portName);
  switch (type) {
    case 'SELECT_CANDIDATE': {
      const { name, args } = payload;
      const command = getCommand(name);
      port.postMessage({ type: 'CLOSE' });
      if (command && command.backgroundHandler) {
        const f = command.backgroundHandler;
        f.apply(this, args).then(() => logger.trace(`executed ${name} `));
      } else {
        logger.trace(`${name} is not defined`);
      }
      postMessageToContentScript(type, payload)
        .then(() => logger.trace(`pass ${name} to content script`));
      break;
    }
    default:
      break;
  }
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
      port.onMessage.removeListener(handlePopupMessage);
      postMessageToContentScript('POPUP_CLOSE');
    });
    port.onMessage.addListener(handlePopupMessage);
  }
  logger.info(`There are ${Object.values(contentScriptPorts).length} channel`);
});

browser.tabs.onActivated.addListener((payload) => {
  getPopupPorts().forEach(p => p.postMessage({
    type: 'TAB_CHANGED',
    payload,
  }));
});

commandInit();

logger.info('bebop is initialized.');
