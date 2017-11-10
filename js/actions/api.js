import fetch from 'isomorphic-fetch';

// issue #3: need to add slash to end of every endpoint in API v2 because of Django
const addSlashToEndpoint = endpoint => endpoint.charAt(endpoint.length-1) === '/' ? endpoint : `${endpoint}/`;

export const get = (endpoint, bypassAddSlash=false) =>
  fetch(`${window.TABULAE_API_BASE}${bypassAddSlash ? endpoint : addSlashToEndpoint(endpoint)}`, {method: 'GET', credentials: 'include'})
  .then(response => response.status === 200 ? response.text() : Promise.reject(response))
  .then(text => JSON.parse(text));

const buildQuery = ({endpoint, query}) => Object.keys(query)
.reduce(
  (url, key, i) => `${url}${i > 0 ? '&' : ''}${key}=${query[key]}`,
  `${addSlashToEndpoint(endpoint)}?`
  );

export const getQuery = ({endpoint, query}) =>
  fetch(`${window.TABULAE_API_BASE}${buildQuery({endpoint, query})}`, {method: 'GET', credentials: 'include'})
  .then(response => response.status === 200 ? response.text() : Promise.reject(response))
  .then(text => JSON.parse(text));

export const deleteRequest = endpoint =>
  fetch(`${window.TABULAE_API_BASE}${addSlashToEndpoint(endpoint)}`, {method: 'DELETE', credentials: 'include'})
  .then(response => response.status === 200 ? response.text() : Promise.reject(response))
  .then(text => JSON.parse(text));

export const post = (endpoint, body) =>
  fetch(`${window.TABULAE_API_BASE}${addSlashToEndpoint(endpoint)}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(body),
  })
  .then(response => response.status === 200 || response.status === 201 ? response.text() : Promise.reject(response))
  .then(text => JSON.parse(text));

export const postFile = (endpoint, file) =>
  fetch(`${window.TABULAE_API_BASE}${addSlashToEndpoint(endpoint)}`, {
    method: 'POST',
    credentials: 'include',
    body: file,
  })
  .then(response => response.status === 200 || response.status === 201 ? response.text() : Promise.reject(response.text()))
  .then(text => JSON.parse(text));

export const patch = (endpoint, body) =>
  fetch(`${window.TABULAE_API_BASE}${addSlashToEndpoint(endpoint)}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    method: 'PATCH',
    credentials: 'include',
    body: JSON.stringify(body)
  })
  .then(response => response.status === 200 ? response.text() : Promise.reject(response))
  .then(text => JSON.parse(text));

