import {publicationConstant} from './constants';
import {assignToEmpty} from 'utils/assign';
import {initialState} from 'reducers/initialState';

function publicationReducer(state = initialState.publicationReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);

  let obj;
  switch (action.type) {
    case 'SEARCH_PUBLICATION_RECEIVE':
      return assignToEmpty(state, {
        searchCache: action.received,
      });
    case 'SEARCH_PUBLICATION_REQUEST':
      return assignToEmpty(state, {isReceiving: true});
    case publicationConstant.REQUEST:
      obj = assignToEmpty(state, {});
      obj.isReceiving = true;
      if (action.id) {
        obj[action.id] = {};
        obj[action.id].isReceiving = true;
      }
      return obj;
    case publicationConstant.RECEIVE:
      obj = assignToEmpty(state, {});
      if (!state.received.some(id => id === action.publication.id)) obj.received = [...state.received, action.publication.id];
      obj[action.publication.id] = action.publication;
      obj[action.publication.name] = action.publication.id;
      obj.isReceiving = false;
      obj[action.publication.id].isReceiving = false;
      return obj;
    case publicationConstant.RECEIVE_MULTIPLE:
      let received = state.received;
      obj = assignToEmpty(state, action.publications);
      if (action.ids !== null) {
        received = received.concat(action.ids.filter(id => !state[id]));
        action.ids.map(id => {
          obj[action.publications[id].name] = id;
        });
      }
      obj.received = received;
      obj.isReceiving = false;
      return obj;
    default:
      return state;
  }
}

export default publicationReducer;
