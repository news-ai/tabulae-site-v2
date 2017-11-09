import {
  templateConstant
} from './constants';

import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';


function templateReducer(state = initialState.templateReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);

  let obj;
  switch (action.type) {
    case templateConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case templateConstant.CREATE_REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case templateConstant.RECEIVE:
      obj = assignToEmpty(state, action.template);
      if (!state.received.some(id => id === action.id)) obj.received = [...state.received, action.id];
      obj.isReceiving = false;
      return obj;
    case templateConstant.CREATE_RECEIVED:
      obj = assignToEmpty(state, action.template);
      if (!state.received.some(id => id === action.id)) obj.received = [...state.received, action.id];
      obj.isReceiving = false;
      return obj;
    case templateConstant.REQUEST_FAIL:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    case templateConstant.RECEIVE_MULTIPLE:
      obj = assignToEmpty(state, action.templates);
      const newReceived = state.received.concat(action.ids.filter(id => !state[id]));
      obj.received = newReceived;
      obj.offset = action.offset;
      return obj;
    case templateConstant.REQUEST_MULTIPLE_FAIL:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default templateReducer;
