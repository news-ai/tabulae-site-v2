import {instagramProfileConstant} from './constants';
import * as api from '../../../../actions/api';
// const listSchema = new Schema('lists');

export function fetchInstagramProfile(contactId) {
  return (dispatch, getState) => {
    const isReceiving = getState().instagramProfileReducer.isReceiving;
    if (isReceiving) return;
    dispatch({type: instagramProfileConstant.REQUEST, contactId});
    return api.get(`/contacts/${contactId}/instagramprofile`)
    .then(response => {
      const res = response.data;
      return dispatch({
        type: instagramProfileConstant.RECEIVE,
        contactId,
        profile: res,
      });
    })
    .catch(err => dispatch({type: instagramProfileConstant.REQUEST_FAIL, message: err}));
  };
}
