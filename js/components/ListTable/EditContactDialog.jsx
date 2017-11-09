import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as feedActions} from 'components/ContactProfile/RSSFeed';
import {actions as contactActions} from 'components/Contacts';
import {actions as listActions} from 'components/Lists';
import {actions as publicationActions} from 'components/Publications';

import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import AutoComplete from 'material-ui/AutoComplete';
import Collapse from 'react-collapse';
import PublicationFormStateful from './PublicationFormStateful.jsx';
import {WithContext as ReactTags} from 'react-tag-input';
// import Autocomplete from './Autocomplete';
import Select from 'react-select';

import 'react-select/dist/react-select.css';
import isURL from 'validator/lib/isURL';
import {fromJS} from 'immutable';
import {grey400, blue700, blue500} from 'material-ui/styles/colors';
import find from 'lodash/find';
import alertify from 'utils/alertify';
import styled from 'styled-components';
import debounce from 'es6-promise-debounce';

const textfieldStyle = {
  marginLeft: 10
};

function removeDupe(list) {
  let m = {};
  let ret;
  return list.filter(item => {
    if (m[item] === true) ret = false;
    else ret = true;
    m[item] = true;
    return ret;
  });
}

const _getter = contact => {
  if (!contact) return;
  const {firstname, lastname, email, twitter, instagram, linkedin, phonenumber, blog, notes, website, location, tags} = contact;
  return {firstname, lastname, email, twitter, instagram, linkedin, phonenumber, blog, notes, website, location, tags};
};

const _getPublicationName = (contact, reducer) => {
  if (contact.employers === null) return '';
  else {
    const id = contact.employers[0];
    if (reducer[id]) return reducer[id].name;
    return '';
  }
};

const columnClassname = 'large-6 medium-12 small-12 columns vertical-center';

const Label = styled.span`
  white-space: nowrap;
  font-size: 0.9em;
`;

class EditContactDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contactBody: _getter(this.props.contact),
      immutableContactBody: fromJS(_getter(this.props.contact)),
      customfields: this.props.contact.customfields,
      rssfeedsTextarea: '',
      addPublicationPanelOpen: false,
      tags: !!this.props.contact.tags ? this.props.contact.tags : [],
      publicationValues: !!this.props.contact.employers ?
      this.props.contact.employers
      .filter(id => this.props.publicationReducer[id])
      .map(id => ({label: this.props.publicationReducer[id].name, value: id})) : []
    };
    this.onSubmit = this._onSubmit.bind(this);
    this.onChange = this._onChange.bind(this);
    this.onCustomChange = this._onCustomChange.bind(this);
    this.handleRSSTextarea = this._handleRSSTextarea.bind(this);
    this.handleAddition = this._handleAddition.bind(this);
    this.handleDelete = this._handleDelete.bind(this);
    this.handleDrag = this._handleDrag.bind(this);
    this.onRemoveContact = this._onRemoveContact.bind(this);
    this.onPublicationAddOpen = _ => this.setState({addPublicationPanelOpen: true});
    this.onPublicationAddClose = _ => this.setState({addPublicationPanelOpen: false});
    this.getMultiPublicationOptions = debounce(this.getMultiPublicationOptions.bind(this), 750);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.contactId !== nextProps.contactId) {
      const immutableContactBody = fromJS(nextProps.contact);
      this.setState({
        contactBody: _getter(nextProps.contact),
        immutableContactBody,
        customfields: nextProps.contact.customfields,
        tags: nextProps.contact.tags === null ? [] : nextProps.contact.tags.map((tag, i) => ({id: i, text: tag})),
        publicationValues: !!nextProps.contact.employers ?
        nextProps.contact.employers
        .filter(id => nextProps.publicationReducer[id])
        .map(id => ({label: nextProps.publicationReducer[id].name, value: id})) : []
      });
    }

    if (this.props.feeds !== nextProps.feeds) {
      this.setState({
        rssfeedsTextarea: nextProps.feeds ? nextProps.feeds.map(feed => feed.url).join('\n') : ''
      });
    }
  }

  getMultiPublicationOptions(value, cb) {
    if (value.length > 0) this.props.requestPublication();
    return this.props.searchPublications(value)
    .then(response => {
      // console.log(response);
      cb(null, {options: response.map(name => ({label: name, value: this.props.publicationReducer[name]}))});
    });
  }

  _onSubmit() {
    let contactBody = this.state.contactBody;
    if (this.state.customfields !== null && this.state.customfields.length > 0) {
      contactBody.customfields = this.state.customfields.filter(field => !this.props.list.fieldsmap.some(fieldObj => fieldObj.readonly && fieldObj.value === field.name));
    }

    const employers = this.state.publicationValues.map(pub => pub.value);
    contactBody.employers = employers.length > 0 ? employers : null;

    const tags = this.state.tags.map(tag => tag.text);
    contactBody.listid = this.props.listId;
    contactBody.tags = tags;
    this.props.patchContact(this.props.contact.id, contactBody)
    .then(_ => this.props.onClose());
  }

  _onChange(name, value) {
    this.setState({contactBody: Object.assign({}, this.state.contactBody, {[name]: value})});
  }

  _onCustomChange(name, value) {
    let customfields = this.state.customfields;
    if (customfields === null) customfields = [];
    if (customfields.some(field => field.name === name)) {
      customfields = customfields.map(field => field.name === name ? ({name, value}) : field);
    } else {
      customfields = [...customfields, {name, value}];
    }
    this.setState({
      customfields,
      contactBody: Object.assign({}, this.state.contactBody, {customfields})
    });
  }

  _handleRSSTextarea(id) {
    const feeds = removeDupe(this.state.rssfeedsTextarea
      .split('\n')
      .filter(line => line.length > 0 && isURL(line)));
    if (feeds.length === 0) return;
    this.props.addFeeds(id, feeds);
  }

  _onRemoveContact() {
    alertify.promisifyConfirm('Delete Contact', `This action cannot be reversed. Are you sure you want to delete?`)
    .then(
      _ => {
        const newListContacts = this.props.list.contacts.filter(id => id !== this.props.contactId);
        this.props.deleteContacts([this.props.contactId]);
        this.setState({isDeleting: true});
        this.props.patchList({
          listId: this.props.listId,
          contacts: newListContacts,
          name: this.props.list.name,
        })
        .then(_ => this.setState({isDeleting: false}, this.props.onClose));
      },
      _ => {}
      );
  }

  _handleDelete(i) {
    this.setState({
      tags: this.state.tags.filter((tag, index) => index !== i)
    });
  }

  _handleAddition(tag) {
    if (this.state.tags.some(cTag => cTag.text === tag)) return;
    this.setState({
      tags: [
        ...this.state.tags,
        {
          id: this.state.tags.length + 1,
          text: tag
        }
      ]
    });
  }

  _handleDrag(tag, currPos, newPos) {
    const tags = [ ...this.state.tags ];

    // mutate array
    tags.splice(currPos, 1);
    tags.splice(newPos, 0, tag);

    // re-render
    this.setState({tags});
  }


  render() {
    const props = this.props;
    const state = this.state;
    const actions = [
      <FlatButton label='Cancel' onClick={props.onClose} />,
      <FlatButton primary label='Submit' onClick={this.onSubmit} />
    ];
    // console.log(state.publicationValues);

    return (
      <Dialog autoScrollBodyContent modal actions={actions} open={props.open} title='Edit Contact' onRequestClose={props.onClose}>
      {props.isReceiving &&
        <FontIcon className='fa fa-spinner fa-spin'/>}
        <div className='row' style={{marginTop: 20}}>
          <div className='large-12 medium-12 small-12 columns right'>
            <div className='button' onClick={this.onRemoveContact}>Remove Contact from List</div>
          </div>
          <div className={columnClassname}>
            <Label>First Name</Label>
            <TextField
            style={textfieldStyle}
            value={state.contactBody.firstname || ''}
            name='firstname'
            onChange={e => this.onChange('firstname', e.target.value)}
            />
          </div>
          <div className={columnClassname}>
            <Label>Last Name</Label>
            <TextField
            style={textfieldStyle}
            value={state.contactBody.lastname || ''}
            name='lastname'
            onChange={e => this.onChange('lastname', e.target.value)}
            />
          </div>
          <div className={columnClassname}>
            <Label>Email</Label>
            <TextField
            style={textfieldStyle}
            value={state.contactBody.email || ''}
            name='email'
            onChange={e => this.onChange('email', e.target.value)}
            />
          </div>
          <div className={columnClassname}>
            <Label>Twitter</Label>
            <TextField
            hintText='adding will populate the feed'
            style={textfieldStyle}
            value={state.contactBody.twitter || ''}
            name='twitter'
            onChange={e => this.onChange('twitter', e.target.value)}
            />
          </div>
          <div className={columnClassname}>
            <Label>Instagram</Label>
            <TextField
            hintText='adding will populate the feed'
            style={textfieldStyle}
            value={state.contactBody.instagram || ''}
            name='instagram'
            onChange={e => this.onChange('instagram', e.target.value)}
            />
          </div>
          <div className={columnClassname}>
            <Label>LinkedIn</Label>
            <TextField
            style={textfieldStyle}
            value={state.contactBody.linkedin || ''}
            name='linkedin'
            onChange={e => this.onChange('linkedin', e.target.value)}
            />
          </div>
          <div className={columnClassname}>
            <Label>Phone #</Label>
            <TextField
            style={textfieldStyle}
            value={state.contactBody.phonenumber || ''}
            name='phonenumber'
            onChange={e => this.onChange('phonenumber', e.target.value)}
            />
          </div>
          <div className={columnClassname}>
            <Label>Location</Label>
            <TextField
            style={textfieldStyle}
            value={state.contactBody.location || ''}
            name='location'
            onChange={e => this.onChange('location', e.target.value)}
            />
          </div>
          <div className={columnClassname}>
            <Label>Blog</Label>
            <TextField
            style={textfieldStyle}
            value={state.contactBody.blog || ''}
            name='blog'
            onChange={e => this.onChange('blog', e.target.value)}
            />
          </div>
          <div className={columnClassname}>
            <Label>Website</Label>
            <TextField
            style={textfieldStyle}
            value={state.contactBody.website || ''}
            name='website'
            onChange={e => this.onChange('website', e.target.value)}
            />
          </div>
          <div className={columnClassname}>
            <Label>Notes</Label>
            <TextField
            style={textfieldStyle}
            value={state.contactBody.notes || ''}
            name='notes'
            onChange={e => this.onChange('notes', e.target.value)}
            />
          </div>
      {props.list && props.list.fieldsmap !== null &&
        props.list.fieldsmap
        .filter(fieldObj => fieldObj.customfield && !fieldObj.readonly)
        .map((fieldObj, i) => fieldObj.customfield && (
          <div key={i} className={columnClassname}>
            <Label>{fieldObj.name}</Label>
            <TextField
            value={state.customfields === null || !state.customfields.some(field => field.name === fieldObj.value) ? '' : find(state.customfields, field => field.name === fieldObj.value).value}
            style={textfieldStyle}
            ref={fieldObj.value}
            name={fieldObj.value}
            onChange={e => this.onCustomChange(fieldObj.value, e.target.value)}
            />
          </div>))}
          <div className='large-12 medium-12 small-12 columns vertical-center'>
            <Label>Publication(s)</Label>
            <div style={{minWidth: 200, marginLeft: 15, marginTop: 10}} >
              <Select.Async
              multi
              name='publicationValues'
              loadOptions={this.getMultiPublicationOptions}
              value={state.publicationValues}
              onChange={publicationValues => this.setState({publicationValues})}
              isLoading={props.publicationIsReceiving}
              />
            </div>
          </div>
          <div className='large-12 medium-12 small-12 columns vertical-center'>
            {!state.addPublicationPanelOpen &&
            <div style={{marginTop: 5, marginLeft: 5}}>
              <span className='smalltext'>Don't see a publication you need? </span>
              <span
              className='pointer smalltext'
              style={{color: blue500}}
              onClick={_ => this.setState({addPublicationPanelOpen: true})}
              >Add one here</span>
              </div>}
            <Collapse isOpened={state.addPublicationPanelOpen}>
              <PublicationFormStateful
              onHide={this.onPublicationAddClose}
              bubbleUpValue={response => this.setState({publicationValues: [...state.publicationValues, {label: response.name, value: response.id}]})}
              />
            </Collapse>
          </div>
          <div className='large-12 medium-12 small-12 columns vertical-center'>
            <Label>Tags</Label>
            <div style={{margin: '10px 15px'}} >
              <ReactTags
              tags={state.tags}
              placeholder='Hit Enter after input'
              handleDelete={this.handleDelete}
              handleAddition={this.handleAddition}
              handleDrag={this.handleDrag}
              />
            </div>
          </div>
        </div>
      </Dialog>
      );
  }
}


const mapStateToProps = (state, props) => {
  const feeds = state.feedReducer[props.contactId] && state.feedReducer[props.contactId].map(id => state.feedReducer[id]);
  return {
    contact: state.contactReducer[props.contactId],
    list: state.listReducer[props.listId],
    publicationReducer: state.publicationReducer,
    publicationIsReceiving: state.publicationReducer.isReceiving,
    feeds,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    addContacts: contacts => dispatch(contactActions.addContacts(contacts)),
    patchContact: (contactId, body) => dispatch(contactActions.patchContact(contactId, body)),
    searchPublications: query => dispatch(publicationActions.searchPublications(query)),
    createPublicationThenPatchContact: (contactId, pubName, which) => dispatch(publicationActions.createPublicationThenPatchContact(contactId, pubName, which)),
    addFeeds: (contactId, feeds) => Promise.all(feeds.map(feed => dispatch(feedActions.addFeed(contactId, props.listId, feed)))),
    fetchFeeds: _ => dispatch(feedActions.fetchContactFeeds(props.contactId)),
    requestPublication: () => dispatch(publicationActions.requestPublication()),
    deleteContacts: ids => dispatch(contactActions.deleteContacts(ids)),
    patchList: listObj => dispatch(listActions.patchList(listObj)),
    searchPublicationEpic: query => dispatch({type: 'SEARCH_PUBLICATION_REQUEST', query})
  };
};

const EditContactDialogContainer = connect(mapStateToProps, mapDispatchToProps)(EditContactDialog);

const ShowDialogIfContactExists = props => props.contactId ? <EditContactDialogContainer {...props} /> : null;

export default ShowDialogIfContactExists;

