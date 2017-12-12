import { combineReducers } from 'redux';
import { routerReducer }   from 'react-router-redux';

const query = (state = '', action) => {
  switch (action.type) {
    case 'QUERY':
      return action.payload;
    default:
      return state;
  }
};

function normalize({ index, items }) {
  return { index: (index + items.length) % items.length, items };
}

const candidates = (state = { index: null, items: [] }, action) => {
  switch (action.type) {
    case 'CANDIDATES': {
      const { items } = action.payload;
      return normalize({ index: state.index, items });
    }
    case 'NEXT_CANDIDATE': {
      const i = state.index;
      return normalize({ index: (Number.isNaN(i) ? -1 : i) + 1, items: state.items });
    }
    case 'PREVIOUS_CANDIDATE': {
      const i = state.index;
      return normalize({ index: (Number.isNaN(i) ? 0 : i) - 1, items: state.items });
    }
    case 'CANDIDATE':
      return { index: null, items: state.items };
    default:
      return state;
  }
};

const separators = (state = [], action) => {
  switch (action.type) {
    case 'CANDIDATES':
      return action.payload.separators;
    default:
      return state;
  }
};

const candidate = (state = null, action) => {
  switch (action.type) {
    case 'CANDIDATE':
      return action.payload;
    default:
      return state;
  }
};

const candidateType = (state = 'candidate', action) => {
  switch (action.type) {
    case 'CANDIDATE':
      return 'command';
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  router: routerReducer,
  query,
  candidates,
  separators,
  candidate,
  candidateType,
});

export default rootReducer;
