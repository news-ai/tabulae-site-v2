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
  // console.log(allCustomListFields);
  const customfieldsWithLabel = contact.customfields.map((field) => {
    const listFieldWithLabel = find(allCustomListFields, listFieldObj => listFieldObj.value === field.name);
    if (!listFieldWithLabel) return undefined;
    return Object.assign({}, field, {label: listFieldWithLabel.name});
  }).filter(obj => !!obj);
  // console.log(contact);
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
          onBlur={(value) => {
            const newCustomFields = contact.customfields.map(f => f.name === customfield.name ? Object.assign({}, f, {value}) : f);
            // console.log(newCustomFields);
            patchContact(contact.id, {
              customfields: newCustomFields
            });
          }}
          />
          ) : null}
      </div>
    </div>);
};

export default ContactCustomDescriptions;
