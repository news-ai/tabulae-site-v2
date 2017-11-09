import {feedConstant} from './constants';
import * as api from 'actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const feedSchema = new Schema('feeds');
// const listSchema = new Schema('lists');

export function addFeed(contactid, listid, feedUrl) {
  return dispatch => {
    const feedBody = {contactid, listid, url: feedUrl};
    dispatch({type: feedConstant.ADD_REQUESTED, body: feedBody});
    return api.post(`/feeds`, feedBody)
    .then(response => dispatch({type: feedConstant.ADD_RECEIVED, response}))
    .catch(err => console.log(err));
  };
}

export function deleteFeed(feedId) {
  return dispatch => {
    dispatch({type: 'DELETE_FEED', feedId});
    return api.deleteRequest(`/feeds/${feedId}`)
    .then(response => console.log(response))
    .catch(err => console.log(err));
  };
}

export function fetchContactFeeds(contactId) {
  return dispatch => {
    dispatch({type: feedConstant.REQUEST_MULTIPLE, contactId});
    return api.get(`/contacts/${contactId}/feeds`)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(feedSchema),
      });
      return dispatch({
        type: feedConstant.RECEIVE_MULTIPLE,
        feeds: res.entities.feeds,
        ids: res.result.data,
        contactId
      });
    })
    .catch(err => console.log(err));
  };
}

export function copyFeeds(oldContactId, newContactId, listid) {
  return (dispatch, getState) => {
    dispatch({type: 'COPY_FEED'});
    return api.get(`/contacts/${oldContactId}/feeds`)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(feedSchema),
      });
      const feeds = res.entities.feeds;
      const ids = res.result.data;
      ids.map(id => dispatch(addFeed(newContactId, listid, feeds[id].url)));
    })
    .catch(err => console.log(err));
  };
}
