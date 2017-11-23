import {
  fork,
  takeEvery,
  call,
  take,
  put,
} from 'redux-saga/effects';
import {
  router,
  createHashHistory,
} from 'redux-saga-router';
import {
  getPort,
  createPortChannel,
} from '../utils/port';
import * as cursor from '../cursor';

const history = createHashHistory();
const portName = `popup-${Date.now()}`;
const port = getPort(portName);

function dispatchAction(type) {
  return function* dispatch() {
    yield put({ type });
  };
}

export const commandOfSeq = {
  'C-f': cursor.forwardChar,
  'C-b': cursor.backwardChar,
  'C-a': cursor.beginningOfLine,
  'C-e': cursor.endOfLine,
  'C-n': dispatchAction('NEXT_CANDIDATE'),
  'C-p': dispatchAction('PREVIOUS_CANDIDATE'),
  'C-h': cursor.deleteBackwardChar,
};

function post(type, payload) {
  port.postMessage({ type, payload, portName });
}

function passAction(type) {
  return function* watch() {
    yield takeEvery(type, ({ payload }) => post(type, payload));
  };
}

function* watchKeySequence() {
  yield takeEvery('KEY_SEQUENCE', function* handleKeySequece({ payload }) {
    const command = commandOfSeq[payload];
    if (!command) {
      return;
    }
    yield command();
  });
}

function* watchPort() {
  const portChannel = yield call(createPortChannel, port);

  for (;;) {
    const { type, payload } = yield take(portChannel);
    yield put({ type, payload });
  }
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
  yield [
    fork(passAction('COMMAND')),
    fork(passAction('MESSAGE')),
    fork(watchKeySequence),
    fork(watchPort),
    fork(watchClose),
    fork(routerSaga),
  ];
}
