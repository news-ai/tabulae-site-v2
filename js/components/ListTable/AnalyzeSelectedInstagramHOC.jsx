import {connect} from 'react-redux';
import * as instagramDataActions from '../ContactProfile/SocialDataGraphs/Instagram/actions';
import moment from 'moment';
import AnalyzeSelected from './AnalyzeSelected.jsx';

const dataKeys = ['Likes', 'Comments', 'Posts', 'Followers', 'Following'];
const averageBy = ['Posts', 'Followers'];

const mapStateToProps = (state, props) => {
  const filledIds = props.selected.filter(id => state.instagramDataReducer[id]);

  let dataMap = {};
  if (props.selected.length > 0 && filledIds.length === props.selected.length) {
    dataKeys.map(dataKey => {
      let data = [];
      for (let i = 0; i < state.instagramDataReducer[filledIds[0]].received.length; i++) {
        // reformat date for graph
        const dateObj = moment(state.instagramDataReducer[filledIds[0]].received[i].CreatedAt);
        let obj = {
          CreatedAt: state.instagramDataReducer[filledIds[0]].received[i].CreatedAt,
          dateString: dateObj.format('M-DD')
        };
        // reformat data to username for graph
        filledIds.map(contactId => {
          if (state.instagramDataReducer[contactId].received[i]) {
            obj[state.contactReducer[contactId].instagram] = state.instagramDataReducer[contactId].received[i][dataKey];
          }
        });
        data.push(obj);
      }
      dataMap[dataKey] = data;
    });
  }

  return {
    contacts: filledIds,
    syncid: 'sync-instagram',
    handles: filledIds.map(id => state.contactReducer[id].instagram),
    averageBy,
    dataMap,
    dataKeys,
    isReceiving: state.instagramDataReducer.isReceiving,
    selected: props.selected.filter(contactId => state.contactReducer[contactId] && state.contactReducer[contactId].instagram !== null)
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchData: selected => dispatch(instagramDataActions.fetchMultipleContactInstagramData(props.listId, selected, 7)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AnalyzeSelected);
