import {
  TURN_ON_UPLOAD_GUIDE,
  TURN_OFF_UPLOAD_GUIDE,
  TURN_ON_GENERAL_GUIDE,
  TURN_OFF_GENERAL_GUIDE,
  FORWARD_STEP,
  BACKWARD_STEP,
} from './constants';
import {REMOVE_FIRST_TIME_USER} from '../Login/constants';

import {initialState} from '../../reducers/initialState';
import {assignToEmpty} from '../../utils/assign';

function joyrideReducer(state = initialState.joyrideReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);

  let obj;
  switch (action.type) {
    case REMOVE_FIRST_TIME_USER:
      obj = assignToEmpty(state, {});
      obj.showUploadGuide = false;
      obj.showGeneralGuide = false;
      return obj;
    case TURN_ON_UPLOAD_GUIDE:
      obj = assignToEmpty(state, {});
      obj.showUploadGuide = true;
      return obj;
    case TURN_OFF_UPLOAD_GUIDE:
      obj = assignToEmpty(state, {});
      obj.showUploadGuide = false;
      return obj;
    case TURN_ON_GENERAL_GUIDE:
      obj = assignToEmpty(state, {});
      obj.showGeneralGuide = true;
      return obj;
    case TURN_OFF_GENERAL_GUIDE:
      obj = assignToEmpty(state, {});
      obj.showGeneralGuide = false;
      return obj;
    case FORWARD_STEP:
      obj = assignToEmpty(state, {});
      return obj;
    case BACKWARD_STEP:
      obj = assignToEmpty(state, {});
      return obj;
    default:
      return state;
  }
}

export default joyrideReducer;
