import { combineReducers } from 'redux';
import { arrayMove } from 'react-sortable-hoc';

const defaultPopupWidth = 700;
export const defaultOrder = [
  'link',
  'tab',
  'bookmark',
  'history',
  'command',
];

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

const rootReducer = combineReducers({
  popupWidth,
  orderOfCandidates,
});

export default rootReducer;
