import {
  templateConstant
} from './constants';
import * as api from 'actions/api';

import { normalize, Schema, arrayOf } from 'normalizr';
const templateSchema = new Schema('templates');

export function createTemplate(name, subject, body) {
  let templateBody = {};
  if (name.length > 0) templateBody.name = name;
  else templateBody.name = 'Untitled Template';
  if (subject.length > 0) templateBody.subject = subject;
  else templateBody.subject = '(No Subject)';
  if (body) templateBody.body = body;
  else templateBody.body = '';
  return dispatch => {
    dispatch({type: templateConstant.CREATE_REQUEST, templateBody});
    return api.post(`/templates`, templateBody)
    .then(response => {
      const res = normalize(response.data, templateSchema);
      dispatch({type: templateConstant.CREATE_RECEIVED, template: res.entities.templates, id: res.result});
      return res.result;
    })
    .catch(error => dispatch({type: templateConstant.REQUEST_FAIL, error: error.message}));
  };
}

export function patchTemplate(templateId, subject, body) {
  let templateBody = {};
  if (subject) templateBody.subject = subject;
  if (body) templateBody.body = body;
  return (dispatch, getState) => {
    const currTemplate = getState().templateReducer[templateId];
    if (currTemplate.name) templateBody.name = currTemplate.name;
    dispatch({type: templateConstant.REQUEST, templateId});
    return api.patch(`/templates/${templateId}`, templateBody)
    .then(response => {
      const res = normalize(response.data, templateSchema);
      return dispatch({type: templateConstant.RECEIVE, template: res.entities.templates, id: res.result});
    })
    .catch(message => dispatch({type: 'PATCH_TEMPLATE_FAIL', message}));
  };
}

export function patchTemplateName(templateId, name) {
  return (dispatch, getState) => {
    const currTemplate = getState().templateReducer[templateId];
    const templateBody = {
      name: name,
      subject: currTemplate.subject,
      body: currTemplate.body
    };
    dispatch({type: templateConstant.REQUEST, templateId});
    return api.patch(`/templates/${templateId}`, templateBody)
    .then(response => {
      const res = normalize(response.data, templateSchema);
      return dispatch({type: templateConstant.RECEIVE, template: res.entities.templates, id: res.result});
    })
    .catch(message => dispatch({type: 'PATCH_TEMPLATE_FAIL', message}));
  };
}

export function toggleArchiveTemplate(templateId) {
  return (dispatch, getState) => {
    const template = getState().templateReducer[templateId];
    template.archived = !template.archived;
    dispatch({type: 'TEMPLATE_TOGGLE_ARCHIVE', templateId});
    return api.patch(`/templates/${templateId}`, template)
    .then(response => {
      const res = normalize(response.data, templateSchema);
      return dispatch({type: templateConstant.RECEIVE, template: res.entities.templates, id: res.result});
    })
    .catch(message => dispatch({type: 'PATCH_TEMPLATE_FAIL', message}));
  };
}

export function getTemplates() {
  const PAGE_LIMIT = 50;
  return (dispatch, getState) => {
    const OFFSET = getState().templateReducer.offset;
    if (OFFSET === null || getState().templateReducer.isReceiving) return;
    dispatch({type: templateConstant.REQUEST_MULTIPLE});
    return api.get(`/templates?limit=${PAGE_LIMIT}&offset=${OFFSET}&order=-Updated`)
    .then(response => {
      const res = normalize(response, {data: arrayOf(templateSchema)});
      const newOffset = response.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT;
      return dispatch({
        type: templateConstant.RECEIVE_MULTIPLE,
        templates: res.entities.templates,
        ids: res.result.data,
        offset: newOffset
      });
    })
    .catch(message => dispatch({type: templateConstant.REQUEST_MULTIPLE_FAIL, message}));
  };
}
