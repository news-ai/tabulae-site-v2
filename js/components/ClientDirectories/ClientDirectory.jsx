import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actions from './actions';
import Waiting from 'components/Waiting';
import ListItem from 'components/Lists/Lists/ListItem.jsx';

const ClientDirectory = props => {
  return (<div>
  {props.lists.map((list, i) => <ListItem key={`client-list-${i}`} list={list}/>)}
  </div>);
};

class ClientDirectoryContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchLists();
  }

  render() {
    const props = this.props;
    return !props.lists ?
      <Waiting style={{float: 'right'}} isReceiving={props.isReceiving} /> :
    <ClientDirectory {...props}/>;
  }
}

const mapStateToProps = (state, props) => {
  const clientname = props.params.clientname;
  const listIds = state.clientReducer[clientname];
  return {
    clientname,
    listIds,
    lists: listIds && listIds.map(id => state.listReducer[id]),
    isReceiving: state.listReducer.isReceiving
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const clientname = props.params.clientname;
  return {
    fetchLists: _ => dispatch(actions.fetchClientLists(clientname))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ClientDirectoryContainer);
