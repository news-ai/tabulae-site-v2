import {_getter} from 'components/ListTable/helpers';

/**
 * Based on general-purpose HTML template and outputs specific HTML email with contact info based on custom properties
 * @param  {String} html      general HTML template string
 * @param  {Object} contact   Tabulae contact
 * @param  {Array} fieldsmap  Tabulae List fieldsmap
 * @return {Object}           html: generated HTML, numPropertiesUsed: # of custom properties used, emptyFields: properties used that do not exist on List
 */
export default function replaceAll(html, contact, fieldsmap) {
  if (html === null || html.length === 0) return {html: '', numPropertiesUsed: 0, emptyFields: []};
  let newHtml = html;
  let matchCount = {};
  let emptyFields = [];
  // get total list of custom properties used
  let expectedMatches = newHtml.match(/(?:\{\{|<%=)(.+?)(?:%>|\}\})/g);
  if (expectedMatches === null) expectedMatches = [];
  let oldExpectedMatches = newHtml.match(/{([^}]+)}/g);
  if (oldExpectedMatches === null) oldExpectedMatches = [];
  expectedMatches = [...expectedMatches, ...oldExpectedMatches];

  fieldsmap.map(fieldObj => {
    const value = _getter(contact, fieldObj) || '';
    const regexValue = new RegExp('<%= ' + fieldObj.name + ' %>', 'g');
    const oldRegexValue = new RegExp('{' + fieldObj.name + '}', 'g');
    // housekeeping step for generating useful errors
    // count number of times each individual custom property is used
    const matches = newHtml.match(regexValue);
    const oldMatches = newHtml.match(oldRegexValue);
    if (matches !== null) {
      // matched but custom property used in email is not available on this List
      // track number of times each custom property is used in a dict
      if (!value) emptyFields.push(fieldObj.name);
      matchCount[fieldObj.name] = matches.length;
    }
    if (oldMatches !== null) {
      if (!value) emptyFields.push(fieldObj.name);
      matchCount[fieldObj.name] = oldMatches.length;
    }
    newHtml = newHtml.replace(regexValue, value);
    newHtml = newHtml.replace(oldRegexValue, value);
    // remove property from expected array since it has been processed
    expectedMatches = expectedMatches.filter(match => match !== `<%= ${fieldObj.name} %>` && match !== `{${fieldObj.name}}`);
  });
  const numPropertiesUsed = Object.keys(matchCount).length;
  if (numPropertiesUsed > 0) {
    // window.Intercom('trackEvent', 'num_custom_variables', {num_custom_variables: numPropertiesUsed});
    mixpanel.track('num_custom_variables', {num_custom_variables: numPropertiesUsed});
  }
  if (expectedMatches.length > 0) {
    expectedMatches = expectedMatches.map(match => {
      const newMatch = match.match(/{([^}]*)}/);
      return newMatch === null ? match : newMatch[1];
    })
    .map(match => {
      const newMatch = match.match(/(?:\{\{|<%=)(.+?)(?:%>|\}\})/);
      return newMatch === null ? match : newMatch[1];
    });
    emptyFields = [...emptyFields, ...expectedMatches];
  }
  return {html: newHtml, numPropertiesUsed, emptyFields};
}

