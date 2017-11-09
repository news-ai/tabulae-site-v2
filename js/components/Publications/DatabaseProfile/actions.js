import {
  REQUEST_PUBLICATION_DATABASE_PROFILE,
  RECEIVE_PUBLICATION_DATABASE_PROFILE,
  REQUEST_PUBLICATION_DATABASE_PROFILE_FAIL,
} from './constants';
import {normalize, Schema, arrayOf} from 'normalizr';
import * as api from 'actions/api';

export function fetchDatabaseProfile(publicationId) {
  return (dispatch, getState) => {
    const publication = getState().publicationReducer[publicationId];
    if (!publication || !publication.url) return;
    dispatch({type: REQUEST_PUBLICATION_DATABASE_PROFILE, publicationId});
    return api.get(`/publications/${publicationId}/database-profile`)
    .then(response => {
      return dispatch({type: RECEIVE_PUBLICATION_DATABASE_PROFILE, publicationId, profile: response.data});
    })
    .catch(err => dispatch({type: REQUEST_PUBLICATION_DATABASE_PROFILE_FAIL, message: err}));
  };
}

