import browser from 'webextension-polyfill';
import {
  fork,
  takeEvery,
  select,
  put,
  all,
} from 'redux-saga/effects';

function* dispatchPopupWidth() {
  const { popupWidth } = yield browser.storage.local.get('popupWidth');
  yield put({ type: 'POPUP_WIDTH', payload: popupWidth });
}

function* dispatchHatenaUserName() {
  const { hatenaUserName } = yield browser.storage.local.get('hatenaUserName');
  yield put({ type: 'HATENA_USER_NAME', payload: hatenaUserName });
}

function* watchWidth() {
  yield takeEvery('POPUP_WIDTH', function* h({ payload }) {
    yield browser.storage.local.set({
      popupWidth: payload,
    });
  });
}

function* watchOrderOfCandidates() {
  yield takeEvery('CHANGE_ORDER', function* h() {
    const { orderOfCandidates } = yield select(state => state);
    yield browser.storage.local.set({ orderOfCandidates });
  });
}

function* watchDefaultNumberOfCandidates() {
  yield takeEvery('UPDATE_MAX_RESULTS_FOR_EMPTY', function* h() {
    const { maxResultsForEmpty } = yield select(state => state);
    yield browser.storage.local.set({ maxResultsForEmpty });
  });
}

function* watchEnableCJKMove() {
  yield takeEvery('ENABLE_CJK_MOVE', function* h() {
    const { enabledCJKMove } = yield select(state => state);
    yield browser.storage.local.set({ enabledCJKMove });
  });
}

function* watchHatenaUserName() {
  yield takeEvery('HATENA_USER_NAME', function* h() {
    const { hatenaUserName } = yield select(state => state);
    yield browser.storage.local.set({ hatenaUserName });
  });
}

export default function* root() {
  yield all([
    fork(dispatchPopupWidth),
    fork(dispatchHatenaUserName),
    fork(watchWidth),
    fork(watchOrderOfCandidates),
    fork(watchDefaultNumberOfCandidates),
    fork(watchEnableCJKMove),
    fork(watchHatenaUserName),
  ]);
}
