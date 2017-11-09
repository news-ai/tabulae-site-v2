import {feedConstant} from './constants';
import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function feedReducer(state = initialState.feedReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);

  let obj;
  switch (action.type) {
    case feedConstant.ADD_REQUESTED:
      return assignToEmpty(state, {
        isReceiving: true
      });
    case feedConstant.ADD_RECEIVED:
      return assignToEmpty(state, {
        isReceiving: false
      });
    case feedConstant.REQUEST_MULTIPLE:
      return assignToEmpty(state, {
        isReceiving: true
      });
    case feedConstant.RECEIVE_MULTIPLE:
      obj = assignToEmpty(state, action.feeds);
      obj[action.contactId] = action.ids;
      obj.isReceiving = false;
      obj.received = [...state.received, ...action.ids.filter(id => !state[id])];
      return obj;
    default:
      return state;
  }
}

export default feedReducer;
