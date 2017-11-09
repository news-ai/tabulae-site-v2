import React, {Component} from 'react';
import {connect} from 'react-redux';
import HeadlineItem from './HeadlineItem.jsx';
import * as headlineActions from './actions';
import GenericFeed from '../GenericFeed.jsx';

class Headlines extends Component {
  constructor(props) {
    super(props);
    this.rowRenderer = this._rowRenderer.bind(this);
    this.setRef = ref => {
      this._headlineList = ref;
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.containerWidth !== this.props.containerWidth) {
      // if (this._headlineList) this._headlineList.recomputeRowHeights();
    }
  }

  _rowRenderer({key, index, style}) {
    const feedItem = this.props.feed[index];
    const row = <HeadlineItem {...feedItem} />;

    let newstyle = style;
    if (newstyle) {
      newstyle.padding = '0 18px';
    }
    return (
      <div className='vertical-center' key={key} style={newstyle}>
        {row}
      </div>);
  }

  render() {
    const props = this.props;
    return (
      <GenericFeed
      setRef={this.setRef}
      rowRenderer={this.rowRenderer}
      title='RSS'
      {...props}
      />);
  }
}
const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const contactId = props.contactId;
  const feed = state.headlineReducer[contactId]
  && state.headlineReducer[contactId].received
  && state.headlineReducer[contactId].received.map(id => state.headlineReducer[id]);
  return {
    listId,
    contactId,
    feed,
    isReceiving: state.headlineReducer.isReceiving,
    didInvalidate: state.headlineReducer.didInvalidate,
    offset: state.headlineReducer[contactId] && state.headlineReducer[contactId].offset
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchFeed: _ => dispatch(headlineActions.fetchContactHeadlines(props.contactId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Headlines);
