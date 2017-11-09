import React, {Component} from 'react';
import * as listActions from './actions';
import {actions as loginActions} from 'components/Login';
import {connect} from 'react-redux';

import Lists from './Lists';
import InfiniteScroll from 'components/InfiniteScroll';

class PublicListsContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchLists()
    .then(_ => this.props.fetchUsers());
  }

  render() {
    return (
      <InfiniteScroll onScrollBottom={this.props.fetchLists}>
        <div className='row' style={{marginTop: 10}}>
          <div className='large-offset-1 large-10 columns'>
            <Lists {...this.props} />
          </div>
        </div>
      </InfiniteScroll>
      );
  }
}

const mapStateToProps = state => {
  const lists = state.listReducer.public.received.map(id => state.listReducer[id]);
  return {
    lists,
    isReceiving: lists === undefined ? true : false,
    statementIfEmpty: 'There are no public lists available.',
    listItemIcon: 'fa fa-arrow-left',
    title: 'Public Lists',
    tooltip: 'put back',
    person: state.personReducer.person,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchLists: _ => dispatch(listActions.fetchPublicLists()),
    fetchUser: userId => dispatch(loginActions.fetchUser(userId)),
  };
};


const mergeProps = (sProps, dProps, props) => {
  return {
    ...sProps,
    ...dProps,
    ...props,
    fetchUsers: _ => {
      sProps.lists.filter(list => list.createdby !== sProps.person.id || !sProps.personReducer[list.createdby])
      .map(list => dProps.fetchUser(list.createdby));
    }
  }
}


export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(PublicListsContainer);
