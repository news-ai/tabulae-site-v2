import {
  listConstant,
  LIST_CONTACTS_SEARCH_REQUEST,
  LIST_CONTACTS_SEARCH_RECEIVED,
  LIST_CONTACTS_SEARCH_FAIL,
  ARCHIVE_LIST,
  ARCHIVE_LIST_FINISHED
} from './constants';
import {CLIENT_LISTS_REQUEST, CLIENT_LISTS_RECEIVED} from 'components/ClientDirectories/constants';

import {assignToEmpty} from 'utils/assign';
import {initialState} from 'reducers/initialState';


function listReducer(state = initialState.listReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);

  let unarchivedLists = [];
  let archivedLists = [];
  let publicLists = [];
  let tagLists = [];
  let teamLists = [];
  let obj;
  switch (action.type) {
    case 'DELETE_LIST_COMPLETE':
      obj = assignToEmpty(state, {
        received: state.received.filter(id => id !== action.listId),
        archivedLists: state.archivedLists.filter(id => id !== action.listId)
      });
      return obj;
    case 'CLEAR_LIST_REDUCER':
      obj = assignToEmpty(initialState.listReducer, {});
      return obj;
    case LIST_CONTACTS_SEARCH_REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case LIST_CONTACTS_SEARCH_RECEIVED:
      obj = assignToEmpty(state, {});
      obj[action.listId] = assignToEmpty(state[action.listId], {searchResults: action.ids});
      obj.isReceiving = false;
      obj.didInvalidate = false;
      return obj;
    case 'CLEAR_LIST_SEARCH':
      obj = assignToEmpty(state, {});
      obj[action.listId].searchResults = undefined;
      return obj;
    case listConstant.MANUALLY_SET_ISRECEIVING_ON:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case listConstant.MANUALLY_SET_ISRECEIVING_OFF:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      return obj;
    case CLIENT_LISTS_REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case CLIENT_LISTS_RECEIVED:
      obj = assignToEmpty(state, action.lists);
      obj.received = state.received.concat(action.ids.filter(id => !state.received.some(listId => listId === id)));
      obj.isReceiving = false;
      return obj;
    case listConstant.REQUEST_MULTIPLE:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case listConstant.RECEIVE_MULTIPLE:
      obj = assignToEmpty(state, action.lists);
      const allLists = [...state.received, ...action.ids.filter(id => !state[id])];
      obj.received = allLists;
      obj.isReceiving = false;
      obj.didInvalidate = false;

      switch (action.order) {
        case 'mostRecentlyCreated':
          obj.mostRecentlyCreated.received = [...state.mostRecentlyCreated.received, ...action.ids];
          obj.mostRecentlyCreated.offset = action.offset;
          return obj;
        case 'leastRecentlyCreated':
          obj.leastRecentlyCreated.received = [...state.leastRecentlyCreated.received, ...action.ids];
          obj.leastRecentlyCreated.offset = action.offset;
          return obj;
        case 'leastRecentlyUsed':
          obj.leastRecentlyUsed.received = [...state.leastRecentlyUsed.received, ...action.ids];
          obj.leastRecentlyUsed.offset = action.offset;
          return obj;
        case 'alphabetical':
          obj.alphabetical.received = [...state.alphabetical.received, ...action.ids];
          obj.alphabetical.offset = action.offset;
          return obj;
        case 'antiAlphabetical':
          obj.antiAlphabetical.received = [...state.antiAlphabetical.received, ...action.ids];
          obj.antiAlphabetical.offset = action.offset;
          return obj;
        case 'lists':
          obj.lists.received = [...state.lists.received, ...action.ids];
          obj.lists.offset = action.offset;
          return obj;
      }

      // rebuild all lists
      allLists.map(id => {
        const list = obj[id];
        // if (!list.archived && !list.publiclist) unarchivedLists.push(id);
        if (list.archived) archivedLists.push(id);
        if (list.publiclist) publicLists.push(id);
        if (action.teamId === list.teamid) teamLists.push(id);
        obj[id] = Object.assign({}, obj[id], {offset: 0});
      });
      // obj.lists.received = unarchivedLists;
      obj.public.received = publicLists;
      obj.archived.received = archivedLists;
      obj.team.received = teamLists;

      // if (action.offset !== undefined) obj.lists.offset = action.offset;
      if (action.archivedOffset !== undefined) obj.archived.offset = action.archivedOffset;
      if (action.publicOffset !== undefined) obj.public.offset = action.publicOffset;
      if (action.teamOffset !== undefined) obj.team.offset = action.teamOffset;
      if (action.tagOffset !== undefined) obj.tagOffset = action.tagOffset;
      if (action.tagQuery !== undefined) {
        obj.tagLists = action.tagQuery === state.tagQuery ? [...state.tagLists, ...action.ids] : [...action.ids];
        obj.tagQuery = action.tagQuery;
      }
      return obj;
    case 'RESET_LIST_REDUCER_ORDERS':
      return assignToEmpty(state, {
        lists: {offset: 0, received: []},
        leastRecentlyUsed: {offset: 0, received: []}, 
        mostRecentlyCreated: {offset: 0, received: []}, 
        leastRecentlyCreated: {offset: 0, received: []}, 
        alphabetical: {offset: 0, received: []}, 
        antiAlphabetical: {offset: 0, received: []}, 
      });
    case 'RESET_LIST_REDUCER_ORDER':
      return assignToEmpty(state, {
        [action.order] : {offset: 0, received: []},
      });
    case listConstant.REQUEST_FAIL:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      obj.didInvalidate = true;
      return obj;
    case listConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case listConstant.RECEIVE:
      obj = assignToEmpty(state, action.list);
      obj.isReceiving = false;
      if (!state.received.some(id => id === action.id)) obj.received = [action.id, ...state.received];
      // obj.received.map(id => {
      //   const list = obj[id];
      //   if (!list.archived) unarchivedLists.push(list.id);
      //   if (list.archived) archivedLists.push(list.id);
      // });
      // obj.lists.received = unarchivedLists;
      // obj.archived.received = archivedLists;
      obj.didInvalidate = false;
      return obj;
    case listConstant.PATCH:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      return obj;
    case listConstant.PATCH_FAIL:
      obj = assignToEmpty(state, {});
      obj.isReceiving = false;
      return obj;
    case listConstant.SET_OFFSET:
      obj = assignToEmpty(state, {});
      obj[action.listId].offset = action.offset;
      return obj;
    default:
      return state;
  }
}

export default listReducer;
