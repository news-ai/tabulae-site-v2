import React from 'react';
import {grey700} from 'material-ui/styles/colors';
import ContactDescriptor from './ContactDescriptor.jsx';
import find from 'lodash/find';

const ContactCustomDescriptions = ({contact, patchContact, list}) => {
  return (
    <div id='contact_profile_custom_hop' style={{marginTop: 10, marginBottom: 20, marginLeft: 8}}>
      <span style={{fontSize: '1.1em'}}>Custom Fields</span>
      <div style={{marginLeft: 5}}>
      {list && contact && list.fieldsmap.some(fieldObj => fieldObj.customfield && !fieldObj.readonly) ?
        list.fieldsmap
        .filter(fieldObj => fieldObj.customfield && !fieldObj.readonly)
        .map((fieldObj, i) => {
          const customValue = contact.customfields !== null && find(contact.customfields, customObj => customObj.name === fieldObj.value);
          return (
            <ContactDescriptor
            disabled={contact.readonly}
            key={i}
            showTitle
            content={customValue && customValue.value}
            contentTitle={fieldObj.name}
            onBlur={(value) => {
              let customfields;
              if (contact.customfields === null) {
                customfields = [{name: fieldObj.value, value}];
              } else if (!contact.customfields.some(customObj => customObj.name === fieldObj.value)) {
                customfields = [...contact.customfields.filter(field => !list.fieldsmap.some(obj => obj.readonly && obj.value === field.name)), {name: fieldObj.value, value}];
              } else {
                customfields = contact.customfields.map(customObj => {
                  if (customObj.name === fieldObj.value) return {name: fieldObj.value, value};
                  return customObj;
                })
                .filter(field => !list.fieldsmap.some(obj => obj.readonly && obj.value === field.name));
              }
              patchContact(contact.id, {customfields});
            }}
            />);
        }) : <span style={{fontSize: '0.9em', color: grey700}}>There are no custom fields. You can generate them as custom columns in Sheet.</span>}
      </div>
    </div>);
};

export default ContactCustomDescriptions;
