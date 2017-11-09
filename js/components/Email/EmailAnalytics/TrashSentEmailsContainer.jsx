import {connect} from 'react-redux';
import EmailsList from 'components/Email/EmailAnalytics/EmailsList';
import {actions as stagingActions} from 'components/Email';

const mapStateToProps = (state, props) => {
  const emails = state.stagingReducer.received.reduce((acc, id, i) => {
    if (state.stagingReducer[id].delivered && state.stagingReducer[id].archived) {
      acc.push(state.stagingReducer[id]);
    }
    return acc;
  }, []);
  return {
    emails,
    isReceiving: state.stagingReducer.isReceiving,
    placeholder: 'No emails trashed.',
    hasNext: state.stagingReducer.archivedOffset !== null,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchEmails: _ => dispatch(stagingActions.fetchArchivedEmails()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailsList);
