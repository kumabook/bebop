import browser from 'webextension-polyfill';
import logger from 'kiroku';
import { init as commandInit, find as findCommand } from './commands';
import { search, highlight, dehighlight } from './link';

const portName = `content-script-${window.location.href}`;
let port = null;
if (process.env.NODE_ENV === 'production') {
  logger.setLevel('INFO');
}

function executeCommand(commandName, candidates) {
  const command = findCommand(commandName);
  if (command && command.contentHandler) {
    const f = command.contentHandler;
    return f.call(this, candidates);
  }
  return Promise.resolve();
}

function handleExecuteCommand(payload) {
  const { commandName, candidates } = payload;
  return executeCommand(commandName, candidates);
}

function handleCandidateChange(candidate) {
  dehighlight();
  if (!candidate || candidate.type !== 'link') {
    highlight();
  } else {
    highlight(candidate.args[0]);
  }
}

function handleClose() {
  dehighlight();
}

function portMessageListener(msg) {
  const { type, payload, targetUrl } = msg;
  if (targetUrl !== window.location.href && type === 'SELECT_CANDIDATE') {
    logger.trace('This content script is not active.');
    return;
  }
  logger.trace(`Handle message ${type} ${JSON.stringify(payload)}`);
  switch (type) {
    case 'POPUP_CLOSE':
      handleClose();
      break;
    default:
      break;
  }
}

function messageListener(request, sender, sendResponse) {
  switch (request.type) {
    case 'FETCH_LINKS':
      sendResponse(search(request.payload));
      break;
    case 'CHANGE_CANDIDATE':
      handleCandidateChange(request.payload);
      break;
    case 'EXECUTE_COMMAND':
      sendResponse(handleExecuteCommand(request.payload));
      break;
    default:
      break;
  }
}

setTimeout(() => {
  port = browser.runtime.connect({ name: portName });
  port.onMessage.addListener(portMessageListener);
  const disconnectListener = () => {
    port.onMessage.removeListener(messageListener);
    port.onDisconnect.removeListener(disconnectListener);
  };
  port.onDisconnect.addListener(disconnectListener);
  browser.runtime.onMessage.addListener(messageListener);
  logger.info('bebop content_script is loaded');
}, 500);
commandInit();
