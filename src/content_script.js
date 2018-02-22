import browser from 'webextension-polyfill';
import logger from 'kiroku';
import { toggle } from './content_popup';
import { init as actionInit, find as findAction } from './actions';
import { search, highlight, dehighlight } from './link';

const portName = `content-script-${window.location.href}`;
let port = null;
if (process.env.NODE_ENV === 'production') {
  logger.setLevel('FATAL');
}

export function executeAction(actionId, candidates) {
  const action = findAction(actionId);
  if (action && action.contentHandler) {
    const f = action.contentHandler;
    return f.call(this, candidates);
  }
  return Promise.resolve();
}

function handleExecuteAction({ actionId, candidates }) {
  return executeAction(actionId, candidates);
}

function handleCandidateChange(candidate) {
  dehighlight();
  if (!candidate || candidate.type !== 'link') {
    highlight();
  } else {
    highlight(candidate.args[0]);
  }
  return Promise.resolve();
}

function handleClose() {
  dehighlight();
}

async function handleTogglePopup() {
  await toggle();
}

export function portMessageListener(msg) {
  const { type, payload } = msg;
  logger.trace(`Handle message ${type} ${JSON.stringify(payload)}`);
  switch (type) {
    case 'POPUP_CLOSE':
      handleClose();
      break;
    default:
      break;
  }
}

export function messageListener(request) {
  switch (request.type) {
    case 'FETCH_LINKS':
      return Promise.resolve(search(request.payload));
    case 'CHANGE_CANDIDATE':
      return handleCandidateChange(request.payload);
    case 'EXECUTE_ACTION':
      return handleExecuteAction(request.payload);
    case 'TOGGLE_POPUP':
      return handleTogglePopup(request.payload);
    default:
      return null;
  }
}

setTimeout(() => {
  port = browser.runtime.connect({ name: portName });
  port.onMessage.addListener(portMessageListener);
  const disconnectListener = () => {
    port.onMessage.removeListener(portMessageListener);
    port.onDisconnect.removeListener(disconnectListener);
  };
  port.onDisconnect.addListener(disconnectListener);
  browser.runtime.onMessage.addListener(messageListener);
  logger.info('bebop content_script is loaded');
}, 500);
actionInit();
