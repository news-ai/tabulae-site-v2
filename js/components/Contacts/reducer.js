import {
  ADDING_CONTACT,
  contactConstant,
  LIST_CONTACTS_SEARCH_REQUEST,
  LIST_CONTACTS_SEARCH_RECEIVED,
  LIST_CONTACTS_SEARCH_FAIL
} from './constants';
import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function contactReducer(state = initialState.contactReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);
  let obj;
  switch (action.type) {
    case contactConstant.MANUALLY_SET_ISRECEIVING_ON:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case contactConstant.MANUALLY_SET_ISRECEIVING_OFF:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      return obj;
    case ADDING_CONTACT:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case contactConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case contactConstant.REQUEST_FAIL:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    case contactConstant.RECEIVE:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      if (!state[action.contact.id]) obj.received = [...state.received, action.contact.id];
      obj[action.contact.id] = Object.assign(state[action.contact.id], action.contact);
      if (action.contact.customfields && action.contact.customfields !== null) {
        action.contact.customfields.map( field => {
          obj[action.contact.id][field.name] = field.value;
        });
      }
      obj.didInvalidate = false;
      return obj;
    case contactConstant.RECEIVE_MULTIPLE:
      obj = assignToEmpty(state, action.contacts);
      obj.received = state.received.concat(action.ids.filter(id => !state[id]));
      obj.isReceiving = false;
      action.ids.map(id => {
        if (obj[id].customfields && obj[id].customfields !== null) {
          obj[id].customfields.map( field => {
            obj[id][field.name] = field.value;
          });
        }
      });
      obj.didInvalidate = false;
      return obj;
    case 'PATCH_CONTACTS':
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    default:
      return state;
  }
}

export default contactReducer;
