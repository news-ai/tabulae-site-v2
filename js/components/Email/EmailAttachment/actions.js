import * as api from 'actions/api';

export function fetchAttachment(fileId) {
  return (dispatch, getState) => {
    dispatch({type: 'EMAIL_ATTACHMENT_REQUEST', fileId});
    if (getState().emailAttachmentReducer[fileId]) return;
    return api.get(`/files/${fileId}`)
    .then(response => dispatch({type: 'EMAIL_ATTACHMENT_RECEIVE', fileId, attachment: response.data}))
    .catch(err => dispatch({type: 'EMAIL_ATTACHMENT_REQUEST_FAIL', err}));
  };
}
