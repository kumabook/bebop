/* global browser: false */
import logger from 'kiroku';
import * as cursor from './cursor';
import keySequence from './key_sequences';

const portName = `content-script-${window.location.href}`;
let port = null;

const commandNameOfSeq = {
  'C-f': 'forward-char',
  'C-b': 'backward-char',
  'C-a': 'beginning-of-line',
  'C-e': 'end-of-line',
  'C-n': 'next-line',
  'C-p': 'previous-line',
  'M->': 'end-of-buffer',
  'M-<': 'beginning-of-buffer',
};

const commands = {
  'forward-char':        cursor.forwardChar,
  'backward-char':       cursor.backwardChar,
  'beginning-of-line':   cursor.beginningOfLine,
  'end-of-line':         cursor.endOfLine,
  'next-line':           cursor.nextLine,
  'previous-line':       cursor.previousLine,
  'end-of-buffer':       cursor.endOfBuffer,
  'beginning-of-buffer': cursor.beginningOfBuffer,
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

function messageListenner(msg) {
  const { type, payload, targetUrl } = msg;
  if (targetUrl !== window.location.href) {
    logger.trace('This content script is not active.');
    return;
  }
  logger.trace(`Handle message ${type} ${payload}`);
  switch (type) {
    case 'COMMAND':
      executeCommand(payload);
      break;
    default:
      break;
  }
}

window.addEventListener('keydown', keydownListener, true);
setTimeout(() => {
  port = browser.runtime.connect({ name: portName });
  port.onMessage.addListener(messageListenner);
  logger.info('bebop content_script is loaded');
}, 500);
