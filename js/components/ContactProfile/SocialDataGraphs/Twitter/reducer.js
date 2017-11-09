import {twitterDataConstant} from './constants';
import {initialState} from '../../../../reducers/initialState';
import {assignToEmpty} from '../../../../utils/assign';

function twitterDataReducer(state = initialState.twitterDataReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);

  let obj;
  let oldContact, filteredData;
  switch (action.type) {
    case twitterDataConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case twitterDataConstant.RECEIVE:
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
    case twitterDataConstant.REQUEST_MULTIPLE:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      obj.didInvalidate = false;
      return obj;
    case twitterDataReducer.RECEIVE_MULTIPLE:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj.didInvalidate = false;
      return obj;
    case twitterDataConstant.REQUEST_MULTIPLE_FAIL:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      obj.didInvalidate = true;
      return obj;
    case twitterDataConstant.REQUEST_FAIL:
      obj = assignToEmpty(state, {});
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default twitterDataReducer;
