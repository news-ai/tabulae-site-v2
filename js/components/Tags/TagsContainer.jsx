import Tags from './Tags.jsx';
import {connect} from 'react-redux';
import {actions as listActions} from 'components/Lists';


const mapStateToProps = (state, props) => {
  return {
    list: state.listReducer[props.listId],
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const listId = props.listId;
  return {
    patchList: listBody => dispatch(listActions.patchList(listBody)),
  };
};

const mergeProps = ({list}, {patchList}, ownProps) => {
  return {
    tags: list.tags,
    onDeleteTag: name => patchList({
      listId: list.id,
      name: list.name,
      tags: list.tags.filter(tagName => tagName !== name),
      client: list.client
    }),
    creatLink: name => `/tags/${name}`,
    ...ownProps,
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Tags);
