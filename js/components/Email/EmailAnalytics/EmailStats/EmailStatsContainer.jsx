import React, {Component} from 'react';
import {connect} from 'react-redux';

import withRouter from 'react-router/lib/withRouter';
import EmailStats from './EmailStats.jsx';
import PlainEmailsList from './PlainEmailsList.jsx';
import {actions as stagingActions} from 'components/Email';
import {grey700} from 'material-ui/styles/colors';

const pageTitleSpan = {fontSize: '1.5em'};
const marginTop = {marginTop: 20};
const emailContainerStyle = {height: 20, margin: 10, marginBottom: 20, display: 'inline-block'};
const emailContainerLabelStyle = {fontSize: '1.2em', color: grey700};
const smallSpanStyle = {margin: '0 5px'};

class EmailStatsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDay: undefined,
      emails: [],
      isEmailLoading: false,
      noEmailSentDay: false,
      hasNext: false
    };
    this.onDateSelected = this._onDateSelected.bind(this);
    this.fetchEmails = _ => this.onDateSelected(this.state.selectedDay);
    this.onChartClick = day => this.props.router.push(`/emailstats/charts?date=${day}`);
  }

  componentWillMount() {
    if (this.props.queryDate) {
      this.onDateSelected(this.props.queryDate);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.queryDate !== nextProps.queryDate) {
      window.Intercom('trackEvent', 'get_specific_day_emails');
      mixpanel.track('get_specific_day_emails');
      this.onDateSelected(nextProps.queryDate);
    }
  }

  _onDateSelected(day) {
    // simple receiver
    const receiveEmails = emails => this.setState({emails, isEmailLoading: false, noEmailSentDay: emails.length === 0});

    this.setState({selectedDay: day, isEmailLoading: true});
    const dayStats = this.props.emailStatsReducer[day];
    if (dayStats && dayStats.received && !dayStats.hitThreshold) {
      // hits cache if already fetched
      const emails = dayStats.received.map(id => this.props.stagingReducer[id]);
      receiveEmails(emails);
    } else {
      this.props.fetchSpecificDayEmails(day)
      .then(receiveEmails);
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    const emailStats = props.emailStatsReducer[state.selectedDay];
    const hasNext = emailStats && emailStats.hitThreshold;
    return (
    <div>
      <div className='row'>
        <span style={pageTitleSpan}>Opens/Clicks History</span>
      </div>
      <div style={marginTop}>
      {props.didInvalidate &&
        <div>An error occurred. Email stats cannot be fetched at this time.</div>}
        <EmailStats onDateSelected={this.onChartClick}/>
      </div>
      <div style={emailContainerStyle}>
        <span style={emailContainerLabelStyle}>{state.selectedDay}</span>
      {state.isEmailLoading &&
        <span style={smallSpanStyle}>Loading emails... <i className='fa fa-spinner fa-spin'/></span>}
      </div>
    {!state.isEmailLoading && state.emails.length === 0 &&
      <span>{state.noEmailSentDay ? `No email sent on day selected.` : `Click on a point in the chart to show emails sent on that day.`}</span>}
    {state.emails.length > 0 &&
      <PlainEmailsList
      emails={state.emails}
      fetchEmails={this.fetchEmails}
      hasNext={hasNext}
      />}
    </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    didInvalidate: state.emailStatsReducer.didInvalidate,
    emailDidInvalidate: state.stagingReducer.didInvalidate,
    isReceiving: state.emailStatsReducer.isReceiving,
    emailStatsReducer: state.emailStatsReducer,
    stagingReducer: state.stagingReducer,
    queryDate: props.router.location.query.date,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchSpecificDayEmails: day => dispatch(stagingActions.fetchSpecificDayEmails(day)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(EmailStatsContainer));
