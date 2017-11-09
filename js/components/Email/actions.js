import {
  RECEIVE_STAGED_EMAILS,
  SENDING_STAGED_EMAILS,
  RECEIVE_EMAIL,
  REQUEST_MULTIPLE_EMAILS,
  RECEIVE_MULTIPLE_EMAILS,
  EMAIL_SET_OFFSET,
  FETCH_EMAIL_LOGS,
  FETCH_EMAIL_LOGS_FAIL,
  RECEIVE_EMAIL_LOGS,
  STAGING_EMAILS_FAIL,
  REQUEST_QUERY_EMAILS,
  RECEIVE_QUERY_EMAILS
} from './constants';
import {normalize, Schema, arrayOf} from 'normalizr';
import * as api from 'actions/api';
import isEmpty from 'lodash/isEmpty';

const emailSchema = new Schema('emails');
const contactSchema = new Schema('contacts');
import {actions as contactActions} from 'components/Contacts';

export function archiveEmail(emailId) {
  return dispatch => {
    dispatch({type: 'ARCHIVE_EMAIL', emailId});
    return api.get(`/emails/${emailId}/archive`)
    .then(response => {
      const res = normalize(response, {data: emailSchema});
      return dispatch({type: RECEIVE_EMAIL, email: res.entities.emails, id: res.result.data});
    });
  };
}

export function cancelScheduledEmail(id) {
  return (dispatch, getState) => {
    dispatch({type: 'CANCEL_SCHEDULED_EMAIL', id});
    return api.get(`/emails/${id}/cancel`)
    .then(response => {
      const res = normalize(response.data, emailSchema);
      dispatch({type: RECEIVE_EMAIL, email: res.entities.emails, id: res.result});
    })
    .catch(err => dispatch({type: 'CANCEL_SCHEDULED_EMAIL_FAIL', err}));
  };
}

export function cancelAllScheduledEmails() {
  return (dispatch, getState) => {
    dispatch({type: 'CANCEL_SCHEDULED_EMAILS'});
    return api.get(`/emails/cancelscheduled`)
    .then(response => {
      dispatch({type: 'CANCEL_SCHEDULED_EMAILS_FINISHED'});
      const res = normalize(response, {data: arrayOf(emailSchema)});
      return dispatch({
        type: RECEIVE_MULTIPLE_EMAILS,
        emails: res.entities.emails,
        ids: res.result.data,
      });
    })
    .catch(err => dispatch({type: 'CANCEL_SCHEDULED_EMAIL_FAIL', err}));
  };
}

function chunkPostPromises(values, func, limit) {
  const LIMIT = limit || 70;
  let promises = [];
  if (values.length > limit) {
    let r = LIMIT;
    let l = 0;
    while (r < values.length) {
      promises.push(func(values.slice(l, r)));
      l += LIMIT;
      r += LIMIT;
    }
    promises.push(func(values.slice(l, values.length)));
  } else {
    promises.push(func(values));
  }
  return promises;
}

export function bulkSendStagingEmails(emails) {
  return dispatch => {
    dispatch({type: SENDING_STAGED_EMAILS, emails});
    const sendStagingPostRequest = s => {
      dispatch({type: 'SENDING_LIMITED_STAGING_EMAILS', emails: s});
      return api.post(`/emails`, s);
    };
    const promises = chunkPostPromises(emails, sendStagingPostRequest, 70);
    return Promise.all(promises)
    .then(responses => {
      // flatten responses into one response
      let data = [];
      responses.map(response => response.data.map(email => data.push(email)));
      const response = {data};
      const res = normalize(response, {data: arrayOf(emailSchema)});
      return dispatch({
        type: RECEIVE_STAGED_EMAILS,
        emails: res.entities.emails,
        ids: res.result.data,
        previewEmails: response.data
      });
    })
    .catch(err => {
      dispatch({type: STAGING_EMAILS_FAIL, message: err.message});
    });
  };
}

export function postBatchEmailsWithAttachments(emails) {
  return (dispatch, getState) => {
    // function to be chunked
    const sendStagingPostRequest = s => {
      dispatch({type: 'SENDING_LIMITED_STAGING_EMAILS', emails: s});
      return api.post(`/emails`, s);
    };

    const files = getState().emailAttachmentReducer.attached;
    let data = new FormData();
    files.map(file => data.append('file', file, file.name));
    // send attachments first
    return api.postFile(`/emails/bulkattach`, data)
    .then(
      response => response.data.map(file => file.id),
      err => {
        dispatch({type: 'ATTACHED_EMAIL_FILES_FAIL', message: err.message});
        throw new Error('Cannot attach files at the moment.');
        return 'Cannot attach files at the moment.';
      })
    .then(fileIds => {
      // send emails next with attached files
      dispatch({type: SENDING_STAGED_EMAILS, emails});
      if (!fileIds) return; // ATTACH FAILED HANDLE CASE
      const emailsWithAttachments = emails.map(email => {
        email.attachments = fileIds;
        return email;
      });
      const promises = chunkPostPromises(emailsWithAttachments, sendStagingPostRequest, 70);
      return Promise.all(promises)
        .then(
          responses => {
          // Promise.all returns multiple chunked responses, flatten to be normalized
            let data = [];
            responses.map(response => response.data.map(email => data.push(email)));
            const response = {data};
            const res = normalize(response, {data: arrayOf(emailSchema)});
            const ids = res.result.data;
            dispatch({type: 'ALL_EMAIL_ATTACHMENTS_FINISHED'});
            return dispatch({
              type: RECEIVE_STAGED_EMAILS,
              emails: res.entities.emails,
              ids,
              previewEmails: response.data
            });
          }
        )
        .catch(err => {
          dispatch({type: STAGING_EMAILS_FAIL, message: err.message});
        });
    });
  };
}

export function sendEmail(id) {
  return dispatch => {
    dispatch({type: 'SEND_EMAIL', id});
    return api.get(`/emails/${id}/send`)
    .then(response => {
      const res = normalize(response.data, emailSchema);
      dispatch({type: RECEIVE_EMAIL, email: res.entities.emails, id: res.result});
    })
    .catch(message => dispatch({type: 'SEND_EMAILS_FAIL', message}));
  };
}

export function sendLimitedEmails(emailids) {
  return dispatch => {
    dispatch({type: 'SEND_EMAIL', emailids});
    return api.post(`/emails/bulksend`, {emailids})
    .then(response => {
      const res = normalize(response, {data: arrayOf(emailSchema)});
      return dispatch({
        type: 'RECEIVE_MULTIPLE_EMAILS_MANUAL',
        emails: res.entities.emails,
        ids: res.result.data
      });
    })
    .catch(message => dispatch({type: 'SEND_EMAILS_FAIL', message}));
  };
}

export function bulkSendEmails(emailids) {
  return dispatch => {
    dispatch({type: 'START_BULK_SEND_EMAILS', emailids});
    dispatch({type: 'STAGING_MANUALLY_SET_ISRECEIVING_ON'});
    const generatePostRequests = ids => dispatch(sendLimitedEmails(ids));
    const promises = chunkPostPromises(emailids, generatePostRequests, 70);
    return Promise.all(promises).then(_ => {
      dispatch({type: 'FINISHED_BULK_SEND_EMAILS'});
      dispatch({type: 'STAGING_MANUALLY_SET_ISRECEIVING_OFF'});
    });
  };
}

export function patchEmail(id, emailBody) {
  return dispatch => {
    dispatch({type: 'PATCH_EMAIL', id, emailBody});
    return api.patch(`/emails/${id}`, emailBody)
    .then(response => {
      const res = normalize(response.data, emailSchema);
      return dispatch({type: RECEIVE_EMAIL, email: res.entities.emails, id: res.result});
    });
  };
}

export function getStagedEmails() {
  return dispatch => {
    return api.get(`/emails`)
    .then(response => {
      const json = response.data.filter( email => !email.issent);
      return dispatch({type: RECEIVE_STAGED_EMAILS, json});
    })
    .catch(message => dispatch({type: 'STAGING_EMAILS_FAIL', message}));
  };
}

export function fetchLogs(emailId) {
  return (dispatch, getState) => {
    if (!getState().stagingReducer[emailId]) return;
    dispatch({type: FETCH_EMAIL_LOGS, emailId});
    return api.get(`/emails/${emailId}/logs`)
    .then(response => {
      const logs = response.data;
      const links = logs.reduce((a, b) => {
        if (b.Type === 'click' && b.Link) {
          a[b.Link] = a[b.Link] ? a[b.Link] + 1 : 1;
        }
        return a;
      }, {});
      return dispatch({
        type: RECEIVE_EMAIL_LOGS,
        logs,
        emailId,
        links: isEmpty(links) ? undefined : links,
      });
    })
    .catch(err => dispatch({type: FETCH_EMAIL_LOGS_FAIL, err}));
  };
}

export function fetchSentEmails() {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const OFFSET = getState().stagingReducer.offset;
    if (OFFSET === null || getState().stagingReducer.isReceiving) return;
    dispatch({type: REQUEST_MULTIPLE_EMAILS});
    return api.get(`/emails/sent?limit=${PAGE_LIMIT}&offset=${OFFSET}&order=-Created`)
    .then(response => {
      const contactOnly = response.included.filter(item => item.type === 'contacts');
      response.contacts = contactOnly;
      const res = normalize(response, {
        data: arrayOf(emailSchema),
        contacts: arrayOf(contactSchema)
      });
      dispatch(contactActions.receiveContacts(res.entities.contacts, res.result.contacts));
      let newOffset = OFFSET + PAGE_LIMIT;
      if (response.data.length < PAGE_LIMIT) newOffset = null;
      dispatch({type: EMAIL_SET_OFFSET, offset: newOffset});
      return dispatch({
        type: RECEIVE_MULTIPLE_EMAILS,
        emails: res.entities.emails,
        ids: res.result.data
      });
    })
    .catch(message => dispatch({type: 'GET_SENT_EMAILS_FAIL', message}));
  };
}

export function fetchLimitedSentEmails({offset, limit, accumulator, threshold}) {
  console.log('fetch limited');
  return dispatch => {
    dispatch({type: REQUEST_MULTIPLE_EMAILS});
    return api.get(`/emails/sent?limit=${limit}&offset=${offset}&order=-Created`)
    .then(
      response => {
        const contactOnly = response.included.filter(item => item.type === 'contacts');
        response.contacts = contactOnly;
        const res = normalize(response, {
          data: arrayOf(emailSchema),
          contacts: arrayOf(contactSchema)
        });
        dispatch(contactActions.receiveContacts(res.entities.contacts, res.result.contacts));
        dispatch({
          type: RECEIVE_MULTIPLE_EMAILS,
          emails: res.entities.emails,
          ids: res.result.data,
        });

        let newOffset = offset + limit;
        if (response.data.length < limit) newOffset = null;
        dispatch({type: EMAIL_SET_OFFSET, offset: newOffset});

        const newAccumulator = [...accumulator, ...res.result.data];
        if (response.data.length === limit && offset + limit < threshold && newOffset !== null) {
          // recurse call if not yet hit threshold
          return dispatch(fetchLimitedSentEmails({offset: newOffset, limit, accumulator: newAccumulator, threshold}));
        } else {
          return Promise.resolve({data: newAccumulator, hitThreshold: offset + limit >= threshold});
        }
      },
      error => dispatch({type: 'GET_SENT_EMAILS_FAIL', message: error.message})
      );
  };
}

export function fetchSentThresholdEmails() {
  console.log('fetch threshold emails');
  const THRESHOLD_SIZE = 150;
  const LIMIT_SIZE = 50;
  return (dispatch, getState) => {
    const offset = getState().stagingReducer.offset;
    // console.log(offset);
    if (offset === null || getState().stagingReducer.isReceiving) return;
    dispatch({type: REQUEST_MULTIPLE_EMAILS});
    const limit = LIMIT_SIZE;
    const threshold = offset + THRESHOLD_SIZE;
    const accumulator = [];
    return dispatch(fetchLimitedSentEmails({offset, limit, accumulator, threshold}))
    .then(
      ({data, hitThreshold}) => {
        // console.log(data);
        // console.log(hitThreshold);
        return data;
      },
      error => dispatch({type: 'GET_SENT_EMAILS_FAIL', message: error.message})
    );
  };
}

export function fetchArchivedEmails() {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const OFFSET = getState().stagingReducer.archivedOffset;
    if (OFFSET === null || getState().stagingReducer.isReceiving) return;
    dispatch({type: 'FETCH_ARCHIVED_EMAILS'});
    dispatch({type: REQUEST_MULTIPLE_EMAILS});
    return api.get(`/emails/archived?limit=${PAGE_LIMIT}&offset=${OFFSET}&order=-Created`)
    .then(response => {
      const contactOnly = response.included.filter(item => item.type === 'contacts');
      response.contacts = contactOnly;
      const res = normalize(response, {
        data: arrayOf(emailSchema),
        contacts: arrayOf(contactSchema)
      });
      dispatch(contactActions.receiveContacts(res.entities.contacts, res.result.contacts));
      let newOffset = OFFSET + PAGE_LIMIT;
      if (response.data.length < PAGE_LIMIT) newOffset = null;
      dispatch({type: EMAIL_SET_OFFSET, archivedOffset: newOffset});
      return dispatch({
        type: RECEIVE_MULTIPLE_EMAILS,
        emails: res.entities.emails,
        ids: res.result.data
      });
    })
    .catch(message => dispatch({type: 'GET_SENT_EMAILS_FAIL', message}));
  };
}

export function fetchScheduledEmails() {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const OFFSET = getState().stagingReducer.scheduledOffset;
    if (OFFSET === null || getState().stagingReducer.isReceiving) return;
    dispatch({type: REQUEST_MULTIPLE_EMAILS});
    return api.get(`/emails/scheduled?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      const contactOnly = response.included.filter(item => item.type === 'contacts');
      response.contacts = contactOnly;
      const res = normalize(response, {
        data: arrayOf(emailSchema),
        contacts: arrayOf(contactSchema)
      });
      dispatch(contactActions.receiveContacts(res.entities.contacts, res.result.contacts));
      let newOffset = OFFSET + PAGE_LIMIT;
      if (response.data.length < PAGE_LIMIT) newOffset = null;
      dispatch({type: EMAIL_SET_OFFSET, scheduledOffset: newOffset});
      dispatch({type: 'RECEIVE_SCHEDULED_EMAILS_TOTAL', total: response.summary.total});
      return dispatch({
        type: RECEIVE_MULTIPLE_EMAILS,
        emails: res.entities.emails,
        ids: res.result.data,
      });
    })
    .catch(message => dispatch({type: 'GET_SENT_EMAILS_FAIL', message}));
  };
}

export function fetchListEmails(listId) {
  const PAGE_LIMIT = 20;
  return (dispatch, getState) => {
    let OFFSET = getState().stagingReducer.listOffsets[listId];
    const isReceiving = getState().stagingReducer.isReceiving;
    if (OFFSET === null || isReceiving) return;
    if (!OFFSET) OFFSET = 0;
    dispatch({type: REQUEST_MULTIPLE_EMAILS, listId});
    return api.get(`/lists/${listId}/emails?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      const res = normalize(response, {data: arrayOf(emailSchema)});
      return dispatch({
        type: RECEIVE_MULTIPLE_EMAILS,
        emails: res.entities.emails,
        ids: res.result.data,
        listId,
        offset: res.result.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT
      });
    })
    .catch(message => dispatch({type: 'GET_SENT_EMAILS_FAIL', message}));
  };
}

export function fetchSearchSentEmails(queryString) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    let OFFSET = 0;
    const isReceiving = getState().stagingReducer.isReceiving;
    if (OFFSET === null || isReceiving) return;
    if (!OFFSET) OFFSET = 0;
    dispatch({type: REQUEST_MULTIPLE_EMAILS, query: queryString});
    return api.get(`/emails/search?q="${queryString}"`)
    .then(response => {
      const contactOnly = response.included.filter(item => item.type === 'contacts');
      response.contacts = contactOnly;
      const res = normalize(response, {
        data: arrayOf(emailSchema),
        contacts: arrayOf(contactSchema)
      });
      dispatch(contactActions.receiveContacts(res.entities.contacts, res.result.contacts));
      dispatch({
        type: RECEIVE_MULTIPLE_EMAILS,
        emails: res.entities.emails,
        ids: res.result.data,
      });
      return dispatch({type: 'RECEIVE_SEARCH_SENT_EMAILS', ids: res.result.data, query: queryString});
    })
    .catch(message => dispatch({type: 'GET_SENT_EMAILS_FAIL', message}));
  };
}

export function fetchContactEmails(contactId) {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    let OFFSET = getState().stagingReducer.contactOffsets[contactId];
    const isReceiving = getState().stagingReducer.isReceiving;
    if (OFFSET === null || isReceiving) return Promise.resolve();
    if (!OFFSET) OFFSET = 0;
    dispatch({type: REQUEST_MULTIPLE_EMAILS}, contactId);
    return api.get(`/contacts/${contactId}/emails?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(response => {
      const res = normalize(response, {data: arrayOf(emailSchema)});
      return dispatch({
        type: RECEIVE_MULTIPLE_EMAILS,
        emails: res.entities.emails,
        ids: res.result.data,
        contactId,
        offset: res.result.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT
      });
    })
    .catch(message => dispatch({type: 'GET_SENT_EMAILS_FAIL', message}));
  };
}

export function fetchLimitedSpecificDayEmails(day, offset, limit, accumulator, threshold) {
  // day format: YYYY-MM-DD
  return dispatch => {
    dispatch({type: 'REQUEST_LIMITED_SPECIFIC_DAY_SENT_EMAILS', day, offset, limit});
    return api.get(`/emails/search?q=date:${day}&limit=${limit}&offset=${offset}`)
    .then(
      response => {
        const contactOnly = response.included.filter(item => item.type === 'contacts');
        response.contacts = contactOnly;
        const res = normalize(response, {
          data: arrayOf(emailSchema),
          contacts: arrayOf(contactSchema)
        });
        dispatch(contactActions.receiveContacts(res.entities.contacts, res.result.contacts));
        dispatch({
          type: RECEIVE_MULTIPLE_EMAILS,
          emails: res.entities.emails,
          ids: res.result.data,
        });

        const newAccumulator = [...accumulator, ...res.result.data];
        if (response.data.length === limit && offset + limit < threshold) {
          // recurse call if not yet hit threshold
          return dispatch(fetchLimitedSpecificDayEmails(day, offset + limit, limit, newAccumulator, threshold));
        } else {
          return Promise.resolve({data: newAccumulator, hitThreshold: offset + limit >= threshold});
        }
      },
      error => dispatch({type: 'REQUEST_SPECIFIC_DAY_SENT_EMAILS_FAIL', message: error.message})
      );
  };
}

// threshold must always be larger than limit
// threshold is the number of emails that can be recursely fetched at a time
// to prevent fetching 1000s of emails at once and slow down UI

export function fetchSpecificDayEmails(day) {
  const THRESHOLD_SIZE = 300;
  const LIMIT_SIZE = 50;
  return (dispatch, getState) => {
    dispatch({type: 'REQUEST_SPECIFIC_DAY_SENT_EMAILS', day});
    const limit = LIMIT_SIZE;
    const emailStats = getState().emailStatsReducer[day];
    const offset = emailStats && emailStats.received ? emailStats.received.length : 0;
    const threshold = offset + THRESHOLD_SIZE;
    const acc = [];
    return dispatch(fetchLimitedSpecificDayEmails(day, offset, limit, acc, threshold))
    .then(
      ({data, hitThreshold}) => {
        // console.log(data);
        const ids = emailStats && emailStats.received ? [...emailStats.received, ...data] : data;
        dispatch({type: 'RECEIVE_SPECIFIC_DAY_EMAILS', ids, day, hitThreshold});
        return Promise.resolve(ids.map(id => getState().stagingReducer[id]));
      },
      error => dispatch({type: 'REQUEST_SPECIFIC_DAY_SENT_EMAILS_FAIL', message: error.message})
    );
  };
}

// -------------------------------------------------
const encodeURIComponentExactlyOnce = s => {
  try {
    const s1 = decodeURIComponent(s);
    if (s === s1) return encodeURIComponent(s);
    else return encodeURIComponentExactlyOnce(s1);
  } catch (e) {
    return encodeURIComponent(s);
  }
}

function createQueryUrl(query) {
  if (query.baseSubject) query.baseSubject = encodeURIComponentExactlyOnce(query.baseSubject);
  if (query.subject) query.subject = encodeURIComponentExactlyOnce(query.subject);
  let keys = Object.keys(query);
  if (keys.some(key => key === 'subject')) {
    keys = [...keys.filter(key => key !== 'subject'), 'subject'];
  } else if (keys.some(key => key === 'baseSubject')) {
    keys = [...keys.filter(key => key !== 'baseSubject'), 'baseSubject'];
  }

  const queryString = keys
  .filter(key => query[key])
  .map(key => `${key}:${query[key]}`).join(',');
  return `/emails/search?q="${queryString}"`;
}

export function fetchLimitedQueryEmails(query, offset, limit, accumulator, threshold) {
  // day format: YYYY-MM-DD
  return dispatch => {
    dispatch({type: 'REQUEST_LIMITED_QUERY_SENT_EMAILS', query, offset, limit});
    dispatch({type: 'STAGING_MANUALLY_SET_ISRECEIVING_ON'});
    const url = createQueryUrl(query);

    return api.get(`${url}&limit=${limit}&offset=${offset}`)
    .then(
      response => {
        const contactOnly = response.included.filter(item => item.type === 'contacts');
        response.contacts = contactOnly;
        const res = normalize(response, {
          data: arrayOf(emailSchema),
          contacts: arrayOf(contactSchema)
        });
        dispatch(contactActions.receiveContacts(res.entities.contacts, res.result.contacts));
        dispatch({type: RECEIVE_MULTIPLE_EMAILS, emails: res.entities.emails, ids: res.result.data});

        const newAccumulator = [...accumulator, ...res.result.data];
        if (response.data.length === limit && offset + limit < threshold) {
          // recurse call if not yet hit threshold
          return dispatch(fetchLimitedQueryEmails(query, offset + limit, limit, newAccumulator, threshold));
        } else {
          const hitThreshold = offset + limit >= threshold;
          // console.log(hitThreshold);
          // console.log(offset);
          // console.log(limit);
          // console.log(threshold);
          dispatch({type: 'STAGING_MANUALLY_SET_ISRECEIVING_OFF'});
          return Promise.resolve({data: newAccumulator, hitThreshold: offset + limit >= threshold || response.data.length === 0, total: response.summary.total});
        }
      },
      error => {
        dispatch({type: 'STAGING_MANUALLY_SET_ISRECEIVING_OFF'});
        return dispatch({type: 'REQUEST_LIMITED_QUERY_SENT_EMAILS_FAIL', message: error.message});
      });
  };
}

export function fetchFilterQueryEmails(query) {
  const THRESHOLD_SIZE = 100;
  const LIMIT_SIZE = 50;
  return (dispatch, getState) => {
    dispatch({type: REQUEST_QUERY_EMAILS, query});
    const limit = LIMIT_SIZE;
    const received = getState().stagingReducer.filterQuery.received || [];
    const offset = received.length > 0 ? received.length : 0;
    const threshold = offset + THRESHOLD_SIZE;
    const acc = [];
    return dispatch(fetchLimitedQueryEmails(query, offset, limit, acc, threshold))
    .then(
      ({data, hitThreshold, total}) => {
        // console.log(data);
        const ids = received.length > 0 ? [...received, ...data] : data;
        dispatch({type: RECEIVE_QUERY_EMAILS, ids, query, hitThreshold, total});
        return Promise.resolve(ids.map(id => getState().stagingReducer[id]));
      },
      error => dispatch({type: 'REQUEST_QUERY_SENT_EMAILS_FAIL', message: error.message})
    );
  };
}

