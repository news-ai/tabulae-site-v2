import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as listActions from 'components/Lists/actions';
import {green500, grey500, grey800} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';

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
        {this.props.lists.map(list => {
          const added = this.props.listsBelong.some(l => l.id === list.id);
          return (
              <div style={{color: added ? grey500 : grey800}}>
                <span>{list.name}</span>
              {!added &&
                <FontIcon
                className='fa fa-plus'
                style={{fontSize: '0.9em', margin: '3px 5px', cursor: 'pointer'}}
                color={grey500}
                hoverColor={green500}
                onClick={_ => this.props.addToList(list.id)}
                />}
              </div>
            )}
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
    addToList: listid => dispatch({type: 'ADD_CONTACT_TO_LIST', contactid: props.contactid, listid}),
  })
  )(ListsContactBelongsToPanel);
