import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as stagingActions} from 'components/Email';
import EmailsList from 'components/Email/EmailAnalytics/EmailsList';

class ContactEmails extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchEmails();
  }

  render() {
    return (<EmailsList {...this.props}/>);
  }
}

const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const contactId = parseInt(props.contactId, 10);
  const contact = state.contactReducer[contactId];
  let emails = state.stagingReducer.received.map(id => state.stagingReducer[id])
  .filter(email => email.to === contact.email)
  .filter(email => email.issent)
  .filter(email => email.delivered);
  return {
    listId,
    contactId,
    emails,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchEmails: _ => dispatch(stagingActions.fetchContactEmails(props.contactId)),
    refreshEmails: _ => {
      dispatch({type: 'RESET_STAGING_CONTACT_OFFSET', contactId: props.contactId});
      dispatch(stagingActions.fetchContactEmails(props.contactId));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ContactEmails);
