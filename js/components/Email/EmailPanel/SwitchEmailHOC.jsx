import React, {Component} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import get from 'lodash/get';
import {yellow50, grey500} from 'material-ui/styles/colors';
import Link from 'react-router/lib/Link';
import FlatButton from 'material-ui/FlatButton';

class SwitchEmailHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
    this.onChange = this._onChange.bind(this);

    // cleanups
    this.onRequestClose = _ => this.setState({open: false});
    this.onRequestOpen = _ => this.setState({open: true});
  }

  _onChange(e, i, value) {
    window.Intercom('trackEvent', 'switch_email');
    mixpanel.track('switch_email');
    this.props.setFromEmail(value);
  }

  render() {
    const props = this.props;
    const state = this.state;
    const emails = props.emails.map((email, i) => <MenuItem key={`switch-email-${i}`} value={email} primaryText={email}/>);
    const disableSwitching = props.person.gmail || props.person.outlook || props.person.externalemail;
    return (
      <div>
        <Dialog actions={[<FlatButton label='Close' onClick={this.onRequestClose}/>]}
        title='Switch From Email' autoScrollBodyContent open={state.open} onRequestClose={this.onRequestClose}>
          <div className='text' style={styles.description}>
          You can add a different email to send from in Email Settings at <Link to='/settings'>Setting</Link>. If you set an email signature, it'll get appended to existing content in the editor.
          </div>
          <DropDownMenu
          disabled={disableSwitching}
          value={props.from}
          onChange={this.onChange}
          >
            {emails}
          </DropDownMenu>
        {disableSwitching &&
          <div className='vertical-center' style={styles.warningContainer}>
            <span className='text' style={styles.warningText}>*You must disable Gmail/Outlook/SMTP integrations to use Email Switching.</span>
          </div>}
        </Dialog>
        {props.children({onRequestOpen: this.onRequestOpen})}
      </div>
      );
  }
}

const styles = {
  warningText: {color: grey500},
  warningContainer: {margin: 10},
  description: {margin: 10, padding: 10, backgroundColor: yellow50},
};

const mapStateToProps = (state, props) => {
  const person = state.personReducer.person;
  let emails = [person.email];
  if (person.sendgridemails !== null) emails = emails.concat(person.sendgridemails);
  return {
    person,
    emails,
    from: get(state, `emailDraftReducer[${props.listId}].from`) || state.personReducer.person.email,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    setFromEmail: email => dispatch({type: 'SET_FROM_EMAIL', from: email, listId: props.listId})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SwitchEmailHOC);
