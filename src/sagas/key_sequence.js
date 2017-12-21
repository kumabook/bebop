import { takeEvery, put } from 'redux-saga/effects';
import * as cursor from '../cursor';

export function dispatchAction(type, payload) {
  return function* dispatch() {
    yield put({ type, payload });
  };
}

/* eslint-disable quote-props */
export const commandOfSeq = {
  'C-f':      cursor.forwardChar,
  'C-b':      cursor.backwardChar,
  'C-a':      cursor.beginningOfLine,
  'C-e':      cursor.endOfLine,
  'C-n':      dispatchAction('NEXT_CANDIDATE'),
  'C-p':      dispatchAction('PREVIOUS_CANDIDATE'),
  'C-h':      cursor.deleteBackwardChar,
  'C-k':      cursor.killLine,
  up:         dispatchAction('PREVIOUS_CANDIDATE'),
  down:       dispatchAction('NEXT_CANDIDATE'),
  tab:        dispatchAction('NEXT_CANDIDATE'),
  'S-tab':    dispatchAction('PREVIOUS_CANDIDATE'),
  'return':   dispatchAction('RETURN', { commandIndex: 0 }),
  'S-return': dispatchAction('RETURN', { commandIndex: 1 }),
  'C-i':      dispatchAction('LIST_COMMANDS'),
  'C-SPC':    dispatchAction('MARK_CANDIDATE'),
  'ESC':      dispatchAction('QUIT'),
  'C-g':      dispatchAction('QUIT'),
};

export function* handleKeySequece({ payload }) {
  const command = commandOfSeq[payload];
  if (!command) {
    return;
  }
  yield command();
  if (command === cursor.deleteBackwardChar) {
    yield put({ type: 'QUERY', payload: cursor.activeElementValue() });
  }
}

export function* watchKeySequence() {
  yield takeEvery('KEY_SEQUENCE', handleKeySequece);
}

export function init({ enabledCJKMove }) {
  if (enabledCJKMove) {
    commandOfSeq['C-j'] = dispatchAction('NEXT_CANDIDATE');
    commandOfSeq['C-k'] = dispatchAction('PREVIOUS_CANDIDATE');
  }
}
