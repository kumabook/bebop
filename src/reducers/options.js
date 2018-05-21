import { combineReducers } from 'redux';
import { arrayMove } from 'react-sortable-hoc';
import { MAX_RESULTS_FOR_EMPTY } from '../candidates';

const defaultPopupWidth = 700;
export const defaultOrder = [
  'link',
  'tab',
  'bookmark',
  'hatebu',
  'history',
  'session',
  'command',
];
const numbers = defaultOrder.reduce(
  (acc, t) => Object.assign(acc, { [t]: MAX_RESULTS_FOR_EMPTY }),
  {},
);

const popupWidth = (state = defaultPopupWidth, action) => {
  switch (action.type) {
    case 'POPUP_WIDTH':
      return action.payload || defaultPopupWidth;
    default:
      return state;
  }
};

const orderOfCandidates = (state = defaultOrder, action) => {
  switch (action.type) {
    case 'CHANGE_ORDER': {
      const { oldIndex, newIndex } = action.payload;
      return arrayMove(state, oldIndex, newIndex);
    }
    default:
      return state;
  }
};

const maxResultsForEmpty = (state = numbers, action) => {
  switch (action.type) {
    case 'UPDATE_MAX_RESULTS_FOR_EMPTY':
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};

const enabledCJKMove = (state = false, action) => {
  switch (action.type) {
    case 'ENABLE_CJK_MOVE':
      return action.payload;
    default:
      return state;
  }
};

const hatenaUserName = (state = false, action) => {
  switch (action.type) {
  case 'HATENA_USER_NAME':
    return action.payload;
  default:
    return state;
  }
};

const rootReducer = combineReducers({
  popupWidth,
  orderOfCandidates,
  maxResultsForEmpty,
  enabledCJKMove,
  hatenaUserName,
});

export default rootReducer;
