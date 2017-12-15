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
import search from '../candidates';
import { sendMessageToActiveTab } from '../utils/tabs';
import { query as queryCommands } from '../commands';
import { watchKeySequence } from './key_sequence';

const history = createHashHistory();
const portName = `popup-${Date.now()}`;
const port = getPort(portName);

export const debounceDelayMs = 100;

export function* executeCommand(command, candidates) {
  if (!command || candidates.length === 0) {
    return;
  }
  try {
    if (command.handler) {
      const f = command.handler;
      yield f.call(this, candidates);
      logger.trace(`executed ${command.label}`);
    }
    const payload = { commandName: command.label, candidates };
    yield call(sendMessageToActiveTab, { type: 'EXECUTE_COMMAND', payload });
  } catch (e) {
    logger.error(e);
  } finally {
    window.close();
  }
}

export function* dispatchEmptyQuery() {
  yield put({ type: 'QUERY', payload: '' });
}

export function candidateSelector(state) {
  return state.prev && state.prev.candidate;
}

export function* searchCandidates({ payload: query }) {
  yield call(delay, debounceDelayMs);
  const candidate = yield select(candidateSelector);
  if (candidate) {
    const separators = [{ label: `Commands for "${candidate.label}"`, index: 0 }];
    const items      = queryCommands(candidate.type, query);
    yield put({ type: 'CANDIDATES', payload: { items, separators } });
  } else {
    const payload = yield call(search, query);
    yield put({ type: 'CANDIDATES', payload });
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
    sendMessageToActiveTab({ type: 'CHANGE_CANDIDATE', payload: candidate })
      .catch(() => {});
  });
}

function* normalizeCandidate(candidate) {
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

function* getTargetCandidates({ markedCandidateIds, items, index }, needNormalize = false) {
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
    let command;
    switch (mode) {
      case 'command': {
        command = payload;
        const candidates = yield getTargetCandidates(prev);
        yield executeCommand(command, candidates);
        break;
      }
      default: {
        c         = yield normalizeCandidate(payload);
        [command] = queryCommands(c.type);
      }
    }
    yield executeCommand(command, [c]);
  });
}

function* watchReturn() {
  yield takeEvery('RETURN', function* handleReturn({ payload: { commandIndex } }) {
    const {
      candidates: { index, items },
      mode, markedCandidateIds, prev,
    } = yield select(state => state);
    switch (mode) {
      case 'command': {
        const command = items[index];
        const candidates = yield getTargetCandidates(prev);
        yield executeCommand(command, candidates);
        break;
      }
      default: {
        const candidates = yield getTargetCandidates({ index, items, markedCandidateIds }, true);
        const commands = queryCommands(candidates[0].type);
        const command  = commands[Math.min(commandIndex, commands.length - 1)];
        yield executeCommand(command, candidates);
        break;
      }
    }
  });
}

function* watchListCommands() {
  /* eslint-disable object-curly-newline */
  yield takeEvery('LIST_COMMANDS', function* handleListCommands() {
    const {
      candidates: { index, items },
      query, separators, markedCandidateIds, mode, prev,
    } = yield select(state => state);
    switch (mode) {
      case 'command':
        yield put({ type: 'RESTORE_CANDIDATES', payload: prev });
        break;
      default: {
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
    }
  });
}

function* watchMarkCandidate() {
  yield takeEvery('MARK_CANDIDATE', function* handleMarkCandidate() {
    const { mode, candidates: { index, items } } = yield select(state => state);
    if (mode === 'command') {
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
const canFocusToPopup = false;

function* watchTabChange() {
  yield takeLatest('TAB_CHANGED', function* handleTabChange() {
    if (!canFocusToPopup) {
      window.close();
    } else {
      yield call(delay, debounceDelayMs);
      document.querySelector('.commandInput').focus();
      const query = yield select(state => state.query);
      const payload = yield search(query);
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
    fork(watchListCommands),
    fork(watchMarkCandidate),
    fork(watchPort),
    fork(watchClose),
    fork(routerSaga),
    fork(dispatchEmptyQuery),
  ]);
}
