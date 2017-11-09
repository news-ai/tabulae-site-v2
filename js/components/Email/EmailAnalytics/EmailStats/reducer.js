import {emailStatsConstant} from './constants';
import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function emailStatsReducer(state = initialState.emailStatsReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);

  let obj;
  switch (action.type) {
    case emailStatsConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case emailStatsConstant.RECEIVE:
      obj = assignToEmpty(state, action.stats);
      const newReceived = [...action.ids.filter(id => !state[id]), ...state.received];
      obj.received = newReceived;
      obj.offset = action.offset;
      obj.isReceiving = false;
      return obj;
    case emailStatsConstant.REQUEST_FAIL:
      return assignToEmpty(state, {
        isReceiving: false,
        didInvalidate: true
      });
    case 'RECEIVE_SPECIFIC_DAY_EMAILS':
      return assignToEmpty(state, {
        [action.day]: assignToEmpty(state[action.day], {
          received: action.ids,
          hitThreshold: action.hitThreshold,
        })
      });
    default:
      return state;
  }
}

export default emailStatsReducer;

