import {listfeedConstant} from './constants';
import {initialState} from '../../reducers/initialState';
import {assignToEmpty} from '../../utils/assign';

function listfeedReducer(state = initialState.listfeedReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);

  let obj;
  switch (action.type) {
    case listfeedConstant.REQUEST_MULTIPLE:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      obj.didInvalidate = false;
      return obj;
    case listfeedConstant.RECEIVE_MULTIPLE:
      obj = assignToEmpty(state, {});
      const oldContact = state[action.listId] || {received: []};
      obj[action.listId] = assignToEmpty(state[action.listId], {
        received: [
          ...oldContact.received,
          ...action.feed
        ],
        offset: action.offset
      });
      obj.isReceiving = false;
      obj.didInvalidate = false;
      return obj;
    case listfeedConstant.REQUEST_MULTIPLE_FAIL:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default listfeedReducer;
