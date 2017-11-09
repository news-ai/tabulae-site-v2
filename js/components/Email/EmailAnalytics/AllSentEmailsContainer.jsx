import React, {Component} from 'react';
import {connect} from 'react-redux';
import EmailsList from 'components/Email/EmailAnalytics/EmailsList';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import {actions as stagingActions} from 'components/Email';
import {lightBlue50, grey100, grey500, grey700, grey800} from 'material-ui/styles/colors';
import {actions as listActions} from 'components/Lists';
import withRouter from 'react-router/lib/withRouter';
import DatePicker from 'material-ui/DatePicker';
import FontIcon from 'material-ui/FontIcon';
import moment from 'moment';
import PlainEmailsList from './EmailStats/PlainEmailsList.jsx';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';

const DATEFORMAT = 'YYYY-MM-DD';
const DEFAULT_DATE = '0001-01-01T00:00:00Z';

const parseDate = datestring => {
  const parts = datestring.split('-').map(num => parseInt(num, 10));
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

class AllSentEmailsContainer extends Component {
  constructor(props) {
    super(props);
    const date = this.props.date ? new Date(parseDate(this.props.date)) : undefined;
    this.state = {
      filterListValue: this.props.listId || 0,
      filterDateValue: date,
      filterTypeValue: this.props.filter || 'none',
    };
    this.handleTypeChange = this._handleTypeChange.bind(this);
    this.handleListChange = this._handleListChange.bind(this);
    this.handleDateChange = this._handleDateChange.bind(this);
    this.onDateCancel = this._onDateCancel.bind(this);
    this.onSubjectCancel = this._onSubjectCancel.bind(this);
    this.shouldDisableDate = date => date > new Date();
  }

  componentWillMount() {
    const {listReceived, fetchLists} = this.props;
    if (!listReceived || listReceived.length === 0) fetchLists();
    this.props.fetchEmails();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.listId !== this.props.listId) {
      nextProps.fetchEmails();
      const listId = nextProps.listId === 0 ? undefined : nextProps.listId;
      this.setState({filterListValue: listId});
    }

    if (nextProps.date !== this.props.date) {
      const date = nextProps.date ? new Date(parseDate(nextProps.date)) : undefined;
      this.setState({filterDateValue: date});
    }

    if (nextProps.subject !== this.props.subject) {
      nextProps.fetchEmails();
    }

    if (nextProps.baseSubject !== this.props.baseSubject) {
      nextProps.fetchEmails();
    }

    if (nextProps.filter !== this.props.filter) {
      nextProps.fetchEmails();
    }
  }

  _handleTypeChange(e, index, filterTypeValue) {
    let query = Object.assign({}, this.props.location.query);
    if (index === 0) {
      delete query.filter;
    } else {
      query.filter = filterTypeValue;
    }
    window.Intercom('trackEvent', 'filter_emails_by_type', {type: filterTypeValue});
    mixpanel.track('filter_emails_by_type', {type: filterTypeValue});
    this.props.router.push({pathname: `/emailstats/all`, query});
    this.setState({filterTypeValue});
  }

  _handleListChange(e, index, filterListValue) {
    let query = Object.assign({}, this.props.location.query);
    if (index === 0) {
      delete query.listId;
    } else {
      this.props.fetchListEmails(filterListValue);
      query.listId = filterListValue;
    }
    window.Intercom('trackEvent', 'filter_emails_by_list');
    mixpanel.track('filter_emails_by_list');
    this.props.router.push({pathname: `/emailstats/all`, query});
    this.setState({filterListValue});
  }

  _handleDateChange(e, filterDateValue) {
    let query = Object.assign({}, this.props.location.query);
    const queryDate = moment(filterDateValue).format(DATEFORMAT);
    this.props.fetchSpecificDayEmails(queryDate);
    query.date = queryDate;
    window.Intercom('trackEvent', 'filter_emails_by_date');
    mixpanel.track('filter_emails_by_date');
    this.props.router.push({pathname: `/emailstats/all`, query});
    this.setState({filterDateValue});
  }

  _onDateCancel() {
    let query = Object.assign({}, this.props.location.query);
    delete query.date;
    this.props.router.push({pathname: `/emailstats/all`, query});
    this.setState({filterDateValue: undefined});
  }

  _onSubjectCancel() {
    let query = Object.assign({}, this.props.location.query);
    delete query.subject;
    delete query.baseSubject;
    this.props.router.push({pathname: `/emailstats/all`, query});
  }

  render() {
    const props = this.props;
    const state = this.state;
    const filterLists = props.lists || [];
    const selectable = [
      <MenuItem key={0} value={0} primaryText='------- By List -------' />]
      .concat(filterLists.map((list, i) =>
        <MenuItem key={i + 1} value={list.id} primaryText={list.name}/>
        ));
    // console.log(props.router.location);
    const routeKey = props.router.location.pathname;
    // console.log(props.emails);
    return (
      <div>
      {props.lists &&
        <Toolbar style={styles.toolbar}>
          <ToolbarGroup firstChild>
            <ToolbarTitle style={styles.toolbarTitle} text='Filters' />
            <DropDownMenu
            value={state.filterTypeValue}
            onChange={this.handleTypeChange}
            labelStyle={styles.typeDropdown.labelStyle}
            style={styles.typeDropdown.dropdown}
            >
              <MenuItem value='none' primaryText='--- By Type ---' />
              <MenuItem value='open' primaryText='Open' />
              <MenuItem value='bounce' primaryText='Bounce' />
              <MenuItem value='click' primaryText='Click' />
              <MenuItem value='unopen' primaryText='Unopen' />
              <MenuItem value='unclick' primaryText='Unclick' />
            </DropDownMenu>
            <DropDownMenu
            value={state.filterListValue}
            onChange={this.handleListChange}
            labelStyle={styles.listDropdown.labelStyle}
            style={styles.listDropdown.dropdown}
            >
            {selectable}
            </DropDownMenu>
            <DatePicker
            value={state.filterDateValue}
            onChange={this.handleDateChange}
            shouldDisableDate={this.shouldDisableDate}
            firstDayOfWeek={1}
            autoOk hintText='By Day Created' container='inline'
            style={styles.datepicker.style}
            textFieldStyle={styles.datepicker.textFieldStyle}
            hideCalendarDate
            />
            <FontIcon
            className='fa fa-times pointer'
            color={grey500}
            hoverColor={grey700}
            onClick={this.onDateCancel}
            style={styles.smallIcon}
            />
          </ToolbarGroup>
        </Toolbar>
      }

      {(props.subject || props.baseSubject) &&
        <div className='vertical-center' style={styles.subjectContainer}>
          <span className='text' style={styles.subjectLabel}>Campaign:</span>
          <span style={styles.subject}>{props.subject || props.baseSubject}</span>
          <FontIcon
          className='fa fa-times pointer'
          color={grey500}
          hoverColor={grey700}
          onClick={this.onSubjectCancel}
          style={styles.smallIcon}
          />
        </div>}
        <div style={styles.emaillist.containter}>
        {props.date ?
          <PlainEmailsList
          emails={props.emails}
          fetchEmails={props.fetchEmails}
          hasNext={props.hasNext}
          isReceiving={props.isReceiving}
          /> :
          <EmailsList {...this.props}/>}
        </div>
      </div>);
  }
}

const styles = {
  filterLabel: {fontSize: '0.9em', color: grey800},
  toolbar: {
    // border: `1px solid ${lightBlue200}`,
    backgroundColor: lightBlue50,
  },
  toolbarTitle: {marginLeft: 15},
  listDropdown: {
    labelStyle: {
      color: grey700,
    },
    dropdown: {margin: 0}
  },
  typeDropdown: {
    labelStyle: {
      color: grey700,
    },
    dropdown: {
      margin: 0
    }
  },
  smallIcon: {fontSize: '0.9em'},
  subject: {
    color: grey800,
    margin: '0 10px',
  },
  subjectLabel: {
    color: grey500,
  },
  subjectContainer: {
    height: 40,
  },
  emaillist: {
    containter: {margin: '10px 0'}
  },
  datepicker: {
    style: {selectColor: 'blue', width: 200, marginLeft: 15},
    textFieldStyle: {color: grey800}
  }
};

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.router.location.query.listId, 10) || 0;
  const date = props.router.location.query.date;
  const subject = props.router.location.query.subject;
  const baseSubject = props.router.location.query.baseSubject;
  const filter = props.router.location.query.filter;
  let hasNext = true;
  let validators = [];
  if (listId === 0) {
    validators.push(
      id => {
        // console.log(state.stagingReducer[id].delivered && state.stagingReducer[id].issent);
        return state.stagingReducer[id].delivered && state.stagingReducer[id].issent;
      });
  } else {
    hasNext = state.stagingReducer.listOffsets[listId] !== null;
    validators.push(
      id => state.stagingReducer[id].delivered && !state.stagingReducer[id].archived && state.stagingReducer[id].listid === listId
      );
  }
  const filterQuery = state.stagingReducer.filterQuery;
  if (subject || baseSubject) {
    hasNext = filterQuery.received ? filterQuery.received.length !== filterQuery.total : true;
    validators.push(
      id => {
        if (baseSubject) return state.stagingReducer[id].baseSubject === baseSubject;
        return state.stagingReducer[id].subject === subject;
      });
  }

  if (date) {
    hasNext = filterQuery.received ? filterQuery.received.length !== filterQuery.total : true;
    validators.push(
      id => {
        const email = state.stagingReducer[id];
        const datestring = moment.utc(email.created).format(DATEFORMAT);
        return datestring === date;
      });
  }

  if (filter) {
    hasNext = filterQuery.received ? filterQuery.received.length !== filterQuery.total : true;
    validators.push(
      id => filterQuery && filterQuery.received && filterQuery.received.some(emailId => emailId === id));
  }
  // console.log(validators);

  let emails = state.stagingReducer.received.reduce((acc, id) => {
    const validated = validators.reduce((val, validator) => validator(id) && val, true);
    if (validated) acc.push(state.stagingReducer[id]);
    return acc;
  }, []);

  return {
    date,
    emails,
    listId,
    filter,
    subject,
    baseSubject,
    isReceiving: state.stagingReducer.isReceiving,
    placeholder: 'No emails found.',
    hasNext,
    listReceived: state.listReducer.received,
    lists: state.listReducer.lists.received.map(id => state.listReducer[id]),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const listId = parseInt(props.router.location.query.listId, 10) || 0;
  const date = props.router.location.query.date;
  const subject = props.router.location.query.subject;
  const filter = props.router.location.query.filter;
  const baseSubject = props.router.location.query.baseSubject;

  let fetchEmails = _ => dispatch(stagingActions.fetchSentEmails());
  // TODO: the one below chunks requests at 150, use it if users are hitting fetchMore button a lot
  // let fetchEmails = _ => dispatch(stagingActions.fetchSentThresholdEmails());
  if (listId > 0) {
    fetchEmails = _ => dispatch(stagingActions.fetchListEmails(listId));
  }
  if (date || subject || baseSubject || filter) {
    let query = {date};
    if (baseSubject) query.baseSubject = baseSubject;
    else query.subject = subject;
    if (filter) query.filter = filter;
    fetchEmails = _ => dispatch(stagingActions.fetchFilterQueryEmails(query));
  }

  return {
    fetchEmails,
    // refreshEmails: _ => {
    //   dispatch({type: 'RESET_STAGING_OFFSET'});
    //   dispatch(stagingActions.fetchSentEmails());
    // },
    fetchLists: _ => dispatch(listActions.fetchLists()),
    fetchListEmails: id => dispatch(stagingActions.fetchListEmails(id)),
    fetchSpecificDayEmails: day => dispatch(stagingActions.fetchSpecificDayEmails(day)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AllSentEmailsContainer));
