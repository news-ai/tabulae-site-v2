import * as constants from './constants';
import * as api from '../../actions/api';
import {normalize, arrayOf, Schema} from 'normalizr';
const listSchema = new Schema('lists');

export function fetchClientNames() {
  return dispatch => {
    dispatch({type: constants.CLIENT_NAMES_REQUEST});
    return api.get('/lists/clients')
    .then(response => dispatch({type: constants.CLIENT_NAMES_RECEIVED, clientnames: response.data.clients}))
    .catch(err => dispatch({type: constants.CLIENT_NAMES_REQUEST_FAIL, err}));
  };
}

export function fetchClientLists(clientQuery) {
  return (dispatch, getState) => {
    if (getState().clientReducer.isReceiving) return;
    dispatch({type: constants.CLIENT_LISTS_REQUEST, clientQuery});
    return api.get(`/lists?q=client:${clientQuery}`)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(listSchema),
      });
      dispatch({
        type: constants.CLIENT_LISTS_RECEIVED,
        clientQuery,
        lists: res.entities.lists,
        ids: res.result.data,
      });
    })
    .catch(err => dispatch({type: constants.CLIENT_LISTS_REQUEST_FAIL, err}));
  };
}
