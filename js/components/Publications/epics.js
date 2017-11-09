import * as api from 'actions/api';
// import 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';
import {normalize, Schema, arrayOf} from 'normalizr';
import {publicationConstant} from './constants';
const publicationSchema = new Schema('publications');

export const searchPublicationsEpic = action$ =>
  action$.ofType('SEARCH_PUBLICATION_REQUEST')
  .map(action => action.query)
  .filter(q => !!q)
  // .debounceTime(750)
  .switchMap(q =>
     api.get(`/publications?q="${q}"`)
    .then(response => normalize(response, {data: arrayOf(publicationSchema)})))
  .flatMap(res => {
    return [
        {
          type: publicationConstant.RECEIVE_MULTIPLE,
          publications: res.entities.publications,
          ids: res.result.data
        },
        {
          type: 'SEARCH_PUBLICATION_RECEIVE',
          received: res.result.data
        }
    ];
  });
