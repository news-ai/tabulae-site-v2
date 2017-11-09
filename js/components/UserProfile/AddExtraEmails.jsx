import React, {Component} from 'react';
import {connect} from 'react-redux';
import isEmail from 'validator/lib/isEmail';
import {grey500, cyan500} from 'material-ui/styles/colors';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import alertify from 'alertifyjs';

import {actions as loginActions} from 'components/Login';

class AddExtraEmails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorText: ''
    };
    this.onAddEmailClick = this.onAddEmailClick.bind(this);
  }

  onAddEmailClick() {
    const value = this.extraEmailField.input.value;
    const isValid = isEmail(value);
    if (value.length > 2 && isValid) {
      this.props.addExtraEmail(value)
      .then(_ => this.extraEmailField.input.value = '');
    } else {
      alertify.alert('Invalid Email', 'Please input a valid email.');
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    const NoAccess = props.person.externalemail || props.person.gmail || props.person.outlook;

    const hintText = NoAccess ? 'Disable Integration to activate' : `${props.leftover} emails left`;
    let floatingLabelText = NoAccess ? 'Disable Integrations to activate' : 'Email';
    if (props.ontrial) floatingLabelText = 'Upgrade to Pro plan to add emails';

    return (
      <div className={props.className} >
      {
        props.leftover > 0 &&
        <TextField
        ref={ref => (this.extraEmailField = ref)}
        disabled={NoAccess}
        errorText={state.errorText}
        hintText={hintText}
        floatingLabelText={floatingLabelText}
        />
      }
      {props.leftover === 0 &&
        <span style={{color: grey500}}>Max'd out the number of external emails. Please upgrade or remove emails to add another.</span>}
        <IconButton
        tooltip='Add Email'
        tooltipPosition='top-center'
        disabled={NoAccess && props.ontrial}
        iconStyle={{color: cyan500, fontSize: '16px'}}
        iconClassName='fa fa-chevron-right'
        onClick={this.onAddEmailClick}
        />
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  const person = state.personReducer.person;
  const allowance = state.personReducer.allowance;
  let leftover = allowance;
  if (allowance && person.sendgridemails !== null) {
    leftover = allowance - person.sendgridemails.length;
  }
  return {
    person,
    allowance,
    leftover,
    ontrial: state.personReducer.ontrial
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    addExtraEmail: email => dispatch(loginActions.addExtraEmail(email))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddExtraEmails);

