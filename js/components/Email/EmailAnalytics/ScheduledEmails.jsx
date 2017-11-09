import React from 'react';
import {connect} from 'react-redux';
import {actions as stagingActions} from 'components/Email';
import EmailsList from 'components/Email/EmailAnalytics/EmailsList';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import alertify from 'alertifyjs';
import {grey700} from 'material-ui/styles/colors';

const styles = {
  span: {color: grey700}
};

const ScheduledEmails = props => {
  return (
    <div>
    {props.emails.length > 0 && props.emails.some(email => !email.cancel) &&
      <div className='vertical-center'>
      {props.total &&
        <span className='text' style={styles.span} >Total Scheduled: {props.total}</span>}
        <div className='right'>
          <RaisedButton
          onClick={props.onCancelAllScheduledEmailsClick}
          label='Cancel All'
          primary
          icon={<FontIcon className={`${props.isReceiving ? 'fa fa-spin fa-spinner' : 'fa fa-times'}`}
          />}
          />
        </div>
      </div>}
      <EmailsList {...props}/>
    </div>
    );
};

const mapStateToProps = (state, props) => {
  const rightNow = new Date();
  const emails = state.stagingReducer.received
  .filter(id => !state.stagingReducer[id].delivered)
  .map(id => state.stagingReducer[id])
  .filter(email => new Date(email.sendat) > rightNow);
  return {
    emails,
    isReceiving: state.stagingReducer.isReceiving,
    hasNext: state.stagingReducer.scheduledOffset !== null,
    total: state.stagingReducer.scheduledTotal
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchEmails: _ => dispatch(stagingActions.fetchScheduledEmails()),
    onCancelClick: id => dispatch(stagingActions.cancelScheduledEmail(id)),
    onCancelAll: _ => dispatch(stagingActions.cancelAllScheduledEmails()),
  };
};

const mergeProps = (sProps, dProps, props) => {
  return {
    onCancelAllScheduledEmailsClick: () => {
      alertify.confirm(
        'Are you sure?',
        'Canceling all scheduled emails is not reversible. This action might take a short while. Are you sure?',
        () => {
          window.Intercom('trackEvent', 'cancel_all_emails');
          mixpanel.track('cancel_all_emails');
          dProps.onCancelAll();
        },
        () => {}
        );
    },
    ...sProps,
    ...dProps
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ScheduledEmails);
