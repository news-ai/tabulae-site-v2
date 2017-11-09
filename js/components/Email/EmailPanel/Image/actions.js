import * as api from 'actions/api';
import {imgConstant} from './constants';

export function uploadImage(file) {
  return dispatch => {
    dispatch({type: imgConstant.REQUEST, file});
    let data = new FormData();
    data.append('file', file);
    return api.postFile(`/emails/upload`, data)
    .then(response => {
      const src = response.data[0].url;
      dispatch({type: imgConstant.RECEIVE, src});
      return src;
    })
    .catch(err => dispatch({type: imgConstant.REQUEST_FAIL, err}));
  };
}
