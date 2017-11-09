import React, {Component} from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';
import {actions as listActions} from 'components/Lists';
import * as copyActions from './actions';
import withRouter from 'react-router/lib/withRouter';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import {yellow50} from 'material-ui/styles/colors';
import alertify from 'alertifyjs';

class CopyToHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      value: [],
      isReceiving: false
    };
    this.onSubmit = this._onSubmit.bind(this);
    this.onNewSheetSubmit = this._onNewSheetSubmit.bind(this);
    this.onWholeSheetCopy = this._onWholeSheetCopy.bind(this);
  }

  componentWillMount() {
    this.props.fetchLists();
  }

  _onSubmit() {
    if (this.state.value.length === 0 || this.props.selectedContacts.length === 0) return;
    const selectedLists = this.state.value.map(obj => this.props.listReducer[obj.value]);
    // selectedLists.map(list => props.addContactsThenPatchList(props.selectedContacts, list));
    const contacts = this.props.selected;
    this.setState({isReceiving: true});
    selectedLists.map(list => this.props.copyContactsToList(contacts, list.id).then(_ => this.setState({isReceiving: false})));

    window.Intercom('trackEvent', 'copy_to_existing_sheet');
    mixpanel.track('copy_to_existing_sheet');
  }

  _onNewSheetSubmit() {
    const val = this.refs.copyToHOC_newSheetName.input.value;
    const includeCustom = this.includeCustomCheckbox.checked;
    let listname = val.length > 0 ? val : `${this.props.list.name} (Copy)`;
    const contacts = this.props.selectedContacts.map(contact => contact.id);
    this.setState({isReceiving: true});
    if (includeCustom) {
      this.props.copyToNewList(
        contacts,
        listname,
        this.props.list.fieldsmap
        .filter(field => field.customfield && !field.readonly)
        .map(({name, value, customfield, hidden}) => ({name, value, customfield, hidden}))
        )
      .then(_ => this.setState({isReceiving: false}));
    } else {
      this.props.copyToNewList(contacts, listname)
      .then(_ => this.setState({isReceiving: false}));
    }
    window.Intercom('trackEvent', 'copy_to_new_sheet');
    mixpanel.track('copy_to_new_sheet');
  }

  _onWholeSheetCopy() {
    const val = this.refs.copyToHOC_whole_list.input.value;
    let name;
    if (val.length > 0) name = val;
    else name = `${this.props.list.name} (Copy)`;
    this.setState({isReceiving: true});
    this.props.copyEntireList(this.props.list.id, name)
    .then(_ => this.setState({isReceiving: false}));
    window.Intercom('trackEvent', 'copy_whole_sheet');
    mixpanel.track('copy_whole_sheet');
  }

  render() {
    const state = this.state;
    const props = this.props;
    return (
      <div>
        <Dialog
        title='Copy to Another Table -- select contacts to copy'
        open={state.open}
        modal={false}
        autoScrollBodyContent
        onRequestClose={_ => this.setState({open: false})}
        >
          <div className='row'>
            <div className='panel large-12 medium-12 small-12 columns' style={styles.panel} >
              <span className='smalltext'>
              The bigger the migration, the slower it is! Don't navigate from the page while copying contacts.
              </span>
            </div>
            <strong>Method 1: Copy Selected Contacts to an Existing/New List</strong>
            <div className='large-12 medium-12 small-12 columns' style={{margin: '10px 0'}}>
              <span className='bold smalltext' style={{marginRight: 8}}>Selected Contacts ({props.selectedContacts.length || 0})</span>
            {props.selected.length === 0 &&
              <span className='smalltext'>none selected</span>}
              {props.selectedContacts &&
                <span className='smalltext'>{
                  props.selectedContacts
                  .filter(contact => contact)
                  .map(contact => contact.firstname || contact.lastname || contact.email || contact.id)
                  .join(', ')
              }</span>}
            </div>
            <div className='large-12 medium-12 small-12 columns' style={{margin: '10px 0'}}>
              <p>Choose list(s) to copy selected contacts to:</p>
              {props.lists &&
                <Select
                multi
                value={state.value}
                options={props.options}
                onChange={value => this.setState({value})}
                onValueClick={({value}) => props.router.push(`/tables/${value}`)}
                />}
            </div>
            <div className='large-12 medium-12 small-12 columns horizontal-center' style={{marginTop: 5, marginBottom: 20}}>
              <RaisedButton
              label='Submit'
              primary
              disabled={!props.selectedContacts || state.value.length === 0 || state.isReceiving}
              icon={props.selectedContacts && state.value.length > 0 && <FontIcon className={props.isReceiving ? 'fa fa-spinner fa-spin' : 'fa fa-clone'} />}
              onClick={this.onSubmit}
              />
            </div>
            <div className='large-12 medium-12 small-12 columns'>
              <span>Or, copy to a a brand new list:</span>
            </div>
            <div className='large-12 medium-12 small-12 columns horizontal-center' style={{marginTop: 10}}>
              <div className='vertical-center'>
                <span className='text' style={{marginRight: 10}}>New List Name</span>
                <TextField
                id='copyToHOC_newSheetName'
                ref='copyToHOC_newSheetName'
                placeholder={`${props.list.name} (Copy) (default name)`}
                />
              </div>
            </div>
            <div className='large-12 medium-12 small-12 columns horizontal-center'>
              <div className='vertical-center'>
                <span className='smalltext' style={{marginRight: 10}}>Include Custom Properties</span>
                <input defaultChecked ref={ref => this.includeCustomCheckbox = ref} type='checkbox' />
              </div>
            </div>
            <div className='large-12 medium-12 small-12 columns horizontal-center' style={{margin: '20px 0'}} >
              <RaisedButton
              primary
              style={{marginLeft: 10}}
              disabled={state.value.length > 0 || !props.selectedContacts}
              label='Copy to New List'
              onClick={this.onNewSheetSubmit}
              icon={state.value.length === 0 && props.selectedContacts && <FontIcon className={state.isReceiving ? 'fa fa-spinner fa-spin' : 'fa fa-table'}/>}
              />
            </div>
            <strong>Method 2: Copy the Whole List</strong>
            <div className='large-12 medium-12 small-12 columns horizontal-center' style={{marginTop: 10, marginBottom: 30}}>
              <div className='vertical-center'>
                <span style={{marginRight: 10, fontSize: '0.9em'}}>New List Name</span>
                <TextField
                id='copyToHOC_whole_list'
                ref='copyToHOC_whole_list'
                placeholder={`${props.list.name} (Copy) (default name)`}
                />
                <RaisedButton
                label='Copy Whole List'
                onClick={this.onWholeSheetCopy}
                disabled={props.isListReceiving || state.isReceiving}
                primary
                icon={<FontIcon className={props.isListReceiving ? 'fa fa-spinner fa-spin' : 'fa fa-table'}/>}
                />
              </div>
            </div>
          </div>
        </Dialog>
        {props.children({onRequestOpen: _ => this.setState({open: true})})}
      </div>);
  }
}

const styles = {
  panel: {
    backgroundColor: yellow50,
    margin: 10,
    padding: 10
  }
};

const mapStateToProps = (state, props) => {
  const person = state.personReducer.person;
  const lists = state.listReducer.received
  .map(id => state.listReducer[id])
  .filter(list => list.createdby === person.id);
  
  return {
    lists,
    list: state.listReducer[props.listId],
    options: lists.map(list => ({label: list.name, value: list.id})),
    selectedContacts: props.selected && props.selected.length > 0 && props.selected.map(id => state.contactReducer[id]),
    listReducer: state.listReducer,
    isReceiving: state.contactReducer.isReceiving,
    isListReceiving: state.listReducer.isReceiving
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const copyContactsToList = (contacts, listid) =>  {
    return dispatch(copyActions.copyContactsToList(contacts, listid))
    .then(_ => alertify.notify('Copy completed!', 'custom', 2, function(){}))
    .catch(err => {
      console.log(err);
      window.Intercom('trackEvent', 'copy_error', {error: err.toString()});
      mixpanel.track('copy_error', {error: err.toString()});
      alertify.alert('Error', 'An error occured. Copy unavailable at this moment.');
    });
  };
  return {
    fetchLists: _ => dispatch(listActions.fetchLists()),
    copyToNewList: (contacts, name, fieldsmap) => {
      window.Intercom('trackEvent', 'copy_some_contacts_to_new');
      mixpanel.track('copy_some_contacts_to_new');
      dispatch({type: 'RESET_LIST_REDUCER_ORDER', order: 'lists'});
      return dispatch(listActions.createEmptyList(name, fieldsmap))
      .then(response => copyContactsToList(contacts, response.data.id));
    },
    copyEntireList: (id, name) => {
      dispatch({type: 'RESET_LIST_REDUCER_ORDER', order: 'lists'});
      return dispatch(listActions.copyEntireList(id, name))
      .then(_ => {
        window.Intercom('trackEvent', 'copy_all_contacts_to_new');
        mixpanel.track('copy_all_contacts_to_new');
        alertify.notify('Copy completed!', 'custom', 2, function(){});
      });
    },
    copyContactsToList: (contacts, listid) => {
      window.Intercom('trackEvent', 'copy_some_contacts_to_existing');
      mixpanel.track('copy_some_contacts_to_existing');
      dispatch({type: 'RESET_LIST_REDUCER_ORDER', order: 'lists'});
      return copyContactsToList(contacts, listid);
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CopyToHOC));
