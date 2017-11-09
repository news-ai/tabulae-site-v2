import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as loginActions} from 'components/Login';
import GeneralEditor from 'components/Email/GeneralEditor';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import isJSON from 'validator/lib/isJSON';
import {grey600} from 'material-ui/styles/colors';
import linkifyContentState from 'components/Email/EmailPanel/editorUtils/linkifyContentState';

class EmailSignature extends Component {
  constructor(props) {
    super(props);
    let bodyContent; 
    if (this.props.signature && this.props.signature.length > 0 && isJSON(this.props.signature)) {
      bodyContent = JSON.parse(this.props.signature).data;
    } else {
      bodyContent = this.props.signature;
    }
    this.state = {
      currentEmail: this.props.person.email,
      bodyContent,
      rawBodyContentState: undefined,
      onEditMode: false,
      isSaving: false
    };
    this.handleChange = this._handleChange.bind(this);
    this.updateBody = (html, raw) => {
      // console.log(html);
      // console.log(raw);
      this.setState({body: html, rawBodyContentState: raw});
    };
    this.onSubjectChange = (editorState) => {
      const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
      this.setState({subject});
    };
    this.onSaveClick = this._onSaveClick.bind(this);
  }

  _handleChange(e, i, newEmail) {
    const emailsignatures = this.props.person.emailsignatures;
    let bodyContent;
    if (emailsignatures !== null && emailsignatures.some(signature => JSON.parse(signature).email === newEmail)) {
      const sign = emailsignatures.filter(signature => JSON.parse(signature).email === newEmail)[0];
      bodyContent = JSON.parse(sign).data;
    }
    if (newEmail === this.props.person.email && this.props.signature !== null) {
      if (isJSON(this.props.signature)) {
        bodyContent = JSON.parse(this.props.signature).data;
      } else {
        bodyContent = this.props.signature;
      }
    }
    // console.log(bodyContent);

    this.setState({
      currentEmail: newEmail,
      bodyContent,
    });
  }

  _onSaveClick() {
    const oldPerson = this.props.person;
    let person = {
      firstname: oldPerson.firstname,
      lastname: oldPerson.lastname,
      getdailyemails: oldPerson.getdailyemails,
      emailsignature: oldPerson.emailsignature,
      emailsignatures: oldPerson.emailsignatures,
    };
    // console.log(this.state.rawBodyContentState);
    const data = JSON.stringify({
      type: 'DraftEditorState',
      data: this.state.rawBodyContentState,
      resource: 'signature',
      email: this.state.currentEmail,
    });
    if (this.state.currentEmail === this.props.person.email) {
      person.emailsignature = data;
    } else {
      let emailsignatures = this.props.person.emailsignatures;
      if (emailsignatures === null) emailsignatures = [data];
      else {
        let found = false;
        // find and replace signature if existing
        emailsignatures = emailsignatures.map(signature => {
          if (isJSON(signature)) {
            const json = JSON.parse(signature);
            if (json.email === this.state.currentEmail) {
              found = true;
              return data;
            }
          }
          return signature;
        });
        // add new if it doesnt already exist
        if (!found) emailsignatures = [...emailsignatures, data];
      }
      person.emailsignatures = emailsignatures;
    }

    this.setState({isSaving: true}, _ => {
      this.props.patchPerson(person)
      .then(_ => this.setState({saved: true, isSaving: false},
        _ => setTimeout(_ => this.setState({saved: false}), 10000)));
    });
  }

  render() {
    const props = this.props;
    const state = this.state;
    let items = [<MenuItem key={props.person.email} value={props.person.email} primaryText={props.person.email}/>];
    if (props.person.sendgridemails !== null) {
      items = [
        ...items,
        ...props.person.sendgridemails.map(email => <MenuItem key={email} value={email} primaryText={email}/>)
      ];
    }
    return (
      <div className='row'>
        <div className='large-10 medium-8 small-12 columns' style={styles.dropdownContainer}>
          <DropDownMenu
          value={state.currentEmail}
          onChange={this.handleChange}
          >
          {items}
          </DropDownMenu>
        </div>
        <div className='large-2 medium-4 small-12 columns' style={styles.saveBtnContainer}>
          <div className='vertical-center'>
            <RaisedButton
            primary
            className='right'
            label={state.isSaving ? 'Saving...' : 'Save'}
            disabled={state.isSaving}
            onClick={this.onSaveClick}
            />
          </div>
          <div className='vertical-center'>
          {state.saved &&
            <span style={{color: grey600}} className='smalltext right'>saved</span>}
          </div>
        </div>
        <div className='large-12 medium-12 small-12 columns horizontal-center'>
          <div style={styles.editor}>
            <GeneralEditor
            width={600}
            height={350}
            onEditMode
            allowReplacement
            bodyContent={state.bodyContent}
            rawBodyContentState={state.rawBodyContentState}
            onBodyChange={this.updateBody}
            debounce={500}
            placeholder='Enter email signature here...'
            />
          </div>
        </div>
      </div>
      );
  }
}

const styles = {
  editor: {padding: 10, border: `1px dotted ${grey600}`},
  saveBtnContainer: {margin: '5px 0'},
  dropdownContainer: {marginTop: 20, marginBottom: 10},
};

const mapStateToProps = (state, props) => {
  return {
    person: state.personReducer.person,
    signature: state.personReducer.person.emailsignature || null,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    patchPerson: body => dispatch(loginActions.patchPerson(body)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailSignature);
