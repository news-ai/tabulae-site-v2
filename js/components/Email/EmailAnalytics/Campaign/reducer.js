import {campaignStatsConstant} from './constants';
import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function campaignStatsReducer(state = initialState.campaignStatsReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);
  let obj;
  switch (action.type) {
    case campaignStatsConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case campaignStatsConstant.RECEIVE:
      obj = assignToEmpty(state, action.stats);
      const newReceived = [...action.ids.filter(id => !state[id]), ...state.received]
      .sort((aId, bId) => {
        const a = new Date(obj[aId].date);
        const b = new Date(obj[bId].date);
        return a > b ? -1 : a < b ? 1 : 0;
      });
      obj.received = newReceived;
      obj.offset = action.offset;
      obj.isReceiving = false;
      return obj;
    case campaignStatsConstant.REQUEST_FAIL:
      return assignToEmpty(state, {
        isReceiving: false,
        didInvalidate: true
      });
    default:
      return state;
  }
}

export default campaignStatsReducer;
