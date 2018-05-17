import { defaultOrder } from '../reducers/options';
import { MAX_RESULTS_FOR_EMPTY } from '../candidates';

// eslint-disable-next-line no-param-reassign
function migrateMaxResultsForEmpty(state) {
  return defaultOrder.reduce((acc, t) => {
    if (acc[t] === undefined) {
      return Object.assign(acc, { [t]: MAX_RESULTS_FOR_EMPTY });
    }
    return acc;
  }, Object.assign({}, state));
}

// eslint-disable-next-line no-param-reassign
function migrateOrderOfCandidates(state) {
  return state.slice().concat(defaultOrder.filter(v => !state.includes(v)));
}

const migrator = {
  maxResultsForEmpty: migrateMaxResultsForEmpty,
  orderOfCandidates:  migrateOrderOfCandidates,
};

export default function migrate(state) {
  Object.keys(state).forEach((key) => {
    if (migrator[key]) {
      // eslint-disable-next-line no-param-reassign
      state[key] = migrator[key](state[key]);
    }
  });
  return state;
}
