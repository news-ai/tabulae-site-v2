import {
  searchConstant,
  SEARCH_CLEAR_CACHE
} from './constants';
import * as api from '../../actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const contactSchema = new Schema('contacts');
const listSchema = new Schema('lists');
const publicationSchema = new Schema('publications');

import {actions as listActions} from 'components/Lists';
import {actions as publicationActions} from 'components/Publications';


export function clearSearchCache() {
  return dispatch => dispatch({type: SEARCH_CLEAR_CACHE});
}

export function fetchSearch(query) {
  const PAGE_LIMIT = 50;
  if (query.length === 0) return;
  return (dispatch, getState) => {
    if (getState().searchReducer.isReceiving) return;
    if (query !== getState().searchReducer.query) dispatch({type: SEARCH_CLEAR_CACHE});
    const OFFSET = getState().searchReducer.offset;
    if (OFFSET === null) return;
    dispatch({type: searchConstant.REQUEST_MULTIPLE, query});
    return api.get(`/contacts?q="${query}"&limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      const listOnly = response.included.filter(item => item.type === 'lists');
      const pubOnly = response.included.filter(item => item.type === 'publications');
      response.lists = listOnly;
      response.publications = pubOnly;
      const res = normalize(response, {
        data: arrayOf(contactSchema),
        lists: arrayOf(listSchema),
        publications: arrayOf(publicationSchema)
      });

      dispatch(listActions.receiveLists(res.entities.lists, res.result.lists, 0));
      dispatch(publicationActions.receivePublications(res.entities.publications, res.result.publications));
      dispatch({type: searchConstant.SET_OFFSET, offset: response.count === PAGE_LIMIT ? (OFFSET + PAGE_LIMIT) : null, query});
      return dispatch({type: searchConstant.RECEIVE_MULTIPLE, contacts: res.entities.contacts, ids: res.result.data, query});
    })
    .catch(err => console.log(err));
  };
}

