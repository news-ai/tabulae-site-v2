import * as api from 'actions/api';
import {actions as listActions} from 'components/Lists';
import {actions as contactActions} from 'components/Contacts';
import {constants as contactConstant} from 'components/Contacts';
import {normalize, Schema, arrayOf} from 'normalizr';
const contactSchema = new Schema('contacts', { idAttribute: 'id' });
const publicationSchema = new Schema('publications', { idAttribute: 'id' });

export function copyContactsToList(contacts, listid) {
  return dispatch => {
    dispatch({type: 'COPY_CONTACTS_TO_LIST', contacts, listid});
    dispatch({type: contactConstant.MANUALLY_SET_ISRECEIVING_ON});
    return api.post(`/contacts/copy`, {contacts, listid})
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(contactSchema),
        included: arrayOf(publicationSchema)
      });
      return dispatch(contactActions.receiveContacts(res.entities.contacts, res.result.data))
    },
    err => {
      dispatch({type: contactConstant.MANUALLY_SET_ISRECEIVING_OFF});
      Promise.reject(err);
    })
    .then(_ => dispatch(listActions.fetchList(listid)));
  };
}

