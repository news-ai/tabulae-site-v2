import React, {Component} from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';
import {blue600} from 'material-ui/styles/colors';

class ConnectToThirdPartyEmailService extends Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  render() {
    const actions = [
      <FlatButton primary keyboardFocused label={this.props.title} onClick={_ => (window.location.href = this.props.href)}/>,
      <FlatButton primary label='Cancel' onClick={_ => this.setState({open: false})}/>
    ];
    return (
      <div>
        <Dialog title={this.props.title} actions={actions} modal open={this.state.open}>
          <p>
            <span>
              By default, Tabulae used <strong>Sendgrid</strong> to send emails.
              By granting us permission to connect your Tabulae account to {this.props.serviceName},
              <strong>we'd send emails from your {this.props.serviceName} account instead of Sendgrid</strong>.
              You'd be able to see the emails you sent from Tabulae in your <strong>{this.props.serviceName} Inbox</strong>.
            </span>
          </p>
          <p>
            <span>
              By connecting your Inbox, it means that <strong>Tabulae will have access to email information</strong> like:
            </span>
          </p>
          <ul>
            <li>which email addresses you are sending emails to</li>
            <li>which email addresses you are sending emails from</li>
            <li>the subject lines and body content of your emails</li>
          </ul>
          <p>
            <span>
              To be sure, you can remove this integration at anytime. <strong>We will only access emails sent through Tabulae and not any other emails in your Inbox.</strong>
            </span>
          </p>
          <p>
            <strong>
              Please make sure the {this.props.serviceName} Inbox you connect with MATCHES with the one you are logged in with.
            </strong>
          </p>
          <p>
            Just as a reminder, you logged in with: <span style={{color: blue600}}>{this.props.person.email}</span>
          </p>
        </Dialog>
        <FlatButton primary label='Connect' onClick={_ => this.setState({open: true})}/>
      </div>
      );
  }
}

export default connect(state => ({person: state.personReducer.person}))(ConnectToThirdPartyEmailService);
