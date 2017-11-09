import {emailStatsConstant} from './constants';
import * as api from 'actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const emailStatsSchema = new Schema('emailStats', {idAttribute: 'Date'});

export function fetchEmailStats(limit = 7) {
  const PAGE_LIMIT = limit;
  return (dispatch, getState) => {
    const OFFSET = getState().emailStatsReducer.offset;
    if (OFFSET === null || getState().emailStatsReducer.isReceiving) return;
    dispatch({type: emailStatsConstant.REQUEST, limit: PAGE_LIMIT});
    return api.get(`/emails/stats?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(
      response => {
        const res = normalize(response, {data: arrayOf(emailStatsSchema)});
        const newOffset = response.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT;
        return dispatch({
          type: emailStatsConstant.RECEIVE,
          stats: res.entities.emailStats,
          ids: res.result.data.reverse(),
          offset: newOffset
        });
      },
      error => dispatch({type: emailStatsConstant.REQUEST_FAIL, error: error.message})
      );
  };
}
