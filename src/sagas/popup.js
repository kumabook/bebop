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

const history = createHashHistory();
const portName = `popup-${Date.now()}`;
const port = getPort(portName);

function post(type, payload) {
  port.postMessage({ type, payload, portName });
}

function watchMessage(type) {
  return function* watch() {
    yield takeEvery(type, ({ payload }) => post(type, payload));
  };
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
    fork(watchMessage('COMMAND')),
    fork(watchMessage('QUERY')),
    fork(watchMessage('MESSAGE')),
    fork(watchPort),
    fork(watchClose),
    fork(routerSaga),
  ];
}
