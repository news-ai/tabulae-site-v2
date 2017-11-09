// @flow
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as listActions} from 'components/Lists';
import {actions as stagingActions} from 'components/Email';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import withRouter from 'react-router/lib/withRouter';
import Link from 'react-router/lib/Link';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import {grey100, grey600, grey800, lightBlue200, lightBlue500} from 'material-ui/styles/colors';
import EmailStats from './EmailStats/EmailStats.jsx';

import Tabs, {TabPane} from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
import 'rc-tabs/assets/index.css';

import './SentEmails.css';

const styles = {
  tabHandle: {
    color: grey800,
    padding: '3px 13px',
    display: 'inline-block',
    fontSize: '0.9em'
  },
  tabHandleActive: {
    color: lightBlue500,
    borderBottom: `2px solid ${lightBlue200}`,
  },
  searchIcon: {color: grey600},
  childrenMargin: {margin: 5},
  tabContainer: {borderBottom: `2px solid ${grey100}`, marginBottom: 15},
  label: {fontSize: '1.3em', marginRight: 10},
  labelContainer: {margin: '20px 0'},
};

const TabHandle = ({pathKey, label, activeKey, children, router, alsoMatch}) => {
  // clean up activeKey if last char is /
  return (
    <Link
    onlyActiveOnIndex
    style={styles.tabHandle}
    activeStyle={styles.tabHandleActive}
    to={pathKey}
    >
      {children}
    </Link>
    );
};

class SentEmailsPaginationContainer extends Component {
  handleFilterChange: (event: Event, index: number, filterValue: number) => void;
  onTabChange: (activeKey: string) => void;
  onSearchClick: (query: string) => void;
  state: {
    filterValue: number,
    isShowingArchived: bool,
    activeKey: string,
    start: number,
  };
  constructor(props) {
    super(props);
    this.state = {
      activeKey: this.props.listId > 0 ? '/emailstats' : this.props.location.pathname,
      start: 0,
    };
    this.onTabChange = activeKey => {
      this.props.router.push(activeKey);
      this.setState({activeKey});
    };
    this.onSearchClick = this._onSearchClick.bind(this);
    this.onSearchKeyDown = e => e.key === 'Enter' ? this.onSearchClick(this.refs.emailSearch.input.value) : null;
  }

  componentWillMount() {
    const {searchQuery} = this.props;
    if (searchQuery) this.onSearchClick(searchQuery);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.searchQuery && nextProps.searchQuery !== this.props.searchQuery) {
      this.onSearchClick(nextProps.searchQuery);
    }
  }

  _onSearchClick(query) {
    if (!query) return;
    this.onTabChange('/emailstats/search');
    this.props.router.push(`/emailstats/search/${query}`);
  }

  render() {
    const state = this.state;
    const props = this.props;
    const filterLists = props.lists || [];
    const selectable = [
    <MenuItem key={0} value={0} primaryText='------- All Emails -------' />]
    .concat(filterLists.map((list, i) =>
      <MenuItem key={i + 1} value={list.id} primaryText={list.name}/>
      ));
    // console.log(props.router.location);
    const routeKey = props.router.location.pathname;

    return (
        <div className='row'>
          <div className='large-12 medium-12 small-12 columns vertical-center' style={styles.labelContainer}>
            <span style={styles.label}>Emails You Sent</span>
            <div className='right'>
              <TextField
              ref='emailSearch'
              floatingLabelText='Search Filter'
              onKeyDown={this.onSearchKeyDown}
              />
              <IconButton
              iconStyle={styles.searchIcon}
              iconClassName='fa fa-search'
              onClick={e => this.onSearchClick(this.refs.emailSearch.input.value)}
              />
            </div>
          </div>
          <div className='large-12 medium-12 small-12 columns' style={styles.tabContainer}>
            <div className='vertical-center'>
              <TabHandle pathKey='/emailstats' activeKey={routeKey}>Campaigns</TabHandle>
              <TabHandle pathKey='/emailstats/all' alsoMatch={['/emailstats/lists/:listId']} activeKey={routeKey}>All Sent Emails</TabHandle>
              <TabHandle pathKey='/emailstats/scheduled' activeKey={routeKey}>Scheduled Emails</TabHandle>
              <TabHandle pathKey='/emailstats/trash' activeKey={routeKey}>Trash</TabHandle>
              <TabHandle pathKey='/emailstats/search' alsoMatch={['/emailstats/search/:searchQuery']} activeKey={routeKey}>Search</TabHandle>
            {/*
              <TabHandle pathKey='/emailstats/charts' activeKey={routeKey}>Charts</TabHandle>
              */}
            </div>
          </div>
          <div className='large-12 medium-12 small-12 columns' style={styles.childrenMargin}>
          {props.children}
          </div>
        </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    canLoadMore: state.stagingReducer.offset !== null,
    searchQuery: props.params.searchQuery,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchSentEmails: _ => dispatch(stagingActions.fetchSentEmails()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SentEmailsPaginationContainer));
