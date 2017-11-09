import {mixedConstant} from './constants';
import * as api from '../../../actions/api';

export function fetchMixedFeed(contactId) {
  const PAGE_LIMIT = 20;
  return (dispatch, getState) => {
    const contactObj = getState().mixedReducer[contactId];
    const OFFSET = contactObj ? contactObj.offset : 0;
    const isReceiving = getState().mixedReducer.isReceiving;
    if (OFFSET === null || isReceiving) return;
    dispatch({type: mixedConstant.REQUEST_MULTIPLE, contactId});
    return api.get(`/contacts/${contactId}/feed?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      const newOffset = response.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT;
      return dispatch({
        type: mixedConstant.RECEIVE_MULTIPLE,
        feed: response.data,
        contactId,
        offset: newOffset});
    })
    .catch(err => dispatch({type: mixedConstant.REQUEST_MULTIPLE_FAIL, message: err}));
  };
}
