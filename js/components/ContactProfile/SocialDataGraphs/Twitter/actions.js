import {twitterDataConstant} from './constants';
import * as api from '../../../../actions/api';

export function fetchContactTwitterData(contactId) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const contactObj = getState().twitterDataReducer[contactId];
    const OFFSET = contactObj ? contactObj.offset : 0;
    const isReceiving = getState().twitterDataReducer.isReceiving;
    if (OFFSET === null || isReceiving) return;
    dispatch({type: twitterDataConstant.REQUEST, contactId});
    return api.get(`/contacts/${contactId}/twittertimeseries?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      return dispatch({
        type: twitterDataConstant.RECEIVE,
        contactId,
        data: response.data,
        offset: response.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT
      });
    })
    .catch(err => dispatch({type: twitterDataConstant.REQUEST_FAIL, message: err}));
  };
}

export function fetchMultipleContactTwitterData(listId, selected, days) {
  return (dispatch, getState) => {
    const contacts = selected.filter(id => getState().contactReducer[id].twitter !== null);
    dispatch({type: twitterDataConstant.REQUEST_MULTIPLE, contacts, days, listId});
    return api.post(`/lists/${listId}/twittertimeseries`, {ids: contacts, days})
    .then(response => {
      let contact, contactData;
      contacts.map(contactId => {
        contact = getState().contactReducer[contactId];
        contactData = response.data.filter(obj => obj.Username === contact.twitter);
        dispatch({
          type: twitterDataConstant.RECEIVE,
          contactId: contact.id,
          data: contactData,
          offset: getState().twitterDataReducer[contact.id]
        });
      });
    })
    .catch(err => dispatch({type: twitterDataConstant.REQUEST_MULTIPLE_FAIL, message: err}));
  };
}
