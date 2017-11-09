import React, {Component} from 'react';
import {connect} from 'react-redux';
import {invite, getInviteCount} from './actions';

import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import isEmail from 'validator/lib/isEmail';
import alertify from 'alertifyjs';

class Invite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorText: null,
      value: '',
    };
    this.onInvite = this._onInvite.bind(this);
  }

  _onInvite() {
    const email = this.state.value;
    let errorText = null;
    if (isEmail(email)) {
      this.props.onInvite(email)
      .then(
        res => {
          alertify.alert('Success', `Whee, invite sent to ${email}`);
        },
        err => {
          console.log(err.message);
          alertify.alert('Failure', `Something went wrong. Perhaps you sent an invite to this email before or the owner of this email already has an account.`);
        }
      );
    } else errorText = 'Not an Email';
    this.setState({errorText, value: ''});
  }

  render() {
    const state = this.state;
    const props = this.props;
    return (
      <div className={props.className}>
        <TextField
        value={state.value}
        onChange={e => this.setState({value: e.target.value})}
        errorText={state.errorText}
        hintText='Email'
        />
        <div style={{margin: '5px 0'}} >
          <RaisedButton
          label='Invite a friend'
          onClick={this.onInvite}
          primary
          />
        </div>
      </div>);
  }
}


const mapStateToProps = (state, props) => {
  return {};
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    onInvite: email => dispatch(invite(email)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Invite);
