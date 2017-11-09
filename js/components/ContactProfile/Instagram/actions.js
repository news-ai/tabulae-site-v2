import {instagramConstant} from './constants';
import * as api from '../../../actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const instagramSchema = new Schema('instagrams', {idAttribute: 'instagramid'});

export function fetchContactInstagrams(contactId) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const contactObj = getState().instagramReducer[contactId];
    const OFFSET = contactObj ? contactObj.offset : 0;
    const isReceiving = getState().instagramReducer.isReceiving;
    if (OFFSET === null || isReceiving) return;
    dispatch({type: instagramConstant.REQUEST, contactId});
    return api.get(`/contacts/${contactId}/instagrams?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      const res = normalize(response, {data: arrayOf(instagramSchema)});
      return dispatch({
        type: instagramConstant.RECEIVE,
        contactId,
        instagrams: res.entities.instagrams,
        ids: res.result.data,
        offset: res.result.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT});
    })
    .catch(err => dispatch({type: instagramConstant.REQUEST_FAIL, message: err}));
  };
}
