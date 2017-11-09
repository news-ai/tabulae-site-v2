import {instagramDataConstant} from './constants';
import * as api from '../../../../actions/api';

export function fetchContactInstagramData(contactId) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const contactObj = getState().instagramDataReducer[contactId];
    const OFFSET = contactObj ? contactObj.offset : 0;
    const isReceiving = getState().instagramDataReducer.isReceiving;
    if (OFFSET === null || isReceiving) return;
    dispatch({type: instagramDataConstant.REQUEST, contactId});
    return api.get(`/contacts/${contactId}/instagramtimeseries?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      return dispatch({
        type: instagramDataConstant.RECEIVE,
        contactId,
        data: response.data,
        offset: response.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT
      });
    })
    .catch(err => dispatch({type: instagramDataConstant.REQUEST_FAIL, message: err}));
  };
}

export function fetchMultipleContactInstagramData(listId, contacts, days) {
  return (dispatch, getState) => {
    dispatch({type: instagramDataConstant.REQUEST_MULTIPLE, contacts, days, listId});
    return api.post(`/lists/${listId}/instagramtimeseries`, {ids: contacts, days})
    .then(response => {
      let contact, contactData;
      contacts.map(contactId => {
        contact = getState().contactReducer[contactId];
        contactData = response.data.filter(obj => obj.Username === contact.instagram);
        dispatch({
          type: instagramDataConstant.RECEIVE,
          contactId: contact.id,
          data: contactData,
          offset: getState().instagramDataReducer[contact.id]
        });
      });
    })
    .catch(err => dispatch({type: instagramDataConstant.REQUEST_MULTIPLE_FAIL, message: err}));
  };
}
