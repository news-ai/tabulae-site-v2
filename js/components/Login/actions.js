import * as api from 'actions/api';
import {
  loginConstant,
  SET_FIRST_TIME_USER,
  REMOVE_FIRST_TIME_USER
} from './constants';
import alertify from 'alertifyjs';
import 'node_modules/alertifyjs/build/css/alertify.min.css';
alertify.set('notifier', 'position', 'top-right');

function requestLogin() {
  return {
    type: loginConstant.REQUEST
  };
}

function receiveLogin(person) {
  return {
    type: loginConstant.RECEIVE,
    person
  };
}

function loginFail(message) {
  return {
    type: loginConstant.REQUEST_FAIL,
    message
  };
}

export function addExtraEmail(email) {
  return dispatch => {
    dispatch({type: 'ADD_EXTRA_EMAIL', email});
    return api.post(`/users/me/add-email`, {email})
    .then(response => {
      alertify.notify(`Confirmation email has been sent to ${email}`, 'custom', 8, function() {});
      dispatch({type: 'ADD_EXTRA_EMAIL_CONFIRMATION_SENT'});
      dispatch({type: 'RECEIVE_NOTIFICATION', message: `Confirmation email has been sent to ${email}`});
      return dispatch(receiveLogin(response.data));
    })
    .catch(err => console.log(err));
  };
}

export function postFeedback(reason, feedback) {
  return (dispatch) => {
    dispatch({type: 'POSTING_FEEDBACK', reason, feedback});
    return api.post(`/users/me/feedback`, {reason, feedback})
    .then(response => dispatch({type: 'POSTED_FEEDBACK'}))
    .catch(err => dispatch({type: 'POSTED_FEEDBACK_FAIL'}));
  };
}

export function setFirstTimeUser() {
  return dispatch => dispatch({type: SET_FIRST_TIME_USER});
}

export function removeFirstTimeUser() {
  return dispatch => dispatch({type: REMOVE_FIRST_TIME_USER});
}

export function loginWithGoogle() {
  return dispatch => {
    const base = `${window.TABULAE_API_BASE}/auth/google?next=${window.location}`;
    dispatch({type: 'LOGIN WITH GOOGLE'});
    window.location.href = base;
  };
}

export function getEmailMaxAllowance() {
  return (dispatch, getState) => {
    if (getState().personReducer.allowance) return Promise.resolve(true);
    dispatch({type: 'REQUEST_EMAIL_MAX_ALLOWANCE'});
    return api.get(`/users/me/plan-details`)
    .then(response => dispatch({
      type: 'RECEIVE_EMAIL_MAX_ALLOWANCE',
      allowance: response.data.emailaccounts,
      ontrial: response.data.ontrial,
      dailyEmailsAllowed: response.data.dailyemailsallowed,
      numEmailsSentToday: response.data.emailssenttoday,
      membershipPlan: response.data.planname
    }))
    .catch(err => console.log(err));
  };
}

export function onLogin() {
  return dispatch => {
    const base = `${window.TABULAE_API_BASE}/auth?next=${window.location}`;
    dispatch({type: 'LOGIN'});
    window.location.href = base;
  };
}

export function register() {
  return dispatch => {
    const base = `${window.TABULAE_API_BASE}/auth/registration?next=${window.location}`;
    dispatch({type: 'REGISTER'});
    window.location.href = base;
  };
}

export function logout() {
  return dispatch => {
    const base = `${window.TABULAE_API_BASE}/auth/logout?next=${window.location}`;
    dispatch({type: 'LOGOUT'});
    window.location.href = base;
  };
}

// OBSOLETE!! Moved to epics
// export function fetchPerson() {
//   return (dispatch, getState) => {
//     if (getState().personReducer.person) return;
//     dispatch(requestLogin());
//     return api.get('/users/me')
//     .then(response => dispatch(receiveLogin(response.data)))
//     .catch(message => {
//       if (process.env.NODE_ENV === 'development') console.log(message);
//     });
//   };
// }

export function fetchUser(userId) {
  return (dispatch, getState) => {
    if (getState().personReducer[userId] || getState().personReducer.currentFetchingUsers.some(id => id === userId)) return;
    dispatch({type: 'FETCH_USER', userId});
    return api.get(`/users/${userId}`)
    .then(response => dispatch({type: 'RECEIVE_USER', user: response.data}))
    .catch(message => {
      if (process.env.NODE_ENV === 'development') console.log(message);
    });
  };
}

export function removeExternalEmail(email) {
  return dispatch => {
    dispatch({type: 'START_REMOVE_EXTERNAL_EMAIL'});
    return api.post(`/users/me/remove-email`, {email})
    .then(response => dispatch(receiveLogin(response.data)))
    .catch(err => console.log(err));
  };
}

export function patchPerson(personBody) {
  return dispatch => {
    dispatch({type: 'PATCH_PERSON', personBody});
    return api.patch(`/users/me`, personBody)
    .then(response => dispatch(receiveLogin(response.data)))
    .catch(message => {
      if (process.env.NODE_ENV === 'development') console.log(message);
    });
  };
}
