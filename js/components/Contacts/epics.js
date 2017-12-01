
import * as api from 'actions/api';
// import 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';
import {normalize, Schema, arrayOf} from 'normalizr';
const listSchema = new Schema('lists');

export const addContactToList = (action$, {getState}) =>
  action$.ofType('ADD_CONTACT_TO_LIST')
  .filter(action => action.contactid && action.listid)
  .switchMap(action => 
    api.post(
      `/contacts/${action.contactid}/add-to-list`,
      getState().listReducer[action.listid]
      )
    .then(response => ({
      type: 'RECEIVE_LIST',
      list: response.data
    }))
    )
  .catch(err => {
    console.log(err);
    return ({ //TODO: handle error
      type: 'ERROR_STUFF'
    })
  });

// export const searchPublicationsEpic = action$ =>
//   action$.ofType('SEARCH_PUBLICATION_REQUEST')
//   .map(action => action.query)
//   .filter(q => !!q && q.length > 0)
//   // .debounceTime(750)
//   .switchMap(q =>
//      api.getQuery({
//       endpoint: '/publications',
//       query: {search: `"${q}"`}
//      })
//     .then(response => normalize(response, {data: arrayOf(publicationSchema)})))
//   .flatMap(res => {
//     return [
//         {
//           type: publicationConstant.RECEIVE_MULTIPLE,
//           publications: res.entities.publications,
//           ids: res.result.data
//         },
//         {
//           type: 'SEARCH_PUBLICATION_RECEIVE',
//           received: res.result.data
//         }
//     ];
//   });