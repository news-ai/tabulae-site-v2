import React, {Component} from 'react';
import * as listActions from './actions';
import browserHistory from 'react-router/lib/browserHistory';
import {connect} from 'react-redux';

import Lists from './Lists';
import InfiniteScroll from 'components/InfiniteScroll';

import hopscotch from 'hopscotch';
import 'node_modules/hopscotch/dist/css/hopscotch.min.css';
import {tour} from './tour';

class TagListsContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchLists();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.showUploadGuide !== this.props.showUploadGuide) {
      setTimeout(_ => this.refs.input.show(), 1000);
    }

    if (nextProps.showGeneralGuide !== this.props.showGeneralGuide) {
      hopscotch.startTour(tour);
    }

    if (nextProps.tag !== this.props.tag) {
      nextProps.fetchLists();
    }
  }

  render() {
    return (
      <InfiniteScroll className='row' onScrollBottom={this.props.fetchLists}>
        <div className='large-offset-1 large-10 columns'>
          <Lists {...this.props} />
        </div>
      </InfiniteScroll>
      );
  }
}


const mapStateToProps = (state, props) => {
  const tag = props.params.tag;
  const listReducer = state.listReducer;
  const lists = listReducer.tagLists.map(id => listReducer[id]);
  return {
    lists,
    tag,
    isReceiving: listReducer.isReceiving,
    statementIfEmpty: `There is no list tagged with :${tag}`,
    title: `Tag: ${tag}`,
    tooltip: 'archive',
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const tag = props.params.tag;
  return {
    onToggle: listId => dispatch(listActions.archiveListToggle(listId))
    .then( _ => dispatch(listActions.fetchLists())),
    newListOnClick: untitledNum => {
      dispatch(listActions.createEmptyList(untitledNum))
      .then(response => browserHistory.push(`/lists/${response.data.id}`));
    },
    fetchLists: _ => dispatch(listActions.fetchTagLists(tag))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagListsContainer);
