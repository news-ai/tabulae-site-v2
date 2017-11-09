import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

const IS_FETCHING = 'IS_FETCHING';
const IS_FETCHING_DONE = 'IS_FETCHING_DONE';


function isFetchingReducer(state = initialState.isFetchingReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);
  let obj;
  switch (action.type) {
    case IS_FETCHING:
      obj = assignToEmpty(state, {
        [action.resource]: assignToEmpty(state[action.resource], {
          [action.id]: {}
        })
      });
      if (state[action.resource][action.id]) {
        obj[action.resource][action.id] = assignToEmpty(state[action.resource][action.id], {[action.fetchType]: true});
      } else {
        obj[action.resource][action.id] = {[action.fetchType]: true};
      }
      return obj;
    case IS_FETCHING_DONE:
      obj = assignToEmpty(state, {
        [action.resource]: assignToEmpty(state[action.resource], {
          [action.id]: {}
        })
      });
      if (state[action.resource][action.id]) {
        obj[action.resource][action.id] = assignToEmpty(state[action.resource][action.id], {[action.fetchType]: false});
      } else {
        obj[action.resource][action.id] = {[action.fetchType]: false};
      }
      return obj;
    default:
      return state;
  }
}

export default isFetchingReducer;
