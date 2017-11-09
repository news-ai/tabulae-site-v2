import * as api from 'actions/api';
import alertify from 'alertifyjs';

import {loginConstant} from 'components/Login/constants';

import 'rxjs';
import {Observable} from 'rxjs';
import {normalize, Schema, arrayOf} from 'normalizr';

export let socket = io('https://live-1.newsai.org:443', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax : 5000,
  reconnectionAttempts: 99999
});

export const emitReadReceipt = action$ =>
  action$.ofType('READ_NOTIFICATIONS')
  .switchMap(() => {
    // console.log('EMIIIITTT');

    socket.emit('notification', {notification: 'read'});
    return [];
  });

export const connectToSocket = (action$, store) =>
  action$.ofType(loginConstant.RECEIVE)
  .switchMap(({person}) => Observable.create(observable => {
    console.log('connecting to socket...');
    let socketConnected = false;
    socket.on('connect', _ => {
      console.log('connect');
      socketConnected = true;
      observable.next({type: 'CONNECTED_TO_SOCKET', person})
    });
    // try connect again if unconnected
    setTimeout(_ => {
      console.log('check if connected');
      console.log(socket.connected);
      if (socket.connected) observable.next({type: 'CONNECTED_TO_SOCKET', person});
      else {
        socket = io('https://live-1.newsai.org:443', {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax : 5000,
          reconnectionAttempts: 99999
        });
        observable.error();
      }
    }, 5000);

    socket.on('message', msg => {
      if (msg.type === 'auth') {
        if (msg.status === 'success') {
          // success, do nothing

        } else if (msg.status === 'failure') {
          // TODO: dispatch action to handle socket failure
          console.log('Failed to authenticate');
          observable.next({type: 'REQUEST_SOCKET_TOKEN_ERROR'});
          observable.next({type: 'CONNECTED_TO_SOCKET'});
        } else {
          // if need to emit auth stuff based on failure, do it here
          observable.next({type: 'REQUEST_SOCKET_TOKEN_ERROR'});
          observable.next({type: 'CONNECTED_TO_SOCKET'});
        }
      } else {
        if (msg.length > 0) {
          const cleanedMsgs = msg.filter(message => !!message && !!message.data)
          observable.next({type: 'RECEIVE_NOTIFICATIONS', messages: cleanedMsgs});
        }
      }
    });
    socket.on('disconnect', function() {
      console.log('disconnected:', socket.connected);
      observable.next({type: 'CLEAR_NOTIFICATIONS'});
    });
  })
  .retryWhen(err => {
    console.log('retry 5 times if hit socket connection error');
    let retries = 0;
    return err.delay(2000)
      .map(error => {
        if (retries++ === 5) throw error;
        return error;
      });
    })
  .catch(err => Observable.of({type: 'SOCKET_CONNECTION_NO_RESPONSE', message: err}))
  );

// const mockPromise = _ => new Promise((resolve, reject) => {
//   console.log('hit promise');
//   setTimeout(_ => {
//     console.log('REJECT');
//     reject('wha');
//   }, 2000);
// })

export const socketAuth = (action$, store) =>
  action$.ofType('CONNECTED_TO_SOCKET')
  .switchMap(({person}) =>
    Observable.merge(
      Observable.of({type: 'REQUEST_SOCKET_TOKEN'}),
      Observable.fromPromise(
        api.get('/users/me/live-token')
        // mockPromise()
        )
      .map(response => {
        console.log('connect to socket auth');
        const token = response.data.token;
        const authDetails = {
          userId: person.id,
          authToken: token,
          teamId: person.teamid,
          page: window.TABULAE_HOME
        };
        socket.emit('auth', authDetails);
        return {type: 'REQUEST_SOCKET_TOKEN_SUCCESS'};
      })
      )
      .retryWhen(err => {
        console.log('retry 5 times if hit socket auth error');
        let retries = 0;
        return err.delay(5000)
          .map(error => {
            if (retries++ === 5) throw error;
            return error;
          });
        })
      .catch(err => Observable.of({type: 'REQUEST_SOCKET_TOKEN_ERROR', message: err}))
    );

