import {headlineConstant} from './constants';
import {initialState} from '../../../reducers/initialState';
import {assignToEmpty} from '../../../utils/assign';

function headlineReducer(state = initialState.headlineReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);

  let obj;
  switch (action.type) {
    case headlineConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case headlineConstant.RECEIVE:
      obj = assignToEmpty(obj, action.headlines);
      const oldContact = state[action.contactId] || {received: []};
      obj[action.contactId] = assignToEmpty(state[action.contactId], {
        received: [
          ...oldContact.received,
          ...action.ids.filter(id => !oldContact[id])
        ],
        offset: action.offset
      });
      obj.isReceiving = false;
      obj.didInvalidate = false;
      return obj;
    case headlineConstant.REQUEST_FAIL:
      obj = assignToEmpty(state, {});
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default headlineReducer;
