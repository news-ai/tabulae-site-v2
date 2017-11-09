import {
  TAG_CONTACTS_REQUEST,
  TAG_CONTACTS_RECEIVE,
  TAG_CONTACTS_REQUEST_FAIL
} from './constants';
import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function contactTagReducer(state = initialState.contactTagReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);
  let obj;
  switch (action.type) {
    case TAG_CONTACTS_REQUEST:
      obj = assignToEmpty(state, {isReceiving: true});
      if (!obj[action.tag]) {
        obj[action.tag] = {received: [], offset: 0, total: undefined};
      }
      return obj;
    case TAG_CONTACTS_RECEIVE:
      return assignToEmpty(state, {
        isReceiving: false,
        [action.tag]: assignToEmpty(state[action.tag], {
          offset: action.offset,
          received: [...state[action.tag].received, ...action.received],
          total: action.total
        })
      });
    case 'TAG_CONTACTS_RESET':
      return assignToEmpty(state, {
        [action.tag]: {offset: 0, received: [], total: undefined}
      });
    default:
      return state;
  }
}

export default contactTagReducer;
