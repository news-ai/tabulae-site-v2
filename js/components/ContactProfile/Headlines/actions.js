import {headlineConstant} from './constants';
import * as api from '../../../actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const headlineSchema = new Schema('headlines', {idAttribute: 'url'});

export function fetchContactHeadlines(contactId) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const contactObj = getState().headlineReducer[contactId];
    const OFFSET = contactObj ? contactObj.offset : 0;
    const isReceiving = getState().headlineReducer.isReceiving;
    if (OFFSET === null || isReceiving) return;
    dispatch({type: headlineConstant.REQUEST, contactId});
    return api.get(`/contacts/${contactId}/headlines?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      const res = normalize(response, {data: arrayOf(headlineSchema)});

      return dispatch({
        type: headlineConstant.RECEIVE,
        contactId,
        headlines: res.entities.headlines,
        ids: res.result.data,
        offset: res.result.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT});
    })
    .catch(err => {
      dispatch({type: headlineConstant.REQUEST_FAIL});
    });
  };
}
