import { combineReducers } from 'redux';

const defaultPopupWidth = 700;

const popupWidth = (state = defaultPopupWidth, action) => {
  switch (action.type) {
    case 'POPUP_WIDTH':
      return action.payload || defaultPopupWidth;
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  popupWidth,
});

export default rootReducer;
