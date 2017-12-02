import browser from 'webextension-polyfill';
import logger from 'kiroku';
import * as cursor from './cursor';
import keySequence from './key_sequences';
import getLinks    from './link';

const portName = `content-script-${window.location.href}`;
let port = null;
if (process.env.NODE_ENV === 'production') {
  logger.setLevel('INFO');
}
const commandNameOfSeq = {
  'C-f': 'forward-char',
  'C-b': 'backward-char',
  'C-a': 'beginning-of-line',
  'C-e': 'end-of-line',
  'C-n': 'next-line',
  'C-p': 'previous-line',
  'M->': 'end-of-buffer',
  'M-<': 'beginning-of-buffer',
  'C-h': 'delete-backward-char',
};

const commands = {
  'forward-char':         cursor.forwardChar,
  'backward-char':        cursor.backwardChar,
  'beginning-of-line':    cursor.beginningOfLine,
  'end-of-line':          cursor.endOfLine,
  'next-line':            cursor.nextLine,
  'previous-line':        cursor.previousLine,
  'end-of-buffer':        cursor.endOfBuffer,
  'beginning-of-buffer':  cursor.beginningOfBuffer,
  'delete-backward-char': cursor.deleteBackwardChar,
};

function executeCommand(name) {
  if (commands[name]) {
    return commands[name]();
  }
  return null;
}

function keydownListener(e) {
  const seq = keySequence(e);
  logger.trace(seq);
  const name = commandNameOfSeq[seq];
  if (name) {
    logger.trace(`execute command: ${name}`);
    executeCommand(name);
    e.preventDefault();
  }
}

function portMessageListener(msg) {
  const { type, payload, targetUrl } = msg;
  if (targetUrl !== window.location.href && type !== 'PLATFORM_INFO') {
    logger.trace('This content script is not active.');
    return;
  }
  logger.trace(`Handle message ${type} ${JSON.stringify(payload)}`);
  switch (type) {
    case 'COMMAND':
      executeCommand(payload);
      break;
    case 'PLATFORM_INFO':
      switch (payload.os) {
        case 'mac':
          break;
        case 'android':
          break;
        default:
          logger.info('Setup key-bindings');
          window.addEventListener('keydown', keydownListener, true);
          break;
      }
      break;
    default:
      break;
  }
}

function messageListener(request, sender, sendResponse) {
  switch (request.type) {
    case 'FETCH_LINKS':
      sendResponse(getLinks(request.payload));
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
