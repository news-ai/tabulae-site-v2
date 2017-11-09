import React, {Component} from 'react';
import {connect} from 'react-redux';
import InstagramItem from './InstagramItem.jsx';
import * as instagramActions from './actions';
import GenericFeed from '../GenericFeed.jsx';

class InstagramFeed extends Component {
  constructor(props) {
    super(props);
    this.rowRenderer = this._rowRenderer.bind(this);
    this.setRef = ref => {
      this._instagramList = ref;
    };
  }

  componentWillReceiveProps(nextProps) {
    // if (nextProps.containerWidth !== this.props.containerWidth) {}
  }

  _rowRenderer({key, index, style}) {
    const feedItem = this.props.feed[index];
    const transformFeedItem = Object.assign({}, feedItem, {
      instagramlikes: feedItem.likes,
      instagramcomments: feedItem.comments,
      instagramimage: feedItem.image,
      instagramlink: feedItem.link,
      instagramusername: feedItem.Username,
      instagramvideo: feedItem.video,
    });
    const row = <InstagramItem {...transformFeedItem} />;

    let newstyle = style;
    if (newstyle) newstyle.padding = '0 18px';
    return (
      <div className='vertical-center horizontal-center' key={key} style={newstyle}>
        {row}
      </div>);
  }

  render() {
    const props = this.props;
    return (
      <GenericFeed
      setRef={this.setRef}
      rowRenderer={this.rowRenderer}
      title='Instagram'
      {...props}
      />);
  }
}
const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const contactId = props.contactId;
  const feed = state.instagramReducer[contactId]
  && state.instagramReducer[contactId].received
  && state.instagramReducer[contactId].received.map(id => state.instagramReducer[id]);
  return {
    listId,
    contactId,
    feed,
    isReceiving: state.instagramReducer.isReceiving,
    didInvalidate: state.instagramReducer.didInvalidate,
    offset: state.instagramReducer[contactId] && state.instagramReducer[contactId].offset
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchFeed: _ => dispatch(instagramActions.fetchContactInstagrams(props.contactId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(InstagramFeed);
