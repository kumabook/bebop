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

const rootReducer = combineReducers({
  router: routerReducer,
  query,
});

export default rootReducer;
