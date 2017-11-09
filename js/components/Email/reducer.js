import {
  RECEIVE_STAGED_EMAILS,
  SENDING_STAGED_EMAILS,
  RECEIVE_EMAIL,
  REQUEST_MULTIPLE_EMAILS,
  RECEIVE_MULTIPLE_EMAILS,
  EMAIL_SET_OFFSET,
  SET_SCHEDULE_TIME,
  CLEAR_SCHEDULE_TIME,
  FETCH_EMAIL_LOGS,
  FETCH_EMAIL_LOGS_FAIL,
  RECEIVE_EMAIL_LOGS,
  STAGING_EMAILS_FAIL,
  REQUEST_QUERY_EMAILS,
  RECEIVE_QUERY_EMAILS,
} from './constants';
import isEqual from 'lodash/isEqual';

import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function stagingReducer(state = initialState.stagingReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);

  let obj;
  let unsorted, unseen;
  switch (action.type) {
    case 'EMAIL_REQUEST':
      return assignToEmpty(state, {isReceiving: true});
    case 'EMAIL_RECEIVE':
      return assignToEmpty(state, {
        [action.id]: action.email,
        received: !state.received.some(id => id === action.id) ? [...state.received, action.id] : state.received,
        isReceiving: false
      });
    case SENDING_STAGED_EMAILS:
      return assignToEmpty(state, {isReceiving: true, didInvalidate: false});
    case RECEIVE_STAGED_EMAILS:
      obj = assignToEmpty(state, action.emails);
      obj.previewEmails = action.previewEmails;
      obj.received = state.received.concat(action.ids.filter(id => !state.received.some(seenId => seenId === id)));
      obj.isReceiving = false;
      return obj;
    case RECEIVE_EMAIL:
      obj = assignToEmpty(state, action.email);
      if (!state.received.some(id => id === action.id)) obj.received = [...state.received, action.id];
      obj.isReceiving = false;
      return obj;
    case REQUEST_MULTIPLE_EMAILS:
      return assignToEmpty(state, {isReceiving: true});
    case 'RECEIVE_SCHEDULED_EMAILS_TOTAL':
      return assignToEmpty(state, {
        scheduledTotal: action.total
      });
    case RECEIVE_MULTIPLE_EMAILS:
      obj = assignToEmpty(state, action.emails);
      if (action.contactId) {
        obj.contactOffsets = assignToEmpty(state.contactOffsets, {});
        obj.contactOffsets[action.contactId] = action.offset;
      }
      if (action.listId) {
        obj.listOffsets = assignToEmpty(state.listOffsets, {
          [action.listId]: action.offset
        });
      }
      unseen = action.ids.filter(id => !state[id]);
      unsorted = state.received.concat(unseen);
      unsorted.sort(function(aId, bId) {
        const aDate = new Date(obj[aId].created);
        const bDate = new Date(obj[bId].created);
        if (aDate > bDate) return -1;
        if (aDate < bDate) return 1;
        return 0;
      });
      obj.received = unsorted;
      obj.isReceiving = false;
      return obj;
    case 'RECEIVE_MULTIPLE_EMAILS_MANUAL':
      obj = assignToEmpty(state, action.emails);
      if (action.contactId) {
        obj.contactOffsets = assignToEmpty(state.contactOffsets, {});
        obj.contactOffsets[action.contactId] = action.offset;
      }
      if (action.listId) {
        obj.listOffsets = assignToEmpty(state.listOffsets, {});
        obj.listOffsets[action.listId] = action.offset;
      }
      unseen = action.ids.filter(id => !state[id]);
      unsorted = state.received.concat(unseen);
      unsorted.sort(function(aId, bId) {
        const aDate = new Date(obj[aId].created);
        const bDate = new Date(obj[bId].created);
        if (aDate > bDate) return -1;
        if (aDate < bDate) return 1;
        return 0;
      });
      obj.received = unsorted;
      return obj;
    case EMAIL_SET_OFFSET:
      obj = assignToEmpty(state, {});
      if (action.scheduledOffset || action.scheduledOffset === null) obj.scheduledOffset = action.scheduledOffset;
      if (action.offset || action.offset === null) obj.offset = action.offset;
      if (action.archivedOffset || action.archivedOffset === null) obj.archivedOffset = action.archivedOffset;
      return obj;
    case SET_SCHEDULE_TIME:
      return assignToEmpty(state, {utctime: action.utctime});
    case CLEAR_SCHEDULE_TIME:
      return assignToEmpty(state, {utctime: null});
    case FETCH_EMAIL_LOGS:
      return Object.assign({}, state, {isReceiving: true});
    case RECEIVE_EMAIL_LOGS:
      return Object.assign({}, state, {
        [action.emailId]: assignToEmpty(state[action.emailId], {
          logs: action.logs,
          links: action.links,
        }),
        isReceiving: false
      });
    case 'SEND_EMAIL':
      return assignToEmpty(state, {isReceiving: true});
    case 'PATCH_EMAIL':
      return assignToEmpty(state, {isReceiving: true});
    case 'STAGING_MANUALLY_SET_ISRECEIVING_ON':
      return assignToEmpty(state, {isReceiving: true});
    case 'STAGING_MANUALLY_SET_ISRECEIVING_OFF':
      return assignToEmpty(state, {isReceiving: false});
    case 'RESET_STAGING_CONTACT_OFFSET':
      obj = assignToEmpty(state, {});
      obj.contactOffsets = assignToEmpty(state.contactOffsets, {});
      obj.contactOffsets[action.contactId] = 0;
      return obj;
    case STAGING_EMAILS_FAIL:
      return assignToEmpty(state, {didInvalidate: true, isReceiving: false});
    case 'RESET_STAGING_OFFSET':
      return assignToEmpty(state, {offset: 0});
    case 'RECEIVE_SEARCH_SENT_EMAILS':
      return assignToEmpty(state, {
        searchReceivedEmails: action.ids,
        searchQuery: action.query
      });
    case 'CANCEL_SCHEDULED_EMAILS':
      return assignToEmpty(state, {isReceiving: true});
    case 'CANCEL_SCHEDULED_EMAILS_FINISHED':
      return assignToEmpty(state, {isReceiving: false});
    case REQUEST_QUERY_EMAILS:
      let filterQuery = {query: action.query, received: []};
      if (state.filterQuery.query && isEqual(state.filterQuery.query, action.query)) {
        filterQuery.received = state.filterQuery.received;
      }
      return assignToEmpty(state, {filterQuery, isReceiving: true});
    case RECEIVE_QUERY_EMAILS:
      return assignToEmpty(state, {
        isReceiving: false,
        filterQuery: assignToEmpty(state.filterQuery, {
          received: action.ids,
          hitThreshold: action.hitThreshold,
          total: action.total
        })});
    default:
      return state;
  }
}

export default stagingReducer;
