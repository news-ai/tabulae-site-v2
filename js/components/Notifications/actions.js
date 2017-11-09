import * as api from 'actions/api';
import alertify from 'alertifyjs';

import 'rxjs';
import {normalize, Schema, arrayOf} from 'normalizr';

import 'node_modules/alertifyjs/build/css/alertify.min.css';
alertify.set('notifier', 'position', 'top-right');


// export const socket = io('https://live-1.newsai.org:443');
// export function setupNotificationSocket() {
//   return (dispatch, getState) => {
//     dispatch({type: 'REQUEST_SOCKET_TOKEN'});
//     socket.on('connect', _ => {
//       api.get('/users/me/live-token')
//       .then(response => {
//         const token = response.data.token;
//         const person = getState().personReducer.person;
//         const authDetails = {
//           userId: person.id,
//           authToken: token,
//           teamId: person.teamid,
//           page: window.TABULAE_HOME
//         };
//         dispatch({type: 'CONNECTED_TO_SOCKET'});
//         socket.emit('auth', authDetails);
//       })
//       .catch(err => dispatch({type: 'REQUEST_SOCKET_TOKEN_FAIL'}));
//     });

//     socket.on('message', msg => {
//       if (msg.type === 'auth') {
//         if (msg.status === 'failure') {
//           // TODO: dispatch action to handle socket failure
//           console.log('Failed to authenticate');
//         } else {
//           // if need to emit auth stuff based on failure, do it here

//         }
//       } else {
//         // console.log(msg);
//         msg.map(message => {
//           dispatch({type: 'RECEIVE_NOTIFICATION', message})
//           // alertify.notify(data, 'custom', 5, function() {});
//         });
//       }
//     });

//     socket.on('disconnect', function() {
//       // Re-authenticate
//       console.log('disconnected:', socket.connected);
//     });
//   }
// }
