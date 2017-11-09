import {
  REQUEST_PUBLICATION_DATABASE_PROFILE,
  RECEIVE_PUBLICATION_DATABASE_PROFILE,
  REQUEST_PUBLICATION_DATABASE_PROFILE_FAIL,
} from './constants';
import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function publicationProfileReducer(state = initialState.publicationProfileReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);

  let obj;
  switch (action.type) {
    case REQUEST_PUBLICATION_DATABASE_PROFILE:
      obj = assignToEmpty(state, {
        isReceiving: true
      });
      return obj;
    case RECEIVE_PUBLICATION_DATABASE_PROFILE:
      obj = assignToEmpty(state, {
        [action.publicationId]: action.profile,
        isReceiving: false
      });
      return obj;
    case REQUEST_PUBLICATION_DATABASE_PROFILE_FAIL:
      obj = assignToEmpty(state, {
        didInvalidate: true
      });
      return obj;
    default:
      return state;
  }
}

export default publicationProfileReducer;
