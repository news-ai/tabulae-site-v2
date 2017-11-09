// helper function to add extra tableOnly columns like index, selected, etc.
import find from 'lodash/find';
import moment from 'moment-timezone';
const FORMAT = 'ddd, MMM Do Y, hh:mm A';
const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

function divide(numerator, denomenator, fixedTo) {
  const res = Math.round(numerator * (1 / fixedTo) / denomenator) / (1 / fixedTo);
  if (!isNaN(res)) return res;
}

export function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const TIMEZONE = moment.tz.guess(TIMEZONE);

export function transformTypeValue(type, value) {
  if (!value || value === null) return value;
  switch (type) {
    case 'Date':
      const m = moment(value);
      if (!m.isValid()) return value;
      const date = m.tz(TIMEZONE).fromNow();
      return date;
    default:
      return value;
  }
}

// returns contact value for certain fieldObj
export function _getter(contact, fieldObj) {
  try {
    if (fieldObj.customfield) {
      if (fieldObj.readonly) return transformTypeValue(fieldObj.type, contact[fieldObj.value]);
      if (contact.customfields === null) return undefined;
      else if (!contact.customfields.some(obj => obj.name === fieldObj.value)) return undefined;
      else return transformTypeValue(fieldObj.type, find(contact.customfields, obj => obj.name === fieldObj.value).value);
    } else {
      if (fieldObj.strategy) return fieldObj.strategy(contact);
      else return contact[fieldObj.value];
    }
  } catch (e) {
    return undefined;
  }
}

function instagramLikesToPosts(listData) {
  const likesColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramlikes' && !fieldObj.hidden);
  const postsColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramposts' && !fieldObj.hidden);
  if (likesColumn && postsColumn) {
    return {
      name: 'likes-to-posts',
      value: 'likes_to_posts',
      hidden: false,
      tableOnly: true,
      hideCheckbox: true,
      customfield: false,
      sortEnabled: true,
      description: 'Auto-generated when likes and posts are visible',
      strategy: contact =>
      contact.instagramlikes &&
      contact.instagramposts &&
      divide(contact.instagramlikes, contact.instagramposts, 0.001)
    };
  }
}

function instagramLikesToComments(listData) {
  const likesColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramlikes' && !fieldObj.hidden);
  const commentsColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramcomments' && !fieldObj.hidden);
  if (likesColumn && commentsColumn) {
    return {
      name: 'likes-to-comments',
      value: 'likes_to_comments',
      hidden: false,
      tableOnly: true,
      hideCheckbox: true,
      customfield: false,
      sortEnabled: true,
      description: 'Auto-generated when likes and comments are visible',
      strategy: contact =>
      contact.instagramlikes &&
      contact.instagramcomments &&
      divide(contact.instagramlikes, contact.instagramcomments, 0.001)
    };
  }
}

function instagramLikesToFollowers(listData) {
  const likesColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramlikes' && !fieldObj.hidden);
  const followersColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramfollowers' && !fieldObj.hidden);
  if (likesColumn && followersColumn) {
    return {
      name: 'likes-to-followers',
      value: 'likes_to_followers',
      hidden: false,
      tableOnly: true,
      hideCheckbox: true,
      customfield: false,
      sortEnabled: true,
      description: 'Auto-generated when likes and followers are visible',
      strategy: contact =>
      contact.instagramlikes &&
      contact.instagramfollowers &&
      divide(contact.instagramlikes, contact.instagramfollowers, 0.001)
    };
  }
}

function instagramCommentsToFollowers(listData) {
  const commentsColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramcomments' && !fieldObj.hidden);
  const followersColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramfollowers' && !fieldObj.hidden);
  if (commentsColumn && followersColumn) {
    return {
      name: 'comments-to-followers',
      value: 'comments_to_followers',
      hidden: false,
      tableOnly: true,
      hideCheckbox: true,
      customfield: false,
      sortEnabled: true,
      description: 'Auto-generated when comments and followers are visible',
      strategy: contact =>
      contact.instagramcomments &&
      contact.instagramlikes &&
      divide(contact.instagramcomments, contact.instagramlikes, 0.001)
    };
  }
}

function instagramCommentsToPosts(listData) {
  const commentsColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramcomments' && !fieldObj.hidden);
  const postsColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramposts' && !fieldObj.hidden);
  if (commentsColumn && postsColumn) {
    return {
      name: 'comments-to-posts',
      value: 'comments_to_posts',
      hidden: false,
      tableOnly: true,
      hideCheckbox: true,
      customfield: false,
      sortEnabled: true,
      description: 'Auto-generated when comments and followers are visible',
      strategy: contact =>
      contact.instagramcomments &&
      contact.instagramposts &&
      divide(contact.instagramcomments, contact.instagramposts, 0.001)
    };
  }
}

export function reformatFieldsmap(fieldsmap) {
  const formattedMap = fieldsmap
  .filter(fieldObj => !fieldObj.tableOnly)
  .map(fieldObj => {
    switch (fieldObj.value) {
      case 'publication_name_1':
        return {
          name: 'Employers',
          value: 'employers',
          hidden: fieldObj.hidden,
          customfield: fieldObj.customfield
        };
      default:
        return {
          name: fieldObj.name,
          value: fieldObj.value,
          hidden: fieldObj.hidden,
          customfield: fieldObj.customfield
        };
    }
  });
  return formattedMap;
}

export function transformFieldsmap(fieldsmap) {
  return fieldsmap.map(fieldObj => {
    switch (fieldObj.value) {
      case 'employers':
        return {
          customfield: false,
          name: 'Publication',
          value: 'publication_name_1',
          hidden: find(fieldsmap, fObj => fObj.value === 'employers').hidden,
          sortEnabled: true,
          hideCheckbox: false,
          checkboxStrategy: (fMap, checked) => fMap.map(fObj => {
            if (fObj.value === 'publication_name_1' || fObj.value === 'employers') {
              return Object.assign({}, fObj, {hidden: checked});
            }
            return fObj;
          }),
          strategy: contact => contact.publication_name_1
        };
      case 'tags':
        return {
          customfield: false,
          name: 'Tags',
          value: 'tags',
          hidden: find(fieldsmap, fObj => fObj.value === 'tags').hidden,
          sortEnabled: false,
          hideCheckbox: false,
          checkboxStrategy: (fMap, checked) => fMap.map(fObj => {
            if (fObj.value === 'tags') {
              return Object.assign({}, fObj, {hidden: checked});
            }
            return fObj;
          }),
          strategy: contact => contact.tags === null ? [] : contact.tags
        };
      // case 'pastemployers':
      //   return {
      //     customfield: false,
      //     name: 'Past Publication',
      //     value: 'past_publication_name_1',
      //     hidden: find(fieldsmap, fObj => fObj.value === 'pastemployers').hidden,
      //     sortEnabled: true,
      //     hideCheckbox: false,
      //     checkboxStrategy: (fMap, checked) => fMap.map(fObj => {
      //       if (fObj.value === 'past_publication_name_1' || fObj.value === 'pastemployers') {
      //         return Object.assign({}, fObj, {hidden: checked});
      //       }
      //       return fObj;
      //     }),
      //     strategy: contact => contact.past_publication_name_1
      //   };
      default:
        return fieldObj;
    }
  });
}

export function generateTableFieldsmap(listData) {
  const replacedNameMap = transformFieldsmap(listData.fieldsmap);
  const fieldsmap = [
    {
      name: '#',
      hidden: false,
      value: 'index',
      customfield: false,
      tableOnly: true,
      hideCheckbox: true,
    },
    {
      name: 'Profile',
      hidden: false,
      value: 'profile',
      customfield: false,
      tableOnly: true,
      hideCheckbox: true,
    },
    {
      name: 'Selected',
      hidden: false,
      value: 'selected',
      customfield: false,
      tableOnly: true,
      hideCheckbox: true,
    },
    // HIDE THIS PART AFTER
    // {
    //   name: 'Tags',
    //   hidden: false,
    //   value: 'tags',
    //   customfield: false,
    //   tableOnly: false,
    //   hideCheckbox: true,
    // },
    ...replacedNameMap.map(fieldObj => Object.assign({}, fieldObj, {sortEnabled: true})),
    instagramLikesToComments(listData),
    instagramLikesToPosts(listData),
    instagramCommentsToPosts(listData),
    instagramLikesToFollowers(listData),
    instagramCommentsToFollowers(listData),
  ];
  return fieldsmap.filter(fieldObj => fieldObj);
}


export function measureSpanSize(txt, font) {
  const element = document.createElement('canvas');
  const context = element.getContext('2d');
  context.font = font;
  var tsize = {
    width: context.measureText(txt).width + 23,
    height: parseInt(context.font, 10)
  };
  return tsize;
}

export function escapeHtml(unsafe) {
  return unsafe
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/'/g, '&quot;')
  .replace(/'/g, '&#039;');
}

export function convertToCsvString(contacts, fieldsmap) {
  // let base = 'data:text/csv;charset=utf-8,';
  let base = '';
  const filteredfieldsmap = fieldsmap
  .filter(fieldObj => !fieldObj.hidden && !fieldObj.tableOnly);
  base += filteredfieldsmap.map(fieldObj => fieldObj.name).toString() + '\n';
  contacts.map(contact => {
    let rowStringArray = [];
    filteredfieldsmap.map(fieldObj => {
      let el;
      if (fieldObj.customfield && contact.customfields !== null) {
        if (contact.customfields.some(obj => obj.name === fieldObj.value)) el = find(contact.customfields, obj => obj.name === fieldObj.value).value;
        else el = '';
      } else {
        el = contact[fieldObj.value];
      }
      if (typeof el === 'string') {
        if (el.split(',').length > 1) rowStringArray.push('\'' + escapeHtml(el) + '\'');
        else rowStringArray.push(escapeHtml(el));
      } else {
        rowStringArray.push('');
      }
    });
    base += rowStringArray.toString() + '\n';
  });
  return base;
}

export function exportOperations(contacts, fieldsmap, filename) {
  const csvString = convertToCsvString(contacts, fieldsmap);
  var blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement('a');
    if (link.download !== undefined) { // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
