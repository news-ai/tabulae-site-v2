import * as api from 'actions/api';
import 'rxjs';
import {Observable} from 'rxjs';
import {normalize, Schema, arrayOf} from 'normalizr';
import {
  loginConstant,
  SET_FIRST_TIME_USER,
  REMOVE_FIRST_TIME_USER
} from './constants';
import alertify from 'alertifyjs';
import intercomSetup from '../../chat';

export const fetchPerson = action$ =>
  action$.ofType(loginConstant.REQUEST)
  .switchMap(_ =>
    api.get('/users/me')
    .then(response => response.data)
    // .catch(error => Observable.of({type: loginConstant.REQUEST_FAIL, message: error}))
    )
  .takeUntil(action$.ofType(loginConstant.CANCELLED))
  .map(person => ({type: loginConstant.RECEIVE, person}));

export const setupThirdparty = (action$, store) =>
  action$.ofType(loginConstant.RECEIVE)
  .switchMap(({person}) => {
    intercomSetup({
      app_id: process.env.NODE_ENV === 'development' ? 'eh8247hf' : 'ur8dbk9e',
      email: person.email,
      name: `${person.firstname} ${person.lastname}`,
      custom_launcher_selector: '#custom_intercom_launcher',
      user_id: person.id
    });
    if (process.env.NODE_ENV === 'production') {
      Raven.config('https://c6c781f538ef4b6a952dc0ad3335cf61@sentry.io/100317').install();
      Raven.setUserContext({email: person.email, id: person.id});
      delighted.survey({email: person.email, name: `${person.firstname} ${person.lastname}`});
      mixpanel.people.set({email: person.email, name: `${person.firstname} ${person.lastname}`});
      mixpanel.identify(person.id);
    }
    return Observable.of({type: 'SETUP_THIRDPARTY_SERVICES'});
  })
