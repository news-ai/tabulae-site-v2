import {
  ADDING_CONTACT,
  contactConstant,
} from './constants';
import {
  listConstant,
  LIST_CONTACTS_SEARCH_REQUEST,
  LIST_CONTACTS_SEARCH_RECEIVED,
  LIST_CONTACTS_SEARCH_FAIL
} from 'components/Lists/constants';
import * as api from 'actions/api';
import {actions as publicationActions} from 'components/Publications';
import {actions as listActions} from 'components/Lists';
import isEmpty from 'lodash/isEmpty';

import {normalize, Schema, arrayOf} from 'normalizr';

const contactSchema = new Schema('contacts', { idAttribute: 'id' });
const publicationSchema = new Schema('publications', { idAttribute: 'id' });
const listSchema = new Schema('lists', { idAttribute: 'id' });

const PAGE_LIMIT = 50;

function requestContact() {
  return {
    type: contactConstant.REQUEST
  };
}

// helper function
function stripOutEmployers(publicationReducer, contacts, ids) {
  const newContacts = {};
  ids.map(id => {
    newContacts[id] = Object.assign({}, contacts[id]);
    if (!isEmpty(contacts[id].employers)) {
      contacts[id].employers.map((employerId, i) => {
        if (publicationReducer[employerId]) newContacts[id][`publication_name_${i + 1}`] = publicationReducer[employerId].name;
      });
    }
  });
  return newContacts;
}

export function receiveContacts(contacts, ids) {
  return (dispatch, getState) => {
    const publicationReducer = getState().publicationReducer;
    const contactsWithEmployers = stripOutEmployers(publicationReducer, contacts, ids);
    return dispatch({
      type: contactConstant.RECEIVE_MULTIPLE,
      contacts: contactsWithEmployers,
      ids
    });
  };
}

function receiveContact(contact) {
  return dispatch => {
    // if (contact.employers !== null) contact.employers.map( pubId => dispatch(publicationActions.fetchPublication(pubId)));
    return dispatch({
      type: contactConstant.RECEIVE,
      contact
    });
  };
}

function requestContactFail(message) {
  console.log(message);
  return {
    type: contactConstant.REQUEST_FAIL,
    message
  };
}

export function fetchContact(contactId) {
  return dispatch => {
    dispatch(requestContact());
    return api.get(`/contacts/${contactId}`)
    .then(response => {
      const listOnly = response.included.filter(item => item.type === 'lists');
      const pubOnly = response.included.filter(item => item.type === 'publications');
      response.lists = listOnly;
      response.publications = pubOnly;
      const res = normalize(response, {
        data: contactSchema,
        lists: arrayOf(listSchema),
        publications: arrayOf(publicationSchema)
      });
      dispatch(listActions.receiveLists(res.entities.lists, res.result.lists, 0));
      dispatch(publicationActions.receivePublications(res.entities.publications, res.result.publications));
      return dispatch(receiveContacts(res.entities.contacts, [res.result.data]));
    })
    .catch(message => dispatch(requestContactFail(message)));
  };
}

export function patchContact(contactId, contactBody) {
  return (dispatch, getState) => {
    dispatch(requestContact());
    const contact = Object.assign({}, getState().contactReducer[contactId], contactBody);
    return api.patch(`/contacts/${contactId}`, contact)
    .then(response => {
      // const res = normalize(response, {data: contactSchema});
      return dispatch(receiveContacts({[response.data.id]: response.data}, [response.data.id]));
    })
    .catch(message => dispatch(requestContactFail(message)));
  };
}

export function deleteContact(contactId) {
  return dispatch => {
    dispatch({type: 'DELETE_CONTACT', contactId});
    return api.deleteRequest(`/contacts/${contactId}`)
    .then(response => dispatch({type: 'DELETED_CONTACT', contactId}))
    .catch(err => console.log(err));
  };
}

export function deleteContacts(ids) {
  return dispatch => {
    dispatch({type: 'DELETE_CONTACTS', ids});
    return api.post(`/contacts/bulkdelete`, {contacts: ids})
    .then(response => {
      // console.log(response);
      return dispatch({type: 'DELETED_CONTACTS', data: response.data});
    })
    .catch(err => console.log(err));
  };
}

// used to lazy-load a page, keeps track of the last offset
export function fetchPaginatedContacts(listId) {
  // const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    if (getState().listReducer[listId].contacts === null) return;
    const OFFSET = getState().listReducer[listId].offset;
    if (OFFSET === null) return;
    dispatch(requestContact());
    return api.get(`/lists/${listId}/contacts?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      dispatch({
        type: listConstant.SET_OFFSET,
        offset: response.count === PAGE_LIMIT ? (PAGE_LIMIT + OFFSET) : null,
        listId
      });
      const res = normalize(response, {
        data: arrayOf(contactSchema),
        included: arrayOf(publicationSchema)
      });
      dispatch(publicationActions.receivePublications(res.entities.publications, res.result.included));
      dispatch(receiveContacts(res.entities.contacts, res.result.data));
    })
    .catch( message => dispatch(requestContactFail(message)));
  };
}

// fetch page without concern to where offset was last
function fetchContactsPage(listId, pageLimit, offset) {
  return dispatch => {
    return api.get(`/lists/${listId}/contacts?limit=${pageLimit}&offset=${offset}`)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(contactSchema),
        included: arrayOf(publicationSchema)
      });
      dispatch(publicationActions.receivePublications(res.entities.publications, res.result.included));
      return dispatch(receiveContacts(res.entities.contacts, res.result.data));
    })
    .catch(message => dispatch(requestContactFail(message)));
  };
}

export function loadAllContacts(listId) {
  // const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    if (getState().listReducer[listId].contacts === null) return;
    const contacts = getState().listReducer[listId].contacts;
    dispatch({type: 'FETCH_ALL_CONTACTS', listId});
    dispatch(requestContact());
    let promises = [];
    for (let i = 0; i < (contacts.length / PAGE_LIMIT) + 1; i++) {
      promises.push(
        dispatch(fetchContactsPage(listId, PAGE_LIMIT, i * PAGE_LIMIT))
        .then(_ => {
          // poll how many received
          const contactReducer = getState().contactReducer;
          const count = contacts.filter(id => contactReducer[id]).length;
          if (count === contacts.length) dispatch({type: contactConstant.MANUALLY_SET_ISRECEIVING_OFF});
          else dispatch({type: contactConstant.MANUALLY_SET_ISRECEIVING_ON, count});
        })
      );
    }
    dispatch({ type: listConstant.SET_OFFSET, offset: null, listId});
    return Promise.all(promises);
  };
}

export function fetchManyContacts(listId, amount) {
  // const PAGE_LIMIT = 50;
  if (amount < PAGE_LIMIT) amount = PAGE_LIMIT;
  return (dispatch, getState) => {
    const contacts = getState().listReducer[listId].contacts;
    const offset = getState().listReducer[listId].offset || 0;
    const isReceiving = getState().contactReducer.isReceiving;
    if (contacts === null) return;
    const contactCount = contacts.filter(id => getState().contactReducer[id]).length;
    if (offset === null || isReceiving || contactCount === contacts.length) return;
    dispatch({type: 'FETCH_MANY_CONTACTS', listId, amount});
    dispatch({type: contactConstant.MANUALLY_SET_ISRECEIVING_ON});
    const startPage = offset / PAGE_LIMIT;
    const endPage = offset + amount >= contacts.length ? (contacts.length / PAGE_LIMIT) : (offset + amount) / PAGE_LIMIT;
    let promises = [];
    for (let i = startPage; i < endPage; i++) {
      promises.push(
        dispatch(fetchContactsPage(listId, PAGE_LIMIT, i * PAGE_LIMIT))
        .then(_ => {
          // poll how many received
          const contactReducer = getState().contactReducer;
          const count = contacts.filter(id => contactReducer[id]).length;
          // console.log('offset', offset);
          // console.log('amount', amount);;
          // console.log('length', contacts.length);
          if (offset + amount >= contacts.length && count === contacts.length) {
            // console.log('why');
            dispatch({type: contactConstant.MANUALLY_SET_ISRECEIVING_OFF});
            return dispatch({type: listConstant.SET_OFFSET, listId, offset: null});
          } else if (count === offset + amount) {
            // console.log('ok');
            dispatch({type: contactConstant.MANUALLY_SET_ISRECEIVING_OFF});
            return dispatch({type: listConstant.SET_OFFSET, listId, offset: offset + amount});
          // } else {
          //   console.log('huh');
          //   return dispatch({type: contactConstant.MANUALLY_SET_ISRECEIVING_ON});
          }
        })
        );
    }
    return Promise.all(promises);
  };
}

const flattenResponses = responses => {
  return responses.reduce((acc, response) => {
    let ids = acc.ids;
    let contacts = acc.contacts;
    const res = normalize(response, {
      data: arrayOf(contactSchema),
      included: arrayOf(publicationSchema)
    });
    ids = [...ids, ...res.result.data];
    contacts = Object.assign({}, contacts, res.entities.contacts);
    return {ids, contacts};
  }, {ids: [], contacts: {}});
};

function fetchSearchListContacts(listId, query) {
  const LIMIT = 50;
  return dispatch => {
    dispatch({type: LIST_CONTACTS_SEARCH_REQUEST, listId, query});
    return api.get(`/lists/${listId}/contacts?q="${query}"&limit=${LIMIT}&offset=0`)
    .then(response => {
      const total = response.summary.total;
      // need to fetch rest of search results
      if (total > response.data.length) {
        // build array of offsets
        const offsets = Array.from({length: Math.floor(total / LIMIT)}, (v, i) => i + LIMIT);
        const promises = offsets.map(offset => api.get(`/lists/${listId}/contacts?q="${query}"&limit=${LIMIT}&offset=${offset}`));
        return Promise.all(promises)
        .then(responses => {
          // include first result
          return flattenResponses([response, ...responses]);
        });
      }
      const res = normalize(response, {
        data: arrayOf(contactSchema),
        included: arrayOf(publicationSchema)
      });
      return {ids: res.result.data, contacts: res.entities.contacts};
    })
    .catch(message => dispatch({type: LIST_CONTACTS_SEARCH_FAIL, message}));
  };
}

export function searchListContacts(listId, query) {
  return (dispatch, getState) => {
    // do one fetch first to determine total to fetch
    return dispatch(fetchSearchListContacts(listId, query))
    .then(({ids, contacts}) => {
      ids.map(id => {
        if (contacts[id].customfields && contacts[id].customfields !== null) {
          contacts[id].customfields.map(field => {
            contacts[id][field.name] = field.value;
          });
        }
      });
      const publicationReducer = getState().publicationReducer;
      const contactsWithEmployers = stripOutEmployers(publicationReducer, contacts, ids);
      dispatch({type: LIST_CONTACTS_SEARCH_RECEIVED, ids, contactsWithEmployers, listId});
      // dispatch(receiveContacts(res.entities.contacts, res.result.data));
      return {searchContactMap: contactsWithEmployers, ids};
    });
  };
}

export function updateContact(id) {
  return dispatch => {
    return api.get(`/contacts/${id}/update`)
    .then(response => dispatch(receiveContact(response.data)))
    .catch(message => dispatch(requestContactFail(message)));
  };
}

export function patchContacts(contactList) {
  return dispatch => {
    dispatch({type: 'PATCH_CONTACTS', contactList});

    return api.patch(`/contacts`, contactList)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(contactSchema),
        included: arrayOf(publicationSchema)
      });
      dispatch(receiveContacts(res.entities.contacts, res.result.data));
    })
    .catch(message => console.log(message));
  };
}

export function addContacts(contactList) {
  return dispatch => {
    dispatch({type: ADDING_CONTACT, contactList});
    return api.post(`/contacts`, contactList)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(contactSchema),
        included: arrayOf(publicationSchema)
      });
      dispatch(receiveContacts(res.entities.contacts, res.result.data));
      return response.data;
    })
    .catch(message => dispatch({type: 'ADDING_CONTACT_FAIL', message}));
  };
}


