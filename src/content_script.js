import logger from 'kiroku';
import * as cursor from './cursor';
import keySequence from './key_sequences';

const commands = {
  'C-f': cursor.forwardChar,
  'C-b': cursor.backwardChar,
  'C-a': cursor.beginningOfLine,
  'C-e': cursor.endOfLine,
  'C-n': cursor.nextLine,
  'C-p': cursor.previousLine,
  'M->': cursor.endOfBuffer,
  'M-<': cursor.beginningOfBuffer,
};


function keydownListener(e) {
  const seq = keySequence(e);
  logger.trace(seq);
  const command = commands[seq];
  if (command) {
    logger.trace(`exec ${command.name}`);
    command();
    e.preventDefault();
  }
}

window.addEventListener('keydown', keydownListener, true);
