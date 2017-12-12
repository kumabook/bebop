import logger from 'kiroku';
import { delay } from 'redux-saga';
import {
  fork,
  take,
  takeEvery,
  takeLatest,
  call,
  put,
  select,
  all,
} from 'redux-saga/effects';
import {
  router,
  createHashHistory,
} from 'redux-saga-router';
import {
  getPort,
  createPortChannel,
} from '../utils/port';
import candidates from '../candidates';
import * as cursor from '../cursor';
import { sendMessageToActiveTab } from '../utils/tabs';
import { query as queryCommands } from '../commands';

const history = createHashHistory();
const portName = `popup-${Date.now()}`;
const port = getPort(portName);

export function dispatchAction(type, payload) {
  return function* dispatch() {
    yield put({ type, payload });
  };
}

export const debounceDelayMs = 100;

/* eslint-disable quote-props */
export const commandOfSeq = {
  'C-f':      cursor.forwardChar,
  'C-b':      cursor.backwardChar,
  'C-a':      cursor.beginningOfLine,
  'C-e':      cursor.endOfLine,
  'C-n':      dispatchAction('NEXT_CANDIDATE'),
  'C-p':      dispatchAction('PREVIOUS_CANDIDATE'),
  'C-h':      cursor.deleteBackwardChar,
  'C-j':      dispatchAction('NEXT_CANDIDATE'),
  'C-k':      dispatchAction('PREVIOUS_CANDIDATE'),
  up:         dispatchAction('PREVIOUS_CANDIDATE'),
  down:       dispatchAction('NEXT_CANDIDATE'),
  tab:        dispatchAction('NEXT_CANDIDATE'),
  'S-tab':    dispatchAction('PREVIOUS_CANDIDATE'),
  'return':   dispatchAction('RETURN', { commandIndex: 0 }),
  'S-return': dispatchAction('RETURN', { commandIndex: 1 }),
  'C-return': dispatchAction('RETURN', { commandIndex: -1 }),
};

export function* executeCommand(command, candidate) {
  const { name, args } = candidate;
  if (command && command.handler) {
    const f = command.handler;
    yield f.apply(this, args).then(() => logger.trace(`executed ${name} `));
  } else {
    logger.trace(`${name} is not defined`);
  }
  const payload = { commandName: command.label, candidate };
  yield sendMessageToActiveTab({ type: 'EXECUTE_COMMAND', payload });
  window.close();
}

export function* dispatchEmptyQuery() {
  yield put({ type: 'QUERY', payload: '' });
}

export function candidateSelector(state) {
  return state.candidate;
}

export function* searchCandidates({ payload: query }) {
  yield call(delay, debounceDelayMs);
  const candidate = yield select(candidateSelector);
  if (candidate) {
    const separators = [{ label: `Commands for "${candidate.label}"`, index: 0 }];
    const items      = queryCommands(candidate.type, query);
    yield put({ type: 'CANDIDATES', payload: { items, separators } });
  } else {
    const payload = yield call(candidates, query);
    yield put({ type: 'CANDIDATES', payload });
  }
}

function* watchQuery() {
  yield takeLatest('QUERY', searchCandidates);
}


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

function* watchKeySequence() {
  yield takeEvery('KEY_SEQUENCE', handleKeySequece);
}

function* watchPort() {
  const portChannel = yield call(createPortChannel, port);

  for (;;) {
    const { type, payload } = yield take(portChannel);
    yield put({ type, payload });
  }
}

function* watchChangeCandidate() {
  const actions = ['QUERY', 'NEXT_CANDIDATE', 'PREVIOUS_CANDIDATE'];
  yield takeEvery(actions, function* handleChangeCandidate() {
    const { index, items } = yield select(state => state.candidates);
    const candidate = items[index];
    sendMessageToActiveTab({ type: 'CHANGE_CANDIDATE', payload: candidate })
      .catch(() => {});
  });
}

function* watchSelectCandidate() {
  yield takeEvery('SELECT_CANDIDATE', function* handleSelectCandidate({ payload }) {
    const { candidate } = yield select(state => state);
    let c;
    let command;
    if (candidate) {
      c       = candidate;
      command = payload;
    } else {
      c         = payload;
      [command] = queryCommands(c.type);
    }
    yield executeCommand(command, c);
  });
}

function* watchReturn() {
  yield takeEvery('RETURN', function* handleReturn({ payload: { commandIndex } }) {
    const { candidates: { index, items }, candidate } = yield select(state => state);
    if (candidate) {
      const command = items[index];
      yield executeCommand(command, candidate);
      return;
    }
    const c = items[index];
    if (c.type === 'search') {
      const query = yield select(state => state.query);
      c.args = [query];
    }
    if (commandIndex >= 0) {
      const commands = queryCommands(c.type);
      const command = commands[Math.min(commandIndex, commands.length - 1)];
      yield executeCommand(command, c);
      return;
    }
    yield put({ type: 'CANDIDATE', payload: c });
    yield call(dispatchEmptyQuery);
  });
}

/**
 * Currently, we can't focus to an input form after tab changed.
 * So, we just close window.
 * If this restriction is change, we need to flag on.
 */
const canFocusToPopup = false;

function* watchTabChange() {
  yield takeLatest('TAB_CHANGED', function* handleTabChange() {
    if (!canFocusToPopup) {
      window.close();
    } else {
      yield call(delay, debounceDelayMs);
      document.querySelector('.commandInput').focus();
      const query = yield select(state => state.query);
      const payload = yield candidates(query);
      yield put({ type: 'CANDIDATES', payload });
    }
  });
}

function* watchClose() {
  yield takeEvery('CLOSE', () => window.close());
}

const routes = {
  '/search': function* putSearch() {
    yield put({ type: 'SEARCH' });
  },
};

function* routerSaga() {
  yield fork(router, history, routes);
}

export default function* root() {
  yield all([
    fork(watchTabChange),
    fork(watchQuery),
    fork(watchKeySequence),
    fork(watchChangeCandidate),
    fork(watchSelectCandidate),
    fork(watchReturn),
    fork(watchPort),
    fork(watchClose),
    fork(routerSaga),
    fork(dispatchEmptyQuery),
  ]);
}
