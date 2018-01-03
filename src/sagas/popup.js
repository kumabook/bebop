import browser from 'webextension-polyfill';
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
import { sendMessageToActiveContentTabViaBackground } from '../utils/tabs';
import { query as queryActions } from '../actions';
import { watchKeySequence } from './key_sequence';

const history = createHashHistory();
const portName = `popup-${Date.now()}`;
export const port = getPort(portName);

export const debounceDelayMs = 100;

export const modeSelector      = state => state.mode;
export const candidateSelector = state => state.prev && state.prev.candidate;

export function close() {
  if (window.parent !== window) {
    window.parent.postMessage(JSON.stringify({ type: 'CLOSE' }), '*');
  } else {
    window.close();
  }
}

export function sendMessageToBackground(message) {
  return browser.runtime.sendMessage(message);
}

export function* executeAction(action, candidates) {
  if (!action || candidates.length === 0) {
    return;
  }
  try {
    const payload = { actionId: action.id, candidates };
    const message = { type: 'EXECUTE_ACTION', payload };
    yield call(sendMessageToBackground, message);
    yield call(sendMessageToActiveContentTabViaBackground, message);
  } catch (e) {
    logger.error(e);
  } finally {
    close();
  }
}

export function* responseArg() {
  const q = yield select(state => state.query);
  yield call(sendMessageToBackground, { type: 'RESPONSE_ARG', payload: q });
}

export function* dispatchEmptyQuery() {
  yield put({ type: 'QUERY', payload: '' });
}

export function* searchCandidates({ payload: query }) {
  yield call(delay, debounceDelayMs);
  const candidate = yield select(candidateSelector);
  const mode      = yield select(modeSelector);
  switch (mode) {
    case 'candidate': {
      const payload = yield call(sendMessageToBackground, {
        type:    'SEARCH_CANDIDATES',
        payload: query,
      });
      yield put({ type: 'CANDIDATES', payload });
      break;
    }
    case 'action': {
      const separators = [{ label: `Actions for "${candidate.label}"`, index: 0 }];
      const items      = queryActions(candidate.type, query);
      yield put({ type: 'CANDIDATES', payload: { items, separators } });
      break;
    }
    case 'arg': {
      const values = yield select(state => state.scheme.enum);
      const items = (values || []).filter(o => o.label.includes(query));
      yield put({
        type:    'CANDIDATES',
        payload: { items, separators: [] },
      });
      break;
    }
    default:
      break;
  }
}

function* watchQuery() {
  yield takeLatest('QUERY', searchCandidates);
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
    sendMessageToActiveContentTabViaBackground({ type: 'CHANGE_CANDIDATE', payload: candidate })
      .catch(() => {});
  });
}

export function* normalizeCandidate(candidate) {
  if (!candidate) {
    return null;
  }
  if (candidate.type === 'search') {
    const q = yield select(state => state.query);
    return Object.assign({}, candidate, { args: [q] });
  }
  return Object.assign({}, candidate);
}

function getMarkedCandidates({ markedCandidateIds, items }) {
  return Object.entries(markedCandidateIds)
    .map(([k, v]) => v && items.find(i => i.id === k))
    .filter(item => item);
}

export function* getTargetCandidates({ markedCandidateIds, items, index }, needNormalize = false) {
  const marked = getMarkedCandidates({ markedCandidateIds, items });
  if (marked.length > 0) {
    return marked;
  }
  if (needNormalize) {
    return [yield normalizeCandidate(items[index])];
  }
  return [items[index]];
}

function* watchSelectCandidate() {
  yield takeEvery('SELECT_CANDIDATE', function* handleSelectCandidate({ payload }) {
    const { mode, prev } = yield select(state => state);
    let c;
    let action;
    switch (mode) {
      case 'candidate': {
        c        = yield normalizeCandidate(payload);
        [action] = queryActions(c.type);
        yield executeAction(action, [c]);
        break;
      }
      case 'action': {
        action = payload;
        const candidates = yield getTargetCandidates(prev);
        yield executeAction(action, candidates);
        break;
      }
      case 'arg': {
        yield responseArg();
        break;
      }
      default:
        break;
    }
  });
}

function* watchReturn() {
  yield takeEvery('RETURN', function* handleReturn({ payload: { actionIndex } }) {
    const {
      candidates: { index, items },
      mode, markedCandidateIds, prev,
    } = yield select(state => state);
    switch (mode) {
      case 'candidate': {
        const candidates = yield getTargetCandidates({ index, items, markedCandidateIds }, true);
        const actions = queryActions(candidates[0].type);
        const action  = actions[Math.min(actionIndex, actions.length - 1)];
        yield executeAction(action, candidates);
        break;
      }
      case 'action': {
        const action = items[index];
        const candidates = yield getTargetCandidates(prev);
        yield executeAction(action, candidates);
        break;
      }
      case 'arg':
        yield responseArg();
        break;
      default:
        break;
    }
  });
}

function* watchListActions() {
  /* eslint-disable object-curly-newline */
  yield takeEvery('LIST_ACTIONS', function* handleListActions() {
    const {
      candidates: { index, items },
      query, separators, markedCandidateIds, mode, prev,
    } = yield select(state => state);
    switch (mode) {
      case 'candidate': {
        const candidate = yield normalizeCandidate(items[index]);
        if (!candidate) {
          return;
        }
        yield put({
          type:    'SAVE_CANDIDATES',
          payload: { candidate, query, index, items, separators, markedCandidateIds },
        });
        yield call(searchCandidates, { payload: '' });
        break;
      }
      case 'action':
        yield put({ type: 'RESTORE_CANDIDATES', payload: prev });
        break;
      case 'arg':
        break;
      default:
        break;
    }
  });
}

function* watchMarkCandidate() {
  yield takeEvery('MARK_CANDIDATE', function* handleMarkCandidate() {
    const { mode, candidates: { index, items } } = yield select(state => state);
    if (mode === 'action') {
      return;
    }
    const candidate = yield normalizeCandidate(items[index]);
    yield put({ type: 'CANDIDATE_MARKED', payload: candidate });
  });
}

/**
 * Currently, we can't focus to an input form after tab changed.
 * So, we just close window.
 * If this restriction is change, we need to flag on.
 */
function* watchTabChange() {
  yield takeLatest('TAB_CHANGED', function* h({ payload = {} }) {
    if (!payload.canFocusToPopup) {
      close();
    } else {
      yield call(delay, debounceDelayMs);
      document.querySelector('.commandInput').focus();
      const query = yield select(state => state.query);
      const items = yield call(sendMessageToBackground, {
        type:    'SEARCH_CANDIDATES',
        payload: query,
      });
      yield put({ type: 'CANDIDATES', payload: items });
    }
  });
}

function* watchQuit() {
  yield takeLatest('QUIT', close);
}

function* routerSaga() {
  yield fork(router, history, {});
}

export default function* root() {
  yield all([
    fork(watchTabChange),
    fork(watchQuery),
    fork(watchKeySequence),
    fork(watchChangeCandidate),
    fork(watchSelectCandidate),
    fork(watchReturn),
    fork(watchListActions),
    fork(watchMarkCandidate),
    fork(watchQuit),
    fork(watchPort),
    fork(routerSaga),
    fork(dispatchEmptyQuery),
  ]);
}
