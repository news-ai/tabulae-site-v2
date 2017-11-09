import {
  loginConstant,
  SET_FIRST_TIME_USER,
  REMOVE_FIRST_TIME_USER
} from './constants';
import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function personReducer(state=initialState.personReducer, action) {
  if (process.env.NODE_ENV === 'development') Object.freeze(state);
  switch (action.type) {
    case loginConstant.REQUEST:
      return assignToEmpty(state, {isReceiving: true});
    case loginConstant.RECEIVE:
      return assignToEmpty(state, {
        isReceiving: false,
        person: action.person
      });
    case loginConstant.REQUEST_FAIL:
      return assignToEmpty(state, {
        isReceiving: false,
        didInvalidate: true
      });
    case SET_FIRST_TIME_USER:
      return assignToEmpty(state, {firstTimeUser: true});
    case REMOVE_FIRST_TIME_USER:
      return assignToEmpty(state, {firstTimeUser: false});
    case 'POSTING_FEEDBACK':
      return assignToEmpty(state, {
        feedbackIsReceiving: true
      });
    case 'POSTED_FEEDBACK':
      return assignToEmpty(state, {
        feedback: true,
        feedbackIsReceiving: false
      });
    case 'POSTED_FEEDBACK_FAIL':
      return assignToEmpty(state, {
        feedback: false,
        feedbackIsReceiving: false,
        feedbackDidInvalidate: true
      });
    case 'RECEIVE_USER':
      return assignToEmpty(state, {[action.user.id]: action.user, currentFetchingUsers: state.currentFetchingUsers.filter(id => id !== action.user.id)});
    case 'FETCH_USER':
      if (!state.currentFetchingUsers.some(id => id === action.userId)) {
        return assignToEmpty(state, {currentFetchingUsers: [...state.currentFetchingUsers, action.userId]});
      } else {
        return state;
      }
    case 'RECEIVE_EMAIL_MAX_ALLOWANCE':
      return assignToEmpty(state, {
        allowance: action.allowance,
        ontrial: action.ontrial,
        dailyEmailsAllowed: action.dailyEmailsAllowed,
        numEmailsSentToday: action.numEmailsSentToday,
        membershipPlan: action.membershipPlan
      });
    default:
      return state;
  }
}

export default personReducer;
