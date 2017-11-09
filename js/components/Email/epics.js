import * as api from 'actions/api';
import 'rxjs';
import {normalize, Schema, arrayOf} from 'normalizr';
import {Observable} from 'rxjs';
const emailSchema = new Schema('emails');

export const fetchEmail = (action$) =>
  action$.ofType('EMAIL_REQUEST')
  .map(action => action.id)
  .switchMap(id =>
    api.get(`/emails/${id}`)
    .then(response => response.data)
    .catch(err => Observable.of({type: 'EMAIL_REQUEST_FAIL', message: err.message}))
    )
  .takeUntil(action$.ofType({type: 'EMAIL_REQUEST_CANCELLED'}))
  .map(email => ({type: 'EMAIL_RECEIVE', email: email, id: email.id}));

