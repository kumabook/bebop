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
const portName = 'popup';
const port = getPort(portName);

function command({ payload }) {
  port.postMessage({ type: command, portName, payload });
}

function* watchCommand() {
  yield takeEvery('COMMAND', command);
}

function* watchPort() {
  const portChannel = yield call(createPortChannel, port);

  for (;;) {
    const event = yield take(portChannel);
    switch (event.type) {
      case 'logged-in':
        yield put({ type: 'FAILED_TO_SIGNUP', payload: event.payload });
        break;
      default:
        break;
    }
  }
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
    fork(watchCommand),
    fork(watchPort),
    fork(routerSaga),
  ];
}
