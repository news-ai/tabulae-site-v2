import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function listsContactBelongsToReducer(state=initialState.listsContactBelongsToReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);
  let obj;
  switch (action.type) {
    case 'RECEIVE_LISTS_CONTACT_BELONGS_TO':
      return assignToEmpty(state, {
        [action.contactid]: action.ids
      });
    default:
      return state;
  }
}

export default listsContactBelongsToReducer;