import {
  searchConstant,
  SEARCH_CLEAR_CACHE
} from './constants';

import {initialState} from '../../reducers/initialState';
import {assignToEmpty} from '../../utils/assign';

function searchReducer(state = initialState.searchReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);

  let obj;
  switch (action.type) {
    case searchConstant.REQUEST_MULTIPLE:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case searchConstant.RECEIVE_MULTIPLE:
      obj = assignToEmpty(state, action.contacts);
      obj.isReceiving = false;
      obj.received = [...state.received, ...action.ids.filter(id => !state.received.some(rId => rId === id))];
      obj.query = action.query;
      return obj;
    case searchConstant.REQUEST_MULTIPLE_FAIL:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj.didInvalidate = false;
      return obj;
    case searchConstant.SET_OFFSET:
      obj = assignToEmpty(state, {});
      obj.offset = action.offset;
      return obj;
    case SEARCH_CLEAR_CACHE:
      obj = assignToEmpty(state, {});
      obj.received = [];
      obj.offset = 0;
      return obj;
    default:
      return state;
  }
}

export default searchReducer;
