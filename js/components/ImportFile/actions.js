import {
  TURN_ON_PROCESS_WAIT,
  TURN_OFF_PROCESS_WAIT,
  fileConstant,
  headerConstant
} from './constants';
import * as api from 'actions/api';

const mockApi = () => {
  return new Promise((resolve, reject) => {
    setTimeout(_ => {
      return reject('boom!');
    }, 50);
  });
};

export function uploadFile(listId, file) {
  return dispatch => {
    dispatch({type: fileConstant.REQUEST, listId, file});
    return api.postFile(`/lists/${listId}/upload`, file)
    .then(
      response => dispatch({type: fileConstant.RECEIVE, file: response.data, listId}),
      error => dispatch({type: fileConstant.REQUEST_FAIL, error})
      );
  };
}

export function fetchHeaders(listId) {
  return (dispatch, getState) => {
    const fileId = getState().fileReducer[listId].id;
    dispatch({type: headerConstant.REQUEST, listId});
    return api.get(`/files/${fileId}/headers`)
    .then(
      response => dispatch({type: headerConstant.RECEIVE, headers: response.data, listId}),
      error => dispatch({type: headerConstant.REQUEST_FAIL, error, listId})
      );
  };
}

export function addHeaders(listId, order, headernames) {
  return (dispatch, getState) => {
    dispatch({type: headerConstant.CREATE_REQUEST, order, headernames});
    dispatch({type: TURN_ON_PROCESS_WAIT, listId});
    const fileId = getState().fileReducer[listId].id;
    return api.post(`/files/${fileId}/headers`, {order, headernames})
    .then(
      response => {
        dispatch({type: headerConstant.CREATE_RECEIVED, response});
        dispatch({type: TURN_OFF_PROCESS_WAIT, listId});
      },
      error => dispatch({type: headerConstant.REQUEST_FAIL, error})
    );
  };
}
