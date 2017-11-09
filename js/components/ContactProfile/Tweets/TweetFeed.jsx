import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as tweetActions from './actions';
import Tweet from './Tweet.jsx';
import GenericFeed from '../GenericFeed.jsx';

class TweetFeed extends Component {
  constructor(props) {
    super(props);
    this.rowRenderer = this._rowRenderer.bind(this);
    this.setRef = ref => {
      this._tweetList = ref;
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.containerWidth !== this.props.containerWidth) {
      if (this._tweetList) this._tweetList.recomputeRowHeights();
    }
  }

  _rowRenderer({key, index, style}) {
    const feedItem = this.props.feed[index];
    const row = <Tweet screenWidth={this.props.containerWidth} {...feedItem} />;

    let newstyle = style;
    if (newstyle) newstyle.padding = '0 18px';
    return (
      <div
      className='vertical-center'
      key={key}
      style={newstyle}>
        {row}
      </div>);
  }

  render() {
    const props = this.props;
    return (
      <GenericFeed
      setRef={this.setRef}
      rowRenderer={this.rowRenderer}
      title='Twitter'
      {...props}
      />);
  }
}

const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const contactId = props.contactId;
  const feed = state.tweetReducer[contactId]
  && state.tweetReducer[contactId].received
  && state.tweetReducer[contactId].received.map(id => state.tweetReducer[id]);

  return {
    listId,
    contactId,
    feed,
    isReceiving: state.tweetReducer.isReceiving,
    didInvalidate: state.tweetReducer.didInvalidate,
    offset: state.tweetReducer[contactId] && state.tweetReducer[contactId].offset
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchFeed: _ => dispatch(tweetActions.fetchContactTweets(props.contactId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TweetFeed);
