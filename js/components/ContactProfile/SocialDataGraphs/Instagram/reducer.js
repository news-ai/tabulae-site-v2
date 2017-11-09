import {instagramDataConstant} from './constants';
import {initialState} from '../../../../reducers/initialState';
import {assignToEmpty} from '../../../../utils/assign';

function instagramDataReducer(state = initialState.instagramDataReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);

  let obj;
  let oldContact, filteredData;
  switch (action.type) {
    case instagramDataConstant.REQUEST_MULTIPLE:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      obj.didInvalidate = false;
      return obj;
    case instagramDataReducer.RECEIVE_MULTIPLE:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj.didInvalidate = false;
      return obj;
    case instagramDataConstant.REQUEST_MULTIPLE_FAIL:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      obj.didInvalidate = true;
      return obj;
    case instagramDataConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case instagramDataConstant.RECEIVE:
      obj = assignToEmpty(state, {});
      oldContact = state[action.contactId] || {received: []};
      filteredData = action.data.filter(dataObj => !oldContact.received.some(dObj => dObj.CreatedAt === dataObj.CreatedAt));
      obj[action.contactId] = assignToEmpty(
        state[action.contactId], {
          received: [
            ...filteredData.reverse(),
            ...oldContact.received,
          ],
          offset: action.offset
        });
      obj.isReceiving = false;
      return obj;
    case instagramDataConstant.REQUEST_FAIL:
      obj = assignToEmpty(state, {});
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default instagramDataReducer;
