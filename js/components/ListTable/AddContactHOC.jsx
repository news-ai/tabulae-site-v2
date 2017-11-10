import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as feedActions} from 'components/ContactProfile/RSSFeed';
import {actions as listActions} from 'components/Lists';
import {actions as publicationActions} from 'components/Publications';
import {actions as contactActions} from 'components/Contacts';

import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
// import AutoComplete from 'material-ui/AutoComplete';
import Autocomplete from './Autocomplete';
// import Textarea from 'react-textarea-autosize';
import TextareaAutosize from 'react-autosize-textarea';
import Collapse from 'react-collapse';
import PublicationFormStateful from './PublicationFormStateful.jsx';
import ValidationHOC from 'components/ValidationHOC';
import Select from 'react-select';
import {WithContext as ReactTags} from 'react-tag-input';

import 'react-select/dist/react-select.css';
import isURL from 'validator/lib/isURL';
import {yellow50, grey400, blue500} from 'material-ui/styles/colors';
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

function createParser(url) {
  let parser = document.createElement('a');
  parser.href = url;
  return parser;
}

const Label = styled.span`
  white-space: nowrap;
  font-size: 0.9em;
`;

class AddContactHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      contactBody: {},
      rssfeedsTextarea: '',
      addPublicationPanelOpen: false,
      tags: [],
      publicationValues: []
    };
    this.onSubmit = this._onSubmit.bind(this);
    this.onChange = this._onChange.bind(this);
    this.handleRSSTextarea = this._handleRSSTextarea.bind(this);
    this.handleAddition = this._handleAddition.bind(this);
    this.handleDelete = this._handleDelete.bind(this);
    this.handleDrag = this._handleDrag.bind(this);
    this.getMultiPublicationOptions = debounce(this.getMultiPublicationOptions.bind(this), 750);
  }

  _onSubmit() {
    let customRow = [];
    let contactBody = this.state.contactBody;
    const list = this.props.list;
    list.fieldsmap
    .filter(fieldObj => fieldObj.customfield && !fieldObj.readonly)
    .map(fieldObj => {
      if (fieldObj.customfield && this.refs[fieldObj.value]) {
        const value = this.refs[fieldObj.value].getValue();
        if (value.length > 0) customRow.push({name: fieldObj.value, value});
      }
    });
    if (customRow.length > 0) contactBody.customfields = customRow;
    contactBody.listid = list.id;

    if (this.state.tags.length > 0) contactBody.tags = this.state.tags.map(tag => tag.text);
    
    const employers = this.state.publicationValues.map(pub => pub.value);
    contactBody.employers = employers.length > 0 ? employers : null;

    this.props.addContacts([contactBody])
    .then(contacts => {
      const ids = contacts.map(contact => contact.id);
      ids.map(id => this.handleRSSTextarea(id));
      const listBody = {
        listId: list.id,
        name: list.name,
        contacts: list.contacts === null ? ids : [...list.contacts, ...ids]
      };
      this.props.patchList(listBody);
      this.setState({open: false, contactBody: {}, rssfeedsTextarea: '', publicationValues: []});
    });
  }

  getMultiPublicationOptions(value, cb) {
    if (value.length > 0) this.props.requestPublication();
    return this.props.searchPublications(value)
    .then(response => {
      // console.log(response);
      cb(null, {options: response.map(name => ({label: name, value: this.props.publicationReducer[name]}))});
    });
  }

  _onChange(name, value, validator) {
    const content = validator ? validator(value) : value;
    this.setState({
      contactBody: Object.assign({}, this.state.contactBody, {[name]: content})
    });
  }

  _handleRSSTextarea(id) {
    const feeds = removeDupe(this.state.rssfeedsTextarea
      .split('\n')
      .filter(line => line.length > 0 && isURL(line)));
    if (feeds.length === 0) return;
    this.props.addFeeds(id, feeds);
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
      <FlatButton
        label='Cancel'
        primary
        onClick={_ => this.setState({open: false, rssfeedsTextarea: ''})}
      />,
      <FlatButton
        label='Submit'
        primary
        keyboardFocused
        onClick={this.onSubmit}
      />,
    ];
    return (
      <div>
        <Dialog autoScrollBodyContent modal actions={actions} open={state.open} title='Add Contact' onRequestClose={_ => this.setState({open: false})}>
        {props.isReceiving &&
          <FontIcon className={'fa fa-spinner fa-spin'} />}
          <div className='row' style={{marginTop: 20}}>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <Label>First Name</Label>
              <TextField
              style={textfieldStyle}
              value={state.contactBody.firstname || ''}
              name='firstname'
              onChange={e => this.onChange('firstname', e.target.value)}
              />
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <Label>Last Name</Label>
              <TextField
              style={textfieldStyle}
              value={state.contactBody.lastname || ''}
              name='lastname'
              onChange={e => this.onChange('lastname', e.target.value)}
              />
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <Label>Email</Label>
              <ValidationHOC rules={[{
                validator: val => !props.contacts.some(({email}) => email === val),
                errorMessage: 'Email already exists on this List.'
              }]}>
              {({onValueChange, errorMessage}) =>
                <TextField
                style={textfieldStyle}
                value={state.contactBody.email || ''}
                name='email'
                floatingLabelText={errorMessage}
                onChange={e => {
                  onValueChange(e.target.value);
                  this.onChange('email', e.target.value);
                }}
                />}
              </ValidationHOC>
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <Label>Twitter</Label>
              <TextField
              hintText='adding will populate the feed'
              style={textfieldStyle}
              value={state.contactBody.twitter || ''}
              name='twitter'
              onChange={e => this.onChange(
                'twitter',
                e.target.value,
                value => {
                  if (isURL(value)) {
                    const parser = createParser(value);
                    if (parser.hostname === 'twitter.com') {
                      const path = parser.pathname.split('/');
                      return path[path.length - 1];
                    }
                  }
                  return value;
                })}
              />
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <Label>Instagram</Label>
              <TextField
              hintText='adding will populate the feed'
              style={textfieldStyle}
              value={state.contactBody.instagram || ''}
              name='instagram'
              onChange={e => this.onChange(
                'instagram',
                e.target.value,
                value => {
                  if (isURL(value)) {
                    const parser = createParser(value);
                    if (parser.hostname === 'instagram.com' || parser.hostname === 'www.instagram.com') {
                      const path = parser.pathname.split('/').filter(val => val.length > 0);
                      return path[path.length - 1];
                    }
                  }
                  return value;
                }
                )}/>
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <Label>LinkedIn</Label>
              <TextField style={textfieldStyle} value={state.contactBody.linkedin || ''} name='linkedin' onChange={e => this.onChange('linkedin', e.target.value)}/>
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <Label>Phone #</Label>
              <TextField style={textfieldStyle} value={state.contactBody.phonenumber || ''} name='phonenumber' onChange={e => this.onChange('phonenumber', e.target.value)}/>
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <Label>Location</Label>
              <TextField style={textfieldStyle} value={state.contactBody.location || ''} name='notes' onChange={e => this.onChange('location', e.target.value)}/>
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <Label>Blog</Label>
              <TextField style={textfieldStyle} value={state.contactBody.blog || ''} name='blog' onChange={e => this.onChange('blog', e.target.value)}/>
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <Label>Website</Label>
              <TextField style={textfieldStyle} value={state.contactBody.website || ''} name='website' onChange={e => this.onChange('website', e.target.value)}/>
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <Label>Notes</Label>
              <TextField style={textfieldStyle} value={state.contactBody.notes || ''} name='notes' onChange={e => this.onChange('notes', e.target.value)}/>
            </div>
        {props.list && props.list.fieldsmap !== null &&
          props.list.fieldsmap
          .filter(fieldObj => fieldObj.customfield && !fieldObj.readonly)
          .map((fieldObj, i) => fieldObj.customfield && (
            <div key={i} className='large-6 medium-12 small-12 columns vertical-center'>
              <Label>{fieldObj.name}</Label><TextField style={textfieldStyle} ref={fieldObj.value} name={fieldObj.value} />
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
                onHide={_ => this.setState({addPublicationPanelOpen: false})}
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
            <div style={{
              backgroundColor: yellow50,
              margin: 10,
              padding: 10
            }}>
              <span className='smalltext'>
              Many websites can be followed with RSS if they are powered by WordPress or Tumblr. You can discover their feed link by simply adding <strong>/feed</strong> or <strong>/rss</strong>.
              For example:
                https://vogue.com/feed,
                https://nypost.com/author/firstname-lastname/feed,
                https://nycstreetfile.tumblr.com/rss
              </span>
            </div>
            <div className='large-12 medium-12 small-12 columns'>
              <span style={{whiteSpace: 'nowrap'}}>RSS Feeds</span>
              <span className='smalltext' style={{whiteSpace: 'nowrap'}}> * Separate feeds with a new line</span>
              <TextareaAutosize
              value={state.rssfeedsTextarea}
              maxRows={10}
              onChange={e => this.setState({rssfeedsTextarea: e.target.value})}
              />
            </div>
          </div>
        </Dialog>
        {props.children({onRequestOpen: _ => this.setState({open: true})})}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  return {
    list: state.listReducer[props.listId],
    publicationReducer: state.publicationReducer,
    publicationIsReceiving: state.publicationReducer.isReceiving,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    addContacts: contacts => dispatch(contactActions.addContacts(contacts)),
    patchList: listBody => dispatch(listActions.patchList(listBody)),
    searchPublications: query => dispatch(publicationActions.searchPublications(query)),
    createPublicationThenPatchContact: (contactId, pubName, which) => dispatch(publicationActions.createPublicationThenPatchContact(contactId, pubName, which)),
    addFeeds: (contactId, feeds) => Promise.all(feeds.map(feed => dispatch(feedActions.addFeed(contactId, props.listId, feed)))),
    requestPublication: () => dispatch(publicationActions.requestPublication()),
    searchPublicationEpic: query => dispatch({type: 'SEARCH_PUBLICATION_REQUEST', query})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddContactHOC);

