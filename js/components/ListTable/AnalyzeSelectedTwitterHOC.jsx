import {connect} from 'react-redux';
import * as twitterDataActions from '../ContactProfile/SocialDataGraphs/Twitter/actions';
import moment from 'moment';
import AnalyzeSelected from './AnalyzeSelected.jsx';

const dataKeys = ['Likes', 'Retweets', 'Posts', 'Followers', 'Following'];
const averageBy = ['Posts', 'Followers'];

const mapStateToProps = (state, props) => {
  const filledIds = props.selected.filter(id => state.twitterDataReducer[id]);
  let dataMap = {};
  if (props.selected.length > 0 && filledIds.length === props.selected.length) {
    dataKeys.map(dataKey => {
      let data = [];
      for (let i = 0; i < state.twitterDataReducer[filledIds[0]].received.length; i++) {
        const dateObj = moment(state.twitterDataReducer[filledIds[0]].received[i].CreatedAt);
        let obj = {
          CreatedAt: state.twitterDataReducer[filledIds[0]].received[i].CreatedAt,
          dateString: dateObj.format('M-DD')
        };
        filledIds.map(contactId => {
          if (state.twitterDataReducer[contactId].received[i]) {
            obj[state.contactReducer[contactId].twitter] = state.twitterDataReducer[contactId].received[i][dataKey];
          }
        });
        data.push(obj);
      }
      dataMap[dataKey] = data;
    });
  }

  return {
    contacts: filledIds,
    syncid: 'sync-twitter',
    handles: filledIds.map(id => state.contactReducer[id].twitter),
    averageBy,
    dataMap,
    dataKeys,
    isReceiving: state.twitterDataReducer.isReceiving,
    selected: props.selected.filter(contactId => state.contactReducer[contactId] && state.contactReducer[contactId].twitter !== null)
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchData: selected => dispatch(twitterDataActions.fetchMultipleContactTwitterData(props.listId, selected, 7)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AnalyzeSelected);
