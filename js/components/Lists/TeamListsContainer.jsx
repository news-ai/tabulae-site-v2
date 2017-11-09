import React, {Component} from 'react';
import * as listActions from './actions';
import {actions as loginActions} from 'components/Login';
import {connect} from 'react-redux';

import Lists from './Lists';
import InfiniteScroll from 'components/InfiniteScroll';

const styles = {
  container: {marginTop: 10}
};

class TeamListsContainer extends Component {
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
        <div className='row' style={styles.container}>
          <div className='large-offset-1 large-10 columns'>
            <Lists {...this.props}/>
          </div>
        </div>
      </InfiniteScroll>
      );
  }
}

const mapStateToProps = state => {
  const lists = state.listReducer.team.received.map(id => state.listReducer[id]).filter(list => list.createdby !== state.personReducer.person.id);
  return {
    lists,
    isReceiving: lists === undefined ? true : false,
    statementIfEmpty: 'There are no team lists available.',
    listItemIcon: 'fa fa-arrow-left',
    title: 'Team Member Lists',
    tooltip: 'put back',
    person: state.personReducer.person,
    personReducer: state.personReducer
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchLists: _ => dispatch(listActions.fetchTeamLists()),
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(TeamListsContainer);
