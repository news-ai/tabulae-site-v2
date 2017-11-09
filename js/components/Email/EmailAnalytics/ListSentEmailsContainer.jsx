import {connect} from 'react-redux';
import EmailsList from 'components/Email/EmailAnalytics/EmailsList';
import {actions as stagingActions} from 'components/Email';

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);

  const emails = state.stagingReducer.received
  .reduce((acc, id) => {
    const email = state.stagingReducer[id];
    if (state.stagingReducer[id].delivered && !state.stagingReducer[id].archived && email.listid === listId) {
      acc.push(email);
    }
    return acc;
  }, []);
  return {
    emails,
    isReceiving: state.stagingReducer.isReceiving,
    listId
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchListEmails: id => dispatch(stagingActions.fetchListEmails(id))
  };
};

const mergeProps = (sProps, dProps) => {
  return {
    ...sProps,
    ...dProps,
    fetchEmails: _ => dProps.fetchListEmails(sProps.listId),
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(EmailsList);
