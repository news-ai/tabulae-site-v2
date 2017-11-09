import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function emailAttachmentReducer(state = initialState.emailAttachmentReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);
  switch (action.type) {
    case 'SET_ATTACHMENTS':
      return assignToEmpty(state, {attached: action.files});
    case 'CLEAR_ATTACHMENTS':
      return assignToEmpty(state, {attached: [], finished: false});
    case 'ALL_EMAIL_ATTACHMENTS_START':
      return assignToEmpty(state, {isReceiving: true});
    case 'ALL_EMAIL_ATTACHMENTS_FINISHED':
      return assignToEmpty(state, {isReceiving: false, finished: true});
    case 'EMAIL_ATTACHMENT_REQUEST':
      return assignToEmpty(state, {isReceiving: true, finished: false});
    case 'EMAIL_ATTACHMENT_RECEIVE':
      return assignToEmpty(state, {
        [action.fileId]: action.attachment,
        isReceiving: false
      });
    case 'EMAIL_ATTACHMENT_REQUEST_FAIL':
      return assignToEmpty(state, {
        isReceiving: false,
        didInvalidate: true
      });
    default:
      return state;
  }
}

export default emailAttachmentReducer;
