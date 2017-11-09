import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fromJS, is} from 'immutable';
import {grey500, grey800} from 'material-ui/styles/colors';
import Toggle from 'material-ui/Toggle';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';

import EmailSignature from './EmailSignature.jsx';
import ConnectToThirdPartyEmailService from './ConnectToThirdPartyEmailService.jsx';
import SMTPSettings from './SMTPSettings.jsx';
import AddExtraEmails from './AddExtraEmails.jsx';
import EmailItem from './EmailItem.jsx';

import {actions as loginActions} from 'components/Login';

const spanStyle = {
  color: grey500,
  marginRight: 15,
  float: 'right'
};

const panelStyles = {
  container: {padding: 10},
  title: {fontSize: '1.2em', color: grey500},
  children: {margin: '15px 10px'}
};

const Panel = props => {
  return (
    <Paper className={props.className} zDepth={1} style={{margin: '5px 0', padding: 10}}>
      <div style={panelStyles.padding}>
        <div className='vertical-center'>
          <span style={panelStyles.title}>{props.title}</span>
        </div>
        <div style={panelStyles.children}>
          {props.children}
        </div>
      </div>
    </Paper>);
};

const styles = {
  item: {
    margin: '15px 5px'
  },
  notAvailableSpan: {
    fontSize: '0.9em',
    color: grey800
  }
};


class EmailSettings extends Component {
  constructor(props) {
    super(props);
    this.setNewPerson = (key, value) => this.setState({newPerson: this.state.newPerson.set(key, value)}, this.updatePerson);
    this.state = {
      immuperson: fromJS(this.props.person),
      newPerson: fromJS(this.props.person),
    };
    this.props.getEmailMaxAllowance();
    this.updatePerson = this._updatePerson.bind(this);
  }

  componentWillUnmount() {
    this.updatePerson();
  }

  _updatePerson() {
    if (!is(this.state.immuperson, this.state.newPerson)) {
      const newPerson = this.state.newPerson;
      const person = {
        getdailyemails: newPerson.get('getdailyemails'),
        emailsignature: newPerson.get('emailsignature'),
        firstname: newPerson.get('firstname'),
        lastname: newPerson.get('lastname'),
        externalemail: newPerson.get('externalemail')
      };
      this.props.patchPerson(person);
    }
  }

  render() {
    const {person} = this.props;
    const state = this.state;
    const props = this.props;

    const spanCssClass = 'large-4 medium-5 small-6 columns';
    const bodyCssClass = 'large-8 medium-7 small-6 columns';

    const NoAccess = props.person.externalemail || props.person.gmail || props.person.outlook;

    let googleNode = (
      <ConnectToThirdPartyEmailService
      serviceName='Gmail'
      title='Connect to Gmail'
      href='https://tabulae.newsai.org/api/auth/gmail'
      />);
    let outlookNode = (
      <ConnectToThirdPartyEmailService
      serviceName='Outlook'
      title='Connect to Outlook'
      href='https://tabulae.newsai.org/api/auth/outlook'
      />);
    let smtpNode = (<SMTPSettings/>);
    if (person.gmail) {
      // GOOGLE IS ON
      googleNode = (
        <FlatButton
        secondary
        label='Remove'
        onClick={_ => (window.location.href = 'https://tabulae.newsai.org/api/auth/remove-gmail')}
        />);
      outlookNode = <span style={styles.notAvailableSpan}>Connected via Gmail</span>;
      smtpNode = <span style={styles.notAvailableSpan}>Connected via Gmail</span>;
    } else if (person.outlook) {
      // OUTLOOK IS ON
      googleNode = <span style={styles.notAvailableSpan}>Connected via Outlook</span>;
      outlookNode = (
        <FlatButton
        secondary
        label='Remove'
        onClick={_ => (window.location.href = 'https://tabulae.newsai.org/api/auth/remove-outlook')}
        />);
      smtpNode = <span style={styles.notAvailableSpan}>Connected via Outlook</span>;
    }
    if (person.smtpvalid) {
      // can turn on SMTP
      if (person.externalemail) {
        googleNode = <span style={styles.notAvailableSpan}>Connected via SMTP</span>;
        outlookNode = <span style={styles.notAvailableSpan}>Connected via SMTP</span>;
      }
      smtpNode = (
        <Toggle
        disabled={person.gmail || person.outlook}
        toggled={state.newPerson.get('externalemail')}
        onToggle={_ => this.setNewPerson('externalemail', !state.newPerson.get('externalemail'))}
        />);
    }

    return (
      <div style={{margin: 50}}>
        <Panel className='row' title='Daily Digest Subscription'>
          <div className='vertical-center'>
            <div>
              <span style={spanStyle}>Receive a daily email of feed activity at 8AM</span>
            </div>
            <div>
              <Toggle
              toggled={state.newPerson.get('getdailyemails')}
              onToggle={_ => this.setNewPerson('getdailyemails', !state.newPerson.get('getdailyemails'))}
              />
            </div>
          </div>
        </Panel>
        <Panel title='Integrations'>
          <span className='smalltext'>By default, we use a 3rd-party email service provider Sendgrid to deliver your emails. If you would like for us to deliver your emails through a different service, then you can enable those integrations here.</span>
          <div className='row vertical-center' style={styles.item}>
            <div className={spanCssClass}>
              <span style={spanStyle}>Gmail</span>
            </div>
            <div className={bodyCssClass}>
            {googleNode}
            </div>
          </div>
          <div className='row vertical-center' style={styles.item}>
            <div className={spanCssClass}>
              <span style={spanStyle}>Outlook</span>
            </div>
            <div className={bodyCssClass}>
            {outlookNode}
            </div>
          </div>
          <div className='row vertical-center' style={styles.item}>
            <div className={spanCssClass}>
              <span style={spanStyle}>SMTP Server</span>
            </div>
            <div className={bodyCssClass}>
            {smtpNode}
            </div>
          </div>
        </Panel>
        <Panel title='Add Multiple Emails'>
          <span className='smalltext'>You can add multiple emails to switch when you send your emails. This feature is not supported with Gmail/Outlook/SMTP integrations.</span>
          <div className='row vertical-center' style={styles.item}>
            <div className={spanCssClass}>
              <span style={spanStyle}>Add Emails</span>
            </div>
            <AddExtraEmails className='bodyCssClass' />
          </div>
        {props.person.sendgridemails !== null && !NoAccess &&
          <div className='row vertical-center' style={styles.item}>
            <div className={spanCssClass}>
              <span style={spanStyle}>Connected</span>
            </div>
            <div className={bodyCssClass}>
            {props.person.sendgridemails.map(email =>
              <EmailItem key={email} email={email} />)}
            </div>
          </div>}
        </Panel>
        <Panel className='row' title='Email Signature'>
          <span className='smalltext'>If you added multiple emails, you can assign different signature to each one.</span>
          <div style={{height: 500}}>
            <EmailSignature />
          </div>
        </Panel>
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    person: state.personReducer.person,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    patchPerson: body => dispatch(loginActions.patchPerson(body)),
    getEmailMaxAllowance: () => dispatch(loginActions.getEmailMaxAllowance())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailSettings);
