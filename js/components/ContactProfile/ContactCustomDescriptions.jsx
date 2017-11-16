import React from 'react';
import {grey700} from 'material-ui/styles/colors';
import ContactDescriptor from './ContactDescriptor.jsx';
import find from 'lodash/find';
import flatten from 'lodash/flatten';
import uniqBy from 'lodash/uniqBy';

const ContactCustomDescriptions = ({contact, patchContact, list, listsBelong}) => {
  const allCustomListFields = uniqBy(
    flatten(listsBelong.map(list => list.fieldsmap)).filter(listFieldObj => listFieldObj.customfield),
    listFieldObj => listFieldObj.value
    );
  console.log(allCustomListFields);
  const customfieldsWithLabel = contact.customfields.map((field) => {
    const listFieldWithLabel = find(allCustomListFields, listFieldObj => listFieldObj.value === field.name);
    if (!listFieldWithLabel) return undefined;
    return Object.assign({}, field, {label: listFieldWithLabel.name});
  }).filter(obj => !!obj);
  return (
    <div id='contact_profile_custom_hop' style={{marginTop: 10, marginBottom: 20, marginLeft: 8}}>
      <span style={{fontSize: '1.1em'}}>Custom Fields</span>
      <div style={{marginLeft: 5}}>
      {listsBelong && contact ?
        customfieldsWithLabel.map((customfield, i) =>
          <ContactDescriptor
          showTitle
          key={i}
          disabled={contact.readonly}
          content={customfield.value}
          contentTitle={customfield.label}
          />
          ) : null}
      {/*
        list && contact && list.fieldsmap.some(fieldObj => fieldObj.customfield && !fieldObj.readonly) ?
        list.fieldsmap
        .filter(fieldObj => fieldObj.customfield && !fieldObj.readonly)
        .map((fieldObj, i) => {
          const customValue = find(contact.customfields, customObj => customObj.name === fieldObj.value);
          return (
            <ContactDescriptor
            disabled={contact.readonly}
            key={i}
            showTitle
            content={customValue && customValue.value}
            contentTitle={fieldObj.name}
            onBlur={(value) => {
              let customfields;
              if (contact.customfields.length === 0) {
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
        }) : <span style={{fontSize: '0.9em', color: grey700}}>There are no custom fields. You can generate them as custom columns in Sheet.</span>
      */}
      </div>
    </div>);
};

export default ContactCustomDescriptions;
