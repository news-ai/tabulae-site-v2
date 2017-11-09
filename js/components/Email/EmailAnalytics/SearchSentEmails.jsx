// @flow
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as stagingActions} from 'components/Email';
import EmailsList from 'components/Email/EmailAnalytics/EmailsList';

class SearchSentEmails extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    if (this.props.searchQuery) this.props.fetchSearchSentEmails(this.props.searchQuery);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.searchQuery && this.props.searchQuery !== nextProps.searchQuery) this.props.fetchSearchSentEmails(nextProps.searchQuery);
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <EmailsList
      isReceiving={props.isReceiving}
      emails={props.emails}
      fetchEmails={_ => {}}
      placeholder='Search results will be shown here. None found.'
      />
      );
  }
}

const mapStateToProps = (state, props) => {
  const rightNow = new Date();
  const ids = state.stagingReducer.searchReceivedEmails || [];
  let email;
  const emails = ids ? ids.reduce((acc, id) => {
    email = state.stagingReducer[id];
    if (email && email.issent) acc.push(email);
    else if (email && new Date(email.sendat) > rightNow) acc.push(email);
    return acc;
  }, []) : [];
  return {
    emails,
    isReceiving: state.stagingReducer.isReceiving,
    searchQuery: props.params.searchQuery,
    queryDate: props.router.location.query.date,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchSearchSentEmails: query => dispatch(stagingActions.fetchSearchSentEmails(query)),
  };
};

const mergeProps = (sProps, dProps) => {
  return {
    ...sProps,
    ...dProps,
    fetchEmails: _ => dProps.fetchSearchSentEmails(sProps.searchQuery).then(t => t),
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(SearchSentEmails);
