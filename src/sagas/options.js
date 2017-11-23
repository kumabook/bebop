import browser from 'webextension-polyfill';
import {
  fork,
  takeEvery,
  put,
} from 'redux-saga/effects';

function* dispatchPopupWidth() {
  const { popupWidth } = yield browser.storage.local.get('popupWidth');
  yield put({ type: 'POPUP_WIDTH', payload: popupWidth });
}

function* watchWidth() {
  yield takeEvery('POPUP_WIDTH', function* searchCandidates({ payload }) {
    yield browser.storage.local.set({
      popupWidth: payload,
    });
  });
}


export default function* root() {
  yield [
    fork(dispatchPopupWidth),
    fork(watchWidth),
  ];
}
