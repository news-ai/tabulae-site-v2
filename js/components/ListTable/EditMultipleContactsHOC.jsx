import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as contactActions} from 'components/Contacts';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import 'react-select/dist/react-select.css';
import {yellow50} from 'material-ui/styles/colors';
import isEmpty from 'lodash/isEmpty';
import {WithContext as ReactTags} from 'react-tag-input';

const textfieldStyle = {
  marginLeft: 10
};

const _getter = contact => {
  if (!contact) return;
  const {listid, id, firstname, lastname, email, twitter, instagram, linkedin, phonenumber, blog, notes, website, tags} = contact;
  return {listid, id, firstname, lastname, email, twitter, instagram, linkedin, phonenumber, blog, notes, website, tags};
};

const columnClassname = 'large-6 medium-12 small-12 columns vertical-center';

class EditMultipleContacts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      contactBody: {},
      customfields: [],
      tags: [],
    };
    this.handleAddition = this._handleAddition.bind(this);
    this.handleDelete = this._handleDelete.bind(this);
    this.handleDrag = this._handleDrag.bind(this);
    this.onSubmit = this._onSubmit.bind(this);
    this.onChange = this._onChange.bind(this);
    this.onRequestClose = _ => this.setState({open: false, tags: []});
    this.onRequestOpen = _ => this.setState({open: true, tags: []});
  }

  componentWillMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.open === false && this.state.open === true) {
      // onRequestOpen hit
      // if (!this.props.feeds) this.props.fetchFeeds();
    }
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

  _onSubmit() {
    // checking uncontrolled input elements
    let patchCustomfields = {};
    this.props.list.fieldsmap
    .filter(fieldObj => fieldObj.customfield && !fieldObj.readonly)
    .map(fieldObj => {
      const val = this.refs[fieldObj.name].input.value;
      if (!val) return;
      patchCustomfields[fieldObj.value] = val;
    });
    if (isEmpty(patchCustomfields) && isEmpty(this.state.contactBody) && this.state.tags.length === 0) return;

    // handle default field edits
    let patchContact = {};
    Object.keys(this.state.contactBody)
    .filter(key => this.state.contactBody[key])
    .map(key => patchContact[key] = this.state.contactBody[key]);

    // manage customfields edits
    let strippedCustomfieldsMap = {};
    this.props.list.fieldsmap.filter(fieldObj => strippedCustomfieldsMap[fieldObj.value] = fieldObj.readonly);
    let newContacts = this.props.selectContacts.map(contact => {
      const fields = contact.customfields === null ? [] : contact.customfields;
      const customfields = fields.filter(field => !strippedCustomfieldsMap[field.name] && !patchCustomfields[field.name]);
      Object.keys(patchCustomfields).map(key => customfields.push({name: key, value: patchCustomfields[key]}));
      return Object.assign({}, _getter(contact), patchContact, {customfields});
    });

    // manage tag edits
    if (this.state.tags.length > 0) {
      const tags = this.state.tags.map(tag => tag.text);
      newContacts = newContacts.map(contact => {
        if (contact.tags === null) {
          return Object.assign({}, contact, {tags: [...tags]});
        } else {
          // remove dupes
          const set = new Set([...tags, ...contact.tags]);
          return Object.assign({}, contact, {tags: [...set]});
        }
      });
    }

    this.props.patchContacts(newContacts)
    .then(_ => this.setState({open: false, contactBody: {}, customfields: []}));
  }

  _onChange(name, value) {
    this.setState({contactBody: Object.assign({}, this.state.contactBody, {[name]: value})});
  }

  render() {
    const props = this.props;
    const state = this.state;
    const actions = [
      <FlatButton
      label='Cancel'
      disabled={props.isReceiving}
      onClick={_ => this.setState({open: false, contactBody: {}, customfields: [], tags: []})}
      />,
      <FlatButton
      label={props.isReceiving ? 'Updating...' : 'Submit'}
      disabled={props.isReceiving}
      onClick={this.onSubmit}
      />,
    ];

    return (
      <div className={props.className}>
        {state.open &&
          <Dialog actions={actions} autoScrollBodyContent modal open={state.open} title='Edit Multiple Contacts' onRequestClose={this.onRequestClose}>
          <div style={{margin: 10, padding: 10, fontSize: '0.8em', backgroundColor: yellow50}}>
            Warning: content added here will be applied to all selected contacts.
          </div>
          <div className='row' style={{marginTop: 20}}>
            <div className={columnClassname}>
              <span style={{whiteSpace: 'nowrap'}}>First Name</span>
              <TextField style={textfieldStyle} value={state.contactBody.firstname || ''} name='firstname' onChange={e => this.onChange('firstname', e.target.value)}/>
            </div>
            <div className={columnClassname}>
              <span style={{whiteSpace: 'nowrap'}}>Last Name</span>
              <TextField style={textfieldStyle} value={state.contactBody.lastname || ''} name='lastname' onChange={e => this.onChange('lastname', e.target.value)}/>
            </div>
            <div className={columnClassname}>
              <span>Email</span>
              <TextField style={textfieldStyle} value={state.contactBody.email || ''} name='email' onChange={e => this.onChange('email', e.target.value)}/>
            </div>
            <div className={columnClassname}>
              <span>Phone #</span>
              <TextField style={textfieldStyle} value={state.contactBody.phonenumber || ''} name='phonenumber' onChange={e => this.onChange('phonenumber', e.target.value)}/>
            </div>
            <div className={columnClassname}>
              <span>Blog</span>
              <TextField style={textfieldStyle} value={state.contactBody.blog || ''} name='blog' onChange={e => this.onChange('blog', e.target.value)}/>
            </div>
            <div className={columnClassname}>
              <span>Website</span>
              <TextField style={textfieldStyle} value={state.contactBody.website || ''} name='website' onChange={e => this.onChange('website', e.target.value)}/>
            </div>
            <div className={columnClassname}>
              <span>Notes</span>
              <TextField style={textfieldStyle} value={state.contactBody.notes || ''} name='notes' onChange={e => this.onChange('notes', e.target.value)}/>
            </div>
            {props.list.fieldsmap.filter(fieldObj => fieldObj.customfield && !fieldObj.readonly).map(fieldObj =>
            <div key={fieldObj.name} className={columnClassname}>
              <span>{fieldObj.name}</span>
              <TextField ref={fieldObj.name} name={fieldObj.name} style={textfieldStyle}/>
            </div>)}
            <div className={columnClassname}>
              <span>Tags</span>
              <ReactTags
              style={{margin: '0 5px'}}
              tags={state.tags}
              placeholder='Hit Enter after input'
              handleDelete={this.handleDelete}
              handleAddition={this.handleAddition}
              handleDrag={this.handleDrag}
              />
            </div>
          </div>
        </Dialog>}
        {props.children({onRequestOpen: this.onRequestOpen})}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  return {
    list: state.listReducer[props.listId],
    selectContacts: props.selected.map(id => state.contactReducer[id]),
    isReceiving: state.contactReducer.isReceiving
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    addContacts: contacts => dispatch(contactActions.addContacts(contacts)),
    patchContact: (contactId, body) => dispatch(contactActions.patchContact(contactId, body)),
    patchContacts: (contactList) => dispatch(contactActions.patchContacts(contactList)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditMultipleContacts);
