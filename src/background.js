import browser from 'webextension-polyfill';
import logger from 'kiroku';
import commands, { search } from './commands';

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

browser.commands.onCommand.addListener((command) => {
  switch (command) {
    default:
      break;
  }
});

function postMessageToContentScript(type, payload) {
  browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
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
    case 'QUERY':
      break;
    case 'COMMAND':
      if (commands.includes(payload)) {
        postMessageToContentScript('COMMAND', payload);
      } else {
        search(payload);
      }
      port.postMessage({ type: 'CLOSE' });
      break;
    default:
      break;
  }
}

browser.runtime.onConnect.addListener((port) => {
  const name = port.name;
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
      port.onMessage.removeListener(handlePopupMessage);
    });
    port.onMessage.addListener(handlePopupMessage);
  }
  logger.info(`There are ${Object.values(contentScriptPorts).length} channel`);
});

logger.info('bebop is initialized.');
