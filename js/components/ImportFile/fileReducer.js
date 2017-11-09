import {
  TURN_ON_PROCESS_WAIT,
  TURN_OFF_PROCESS_WAIT,
  fileConstant,
  headerConstant
} from './constants';

import {initialState} from '../../reducers/initialState';
import {assignToEmpty} from '../../utils/assign';

function fileReducer(state = initialState.fileReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);

  let obj;
  switch (action.type) {
    case 'CLEAR_FILE_REDUCER':
      obj = assignToEmpty(initialState.fileReducer, {});
      return obj;
    case fileConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case fileConstant.REQUEST_FAIL:
      obj = assignToEmpty(state, {
        isReceiving: false,
        didInvalidate: true,
        error: action.error
      });
      if (process.env.NODE_ENV === 'production') {
        window.Intercom('trackEvent', 'file_upload_error', {error: JSON.stringify(action.error)});
        mixpanel.track('file_upload_error', {error: JSON.stringify(action.error)});
      }
      return obj;
    case fileConstant.RECEIVE:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      // file belongs to list
      obj[action.listId] = action.file;
      return obj;
    case 'RESET_FILE_REDUCER_ERROR':
      return assignToEmpty(state, {didInvalidate: false, error: undefined});
    case headerConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      obj[action.listId] = assignToEmpty(state[action.listId], {didInvalidate: false});
      return obj;
    case TURN_ON_PROCESS_WAIT:
      obj = assignToEmpty(state, {});
      obj.isProcessWaiting = true;
      return obj;
    case TURN_OFF_PROCESS_WAIT:
      obj = assignToEmpty(state, {});
      obj.isProcessWaiting = false;
      return obj;
    default:
      return state;
  }
}

export default fileReducer;
