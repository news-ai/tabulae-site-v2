import {
  tweetConstant,
} from './constants';
import * as api from '../../../actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const tweetSchema = new Schema('tweets', {idAttribute: 'tweetid'});
// const listSchema = new Schema('lists');

export function fetchContactTweets(contactId) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const contactObj = getState().tweetReducer[contactId];
    const OFFSET = contactObj ? contactObj.offset : 0;
    const isReceiving = getState().tweetReducer.isReceiving;
    if (OFFSET === null || isReceiving) return;
    dispatch({type: tweetConstant.REQUEST_MULTIPLE, contactId});
    return api.get(`/contacts/${contactId}/tweets?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(tweetSchema),
      });

      return dispatch({
        type: tweetConstant.RECEIVE_MULTIPLE,
        contactId,
        tweets: res.entities.tweets,
        ids: res.result.data,
        offset: res.result.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT});
    })
    .catch(err => {
      console.log(err);
      dispatch({type: tweetConstant.REQUEST_MULTIPLE_FAIL});
    });
  };
}
