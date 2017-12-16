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

export default function* root() {
  yield all([
    fork(dispatchPopupWidth),
    fork(watchWidth),
    fork(watchOrderOfCandidates),
    fork(watchDefaultNumberOfCandidates),
  ]);
}
