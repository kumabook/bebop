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
import commands from '../commands';
import * as cursor from '../cursor';
import { sendMessageToActiveTab } from '../utils/tabs';

const history = createHashHistory();
const portName = `popup-${Date.now()}`;
const port = getPort(portName);

export function dispatchAction(type) {
  return function* dispatch() {
    yield put({ type });
  };
}

export const debounceDelayMs = 100;

export const commandOfSeq = {
  'C-f':   cursor.forwardChar,
  'C-b':   cursor.backwardChar,
  'C-a':   cursor.beginningOfLine,
  'C-e':   cursor.endOfLine,
  'C-n':   dispatchAction('NEXT_CANDIDATE'),
  'C-p':   dispatchAction('PREVIOUS_CANDIDATE'),
  'C-h':   cursor.deleteBackwardChar,
  up:      dispatchAction('PREVIOUS_CANDIDATE'),
  down:    dispatchAction('NEXT_CANDIDATE'),
  tab:     dispatchAction('NEXT_CANDIDATE'),
  'S-tab': dispatchAction('PREVIOUS_CANDIDATE'),
};

export function* dispatchEmptyQuery() {
  yield put({ type: 'QUERY', payload: '' });
}

function post(type, payload) {
  port.postMessage({ type, payload, portName });
}

function passAction(type) {
  return function* watch() {
    yield takeEvery(type, ({ payload }) => post(type, payload));
  };
}

export function* searchCandidates({ payload }) {
  yield call(delay, debounceDelayMs);
  const candidates = yield call(commands.candidates, payload);
  yield put({ type: 'CANDIDATES', payload: candidates });
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


function* watchSelectedCandidate() {
  const actions = ['QUERY', 'NEXT_CANDIDATE', 'PREVIOUS_CANDIDATE'];
  yield takeEvery(actions, function* handleSelectedCandidate() {
    const { index, items } = yield select(state => state.candidates);
    const candidate = items[index];
    sendMessageToActiveTab({ type: 'CHANGE_CANDIDATE', payload: candidate })
      .catch(() => {});
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
      const candidates = yield commands.candidates(query);
      yield put({ type: 'CANDIDATES', payload: candidates });
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
    fork(passAction('COMMAND')),
    fork(watchTabChange),
    fork(watchQuery),
    fork(watchKeySequence),
    fork(watchSelectedCandidate),
    fork(watchPort),
    fork(watchClose),
    fork(routerSaga),
    fork(dispatchEmptyQuery),
  ]);
}
