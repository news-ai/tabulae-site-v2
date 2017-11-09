import * as constants from './constants';
import {initialState} from '../../reducers/initialState';
import {assignToEmpty} from '../../utils/assign';

function clientReducer(state = initialState.clientReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);

  let obj;
  switch (action.type) {
    case constants.CLIENT_NAMES_REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      obj.didInvalidate = false;
      return obj;
    case constants.CLIENT_NAMES_RECEIVED:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj.didInvalidate = false;
      obj.clientnames = action.clientnames;
      return obj;
    case constants.CLIENT_NAMES_REQUEST_FAIL:
      obj = assignToEmpty(state, {});
      obj.didInvalidate = true;
      obj.isReceiving = false;
      return obj;
    case constants.CLIENT_LISTS_REQUEST:
      obj = assignToEmpty(state, {});
      return obj;
    case constants.CLIENT_LISTS_RECEIVED:
      obj = assignToEmpty(state, {});
      obj[action.clientQuery] = action.ids;
      return obj;
    default:
      return state;
  }
}

export default clientReducer;
