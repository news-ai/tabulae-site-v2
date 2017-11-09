import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function emailDraftReducer(state = initialState.emailDraftReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);
  let obj;
  switch (action.type) {
    case 'INITIALIZE_EMAIL_DRAFT':
      obj = assignToEmpty(state, {
        isAttachmentPanelOpen: false,
        editorState: null,
        bodyHtml: null
      });
      obj[action.listId] = {from: action.email};
      return obj;
    case 'TURN_ON_ATTACHMENT_PANEL':
      return assignToEmpty(state, {isAttachmentPanelOpen: true});
    case 'TURN_OFF_ATTACHMENT_PANEL':
      return assignToEmpty(state, {isAttachmentPanelOpen: false});
    case 'UPDATE_CC':
      obj = assignToEmpty(state, {});
      obj[action.listId] = assignToEmpty(state[action.listId], {cc: action.cc});
      return obj;
    case 'UPDATE_BCC':
      obj = assignToEmpty(state, {});
      obj[action.listId] = assignToEmpty(state[action.listId], {bcc: action.bcc});
      return obj;
    case 'SET_FROM_EMAIL':
      obj = assignToEmpty(state, {});
      obj[action.listId] = assignToEmpty(state[action.listId], {from: action.from});
      return obj;
    case 'SET_EDITORSTATE':
      return assignToEmpty(state, {editorState: action.editorState});
    case 'SET_BODYHTML':
      return assignToEmpty(state, {bodyHtml: action.bodyHtml});
    case 'CLEAR_CACHE_BODYHTML':
      return assignToEmpty(state, {bodyHtml: null});
    case 'TEMPLATE_CHANGE_ON':
      // available changeTypes: 'overwrite', 'append'
      return assignToEmpty(state, {
        templateChanged: true,
        templateChangeType: action.changeType || 'overwrite',
        templateEntityType: action.entityType
      });
    case 'TEMPLATE_CHANGE_OFF':
      return assignToEmpty(state, {
        templateChanged: false,
        templateChangeType: 'overwrite',
        templateEntityType: undefined
      });
    default:
      return state;
  }
}

export default emailDraftReducer;
