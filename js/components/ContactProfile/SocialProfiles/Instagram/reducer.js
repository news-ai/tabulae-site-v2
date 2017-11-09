import {instagramProfileConstant} from './constants';
import {initialState} from '../../../../reducers/initialState';
import {assignToEmpty} from '../../../../utils/assign';

function instagramProfileReducer(state = initialState.instagramProfileReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);

  let obj;
  switch (action.type) {
    case instagramProfileConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case instagramProfileConstant.RECEIVE:
      obj = assignToEmpty(state, {});
      obj[action.contactId] = action.profile;
      obj.isReceiving = false;
      return obj;
    case instagramProfileConstant.REQUEST_FAIL:
      obj = assignToEmpty(state, {});
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default instagramProfileReducer;
