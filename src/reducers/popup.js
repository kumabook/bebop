import { combineReducers } from 'redux';
import { routerReducer }   from 'react-router-redux';

const popupWidth = (state = null, action) => {
  switch (action.type) {
    case 'POPUP_WIDTH':
      return action.payload;
    default:
      return state;
  }
};

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
    case 'CANDIDATES':
      return normalize({ index: state.index, items: action.payload });
    case 'NEXT_CANDIDATE': {
      const i = state.index;
      return normalize({ index: (isNaN(i) ? -1 : i) + 1, items: state.items });
    }
    case 'PREVIOUS_CANDIDATE': {
      const i = state.index;
      return normalize({ index: (isNaN(i) ? 0 : i) - 1, items: state.items });
    }
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  router: routerReducer,
  query,
  candidates,
  popupWidth,
});

export default rootReducer;
