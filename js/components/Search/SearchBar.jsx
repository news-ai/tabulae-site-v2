import React, {Component} from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import * as actions from './actions';
import ContactItem from './ContactItem.jsx';
import InfiniteScroll from '../InfiniteScroll';
import Waiting from '../Waiting';

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      prevQuery: '',
      isSearchReceived: false,
      isReceiving: false,
      navigate: false
    };
    this.onSearchClick = this._onSearchClick.bind(this);
    this.onScrollBottom = _ => this.props.fetchSearch(this.state.prevQuery);
    this.onKeyDown = e => e.keyCode === 13 ? this.onSearchClick() : null;
  }

  componentWillMount() {
    if (this.props.searchQuery) {
      this.props.fetchSearch(this.props.searchQuery)
      .then(_ => this.setState({
        isSearchReceived: true,
        prevQuery: this.props.searchQuery,
        query: ''
      }));
    }
  }

  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, nextLocation => {
      if (nextLocation.pathname !== '/search/table') this.props.clearSearchCache();
      // don't clear cache if heading to temp list
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.searchQuery !== this.props.searchQuery) {
      this.props.clearSearchCache();
      this.props.fetchSearch(nextProps.searchQuery)
      .then(_ => this.setState({
        isSearchReceived: true,
        prevQuery: nextProps.searchQuery,
        query: ''
      }));
    }
  }

  _onSearchClick() {
    if (this.props.isReceiving) return;
    const query = this.refs.searchQuery.input.value;
    window.Intercom('trackEvent', 'on_search_click');
    mixpanel.track('on_search_click');
    this.props.router.push(`/search?query=${query}`);
  }

  render() {
    const props = this.props;
    const state = this.state;
    let expectedResultsString = '';
    if (state.isSearchReceived) {
      if (props.results.length % 50 === 0 && props.results.length > 0) expectedResultsString = `${props.results.length}+ results`;
      else if (props.results.length === 0 ) expectedResultsString = `0 result`;
      else if (props.results.length === 1) expectedResultsString = `1 result`;
      else expectedResultsString = `${props.results.length} results`;
    }
    console.log(props.results);
    return (
      <InfiniteScroll onScrollBottom={this.onScrollBottom}>
        <div className='row horizontal-center' style={styles.topBar.container}>
          <div className='vertical-center'>
           <TextField
            hintText='Search query here...'
            ref='searchQuery'
            onKeyDown={this.onKeyDown}
            />
            <RaisedButton primary style={styles.topBar.btn} onClick={this.onSearchClick} label='Search All Lists' labelStyle={styles.topBar.btnLabel} />
          </div>
        </div>
      {state.isSearchReceived ?
        <div className='horizontal-center'>We found {expectedResultsString} for "{state.prevQuery}"</div> : null}
          <div className='row'>
            <Waiting isReceiving={props.isReceiving} style={styles.waiting} />
            <div className='large-12 columns' style={styles.resultContainer}>
            {props.results.map((contact, i) =>
              <div key={`contactitem-${i}`} style={styles.contactContainer}>
                <ContactItem {...contact} query={props.searchQuery}/>
              </div>)}
            </div>
          </div>
        {state.isSearchReceived && props.results.length % 50 === 0 && props.results.length > 0 &&
          <div className='row horizontal-center'>
            <span>Scroll to load more</span>
          </div>}
      </InfiniteScroll>
      );
  }
}

const styles = {
  topBar: {
    container: {margin: '20px 0'},
    btn: {marginLeft: 10},
    btnLabel: {textTransform: 'none'}
  },
  waiting: {top: 80, right: 10, position: 'fixed'},
  contactContainer: {marginTop: 10},
  resultContainer: {marginBottom: 30},
};

const mapStateToProps = (state, props) => {
  const searchQuery = props.location.query.query;
  const results = state.searchReducer.received.map(id => {
    const contact = state.searchReducer[id];
    const list = state.listReducer[contact.listid];
    if (list) {
      list.contacts.map((contactId, i) => {
        if (contactId === contact.id) contact.rowNum = i;
      });
    }
    return contact;
  });
  return {
    isReceiving: state.searchReducer.isReceiving,
    results: results,
    searchQuery
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action),
    fetchSearch: query => dispatch(actions.fetchSearch(query)),
    clearSearchCache: _ => dispatch(actions.clearSearchCache()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(withRouter(SearchBar));
