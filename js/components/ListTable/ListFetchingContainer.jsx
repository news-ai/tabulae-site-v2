import React, {Component} from 'react';
import {connect} from 'react-redux';
import ListTable from './ListTable.jsx';
import {actions as listActions} from 'components/Lists';

const styles = {
  container: {margin: 20},
  loading: {margin: '0 10px'}
};

class ListFetchingContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchListIfNeeded();
  }

  render() {
    let renderNode = this.props.list ?
    <ListTable {...this.props}/> : (
      <div style={styles.container}>
        <span style={styles.loading}>LIST LOADING...</span>
        <i className='fa fa-cog fa-spin' />
      </div>);
    if (this.props.didInvalidate) {
      renderNode = <div style={styles.container}>LIST NOT FOUND AT THIS TIME. Check to see if you are logged into the right account then hit Refresh. If refreshing the page didn't help, reach out to Support.</div>;
    }
    return renderNode;
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);
  return {
    listId,
    list: state.listReducer[listId],
    didInvalidate: state.listReducer.didInvalidate
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchList: listId => dispatch(listActions.fetchList(listId)),
  };
};

const mergeProps = (stateProps, dispatchProps, props) => {
  return {
    fetchListIfNeeded: _ => stateProps.list ? null : dispatchProps.fetchList(stateProps.listId),
    ...stateProps,
    ...props,
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ListFetchingContainer);
