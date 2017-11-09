import React, {Component} from 'react';
import {actions as listActions} from 'components/Lists';
import {connect} from 'react-redux';

import ListItem from './Lists/ListItem.jsx';
import ListsTitle from './Lists/ListsTitle.jsx';
import Waiting from 'components/Waiting';
import InfiniteScroll from 'components/InfiniteScroll';
import IconButton from 'material-ui/IconButton';
import {grey700} from 'material-ui/styles/colors';
import ListLabelBar from './Labels/ListLabelBar';

const styles = {
  smallIcon: {
    fontSize: 16,
    color: grey700
  },
  small: {
    width: 36,
    height: 36,
    padding: 2,
  },
  listitemContainer: {marginBottom: 50, marginTop: 50}
};

const loading = {
  zIndex: 160,
  top: 80,
  right: 10,
  position: 'fixed'
};

class ArchiveContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {isDeleting: false};
  }

  componentDidMount() {
    this.props.fetchLists();
  }

  render() {
    const {isReceiving, backRoute, backRouteTitle, title, lists, statementIfEmpty, onToggle, deleteList, listItemIcon, tooltip, person} = this.props;
    return (
      <InfiniteScroll onScrollBottom={this.props.fetchLists}>
        <div className='row' style={{marginTop: 10}}>
          <div className='large-offset-1 large-10 columns'>
            <div>
              <Waiting isReceiving={isReceiving} style={loading} />
              <ListsTitle title={title} route={backRoute} iconName='fa fa-angle-right fa-fw' backRouteTitle={backRouteTitle} />
              <div style={styles.listitemContainer}>
              <ListLabelBar />
              {lists.length === 0 && <span>{statementIfEmpty}</span>}
              {
                lists.map((list, i) =>
                <ListItem
                key={i}
                list={list}
                onToggle={onToggle}
                iconName={listItemIcon}
                tooltip={tooltip}
                extraIconButtons={
                  <IconButton
                  iconClassName={this.state.isDeleting === list.id ? 'fa fa-spinner fa-spin' : 'fa fa-trash'}
                  iconStyle={styles.smallIcon}
                  style={styles.small}
                  tooltip='Permanent Delete'
                  onClick={_ => {
                    this.setState({isDeleting: list.id});
                    deleteList(list.id)
                    .then(_ => this.setState({isDeleting: false}));
                  }}
                  />
                }
                />
                )
              }
              </div>
            </div>
          </div>
        </div>
      </InfiniteScroll>
      );
  }
}


const mapStateToProps = state => {
  const lists = state.listReducer.archived.received.map(id => state.listReducer[id]);
  return {
    lists: lists,
    isReceiving: lists === undefined ? true : false,
    statementIfEmpty: 'It looks like you haven\'t archived any list. This is where lists go when you archive them.',
    listItemIcon: 'fa fa-arrow-left',
    backRoute: '/',
    backRouteTitle: 'Media Lists',
    title: 'Archive',
    tooltip: 'put back',
    person: state.personReducer.person,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onToggle: listId => {
      dispatch({type: 'IS_FETCHING', resource: 'lists', id: listId, fetchType: 'isArchiving'});
      return dispatch(listActions.archiveListToggle(listId, 'lists'))
      .then(_ => dispatch({type: 'IS_FETCHING_DONE', resource: 'lists', id: listId, fetchType: 'isArchiving'}))
      .then(_ => dispatch(listActions.fetchArchivedLists()))
      .then(_ => dispatch(listActions.fetchLists()));
    },
    fetchLists: _ => dispatch(listActions.fetchArchivedLists()),
    deleteList: listId => dispatch(listActions.deleteList(listId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ArchiveContainer);
