import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as listActions from 'components/Lists/actions';
import {grey500, grey800} from 'material-ui/styles/colors';

class ListsContactBelongsToPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    if (this.props.lists.length === 0) this.props.fetchLists();
  }

  render() {
    return (
      <div>
        <div>Add Contact to lists</div>
      {this.props.isReceiving &&
        <div>IS RECEIVING</div>}
        <div>
        {this.props.lists.map(list =>
          <div
          style={{color: this.props.listsBelong.some(l => l.id === list.id) ? grey500 : grey800}}
          >{list.name}</div>
          )}
        </div>
      </div>
    );
  }
}

export default connect(
  (state, props) => ({
    lists: state.listReducer.lists.received.map(id => state.listReducer[id]),
    isReceiving: state.listReducer.isReceiving,
    listsBelong: state.listsContactBelongsToReducer[props.contactid] ?
    state.listsContactBelongsToReducer[props.contactid].map(id => state.listReducer[id]) : []
  }),
  (dispatch, props) => ({
    fetchLists: () => dispatch(listActions.fetchLists()),
    searchList: () => dispatch({type: 'FETCH_SEARCH_LIST'}),
    addToList: ({contactid, listid}) => dispatch({type: 'ADD_CONTACT_TO_LIST', contactid, listid}),
  })
  )(ListsContactBelongsToPanel);
