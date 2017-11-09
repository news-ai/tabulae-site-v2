// @flow
import template from 'lodash/template';
import sortBy from 'lodash/sortBy';
import last from 'lodash/last';
import clone from 'lodash/clone';
import indexOf from 'lodash/indexOf';
import IntervalTree from 'interval-tree2';

export default function processInlineStylesAndEntities({
  inlineTagMap,
  entityTagMap,
  entityMap,
  entityDataConversionMap,
  block,
  combinableInlineFn
}) {
  if (!block) {
    return '';
  }
  if (!block.inlineStyleRanges && !block.entityRanges) {
    // TODO: optimisation, exit early if length === 0 as well
    return block.text;
  }

  let html = block.text;
  let tagInsertMap = {};

  /*
   * ESCAPE CHARS
  */

  let escapeReplacements = [['<', '&lt;'], ['&', '&amp;']];

  escapeReplacements.forEach((arr) => {
    for (var i = 0; i < html.length; i++) {
      if (html[i] === arr[0]) {
        if (!tagInsertMap[i]) {
          tagInsertMap[i] = [];
        }
        tagInsertMap[i].push([arr[0].length, arr[1]]);
      }
    }
  });

  /*
   * INLINE STYLES
  */

  // important to process in order, so sort
  let sortedInlineStyleRanges = sortBy(block.inlineStyleRanges, 'offset');
  // process styles we don't need to combine and can just stack
  sortedInlineStyleRanges.forEach(function(range) {
    let tag = inlineTagMap[range.style];
    if (!tag) return;
    if (!tagInsertMap[range.offset]) {
      tagInsertMap[range.offset] = [];
    }

    tagInsertMap[range.offset].push(tag[0]);
    if (tag[1]) {
      if (!tagInsertMap[range.offset + range.length]) {
        tagInsertMap[range.offset + range.length] = [];
      }
      // add closing tags to start of array, otherwise tag nesting will be invalid
      tagInsertMap[range.offset + range.length].unshift(tag[1]);
    }
  });



  /*
   * FIX INVALID TAG NESTING ADJUSTMENT
   */

  var tagStack = [];

  Object.keys(tagInsertMap).forEach(key => {
    let newInsertMap = [];
    let tags = tagInsertMap[key];

    if (tagStack.length === 0) {
      tags.forEach(tag => {
        tagStack.unshift(tag);
      });
    } else {
      let iterateArray = clone(tags);
      let tagsToReopen = [];

      iterateArray.forEach(tag => {
        if (tag.constructor === Array) return;

        let isCloser = tag.substr(0, 2) === '</';
        let stackTag = tagStack[0];
        let closeMatch = isTagCloseMatch(stackTag, tag);


        if (!stackTag || closeMatch) {
          tagStack.shift();
          newInsertMap.push(tag);
        } else if (isCloser) {
          let i = tagStack.indexOf(toOpeningTag(tag));
          let earlyClosers = tagStack.splice(0, i + 1);

          // get rid of actual tag
          earlyClosers.pop();

          // close tag, add tag to reopen stack
          earlyClosers.forEach(t => {
            newInsertMap.push(toClosingTag(t));
            tagsToReopen.push(t);
          });
          newInsertMap.push(tag);
        } else {
          tagStack.unshift(tag);
          newInsertMap.push(tag);
        }
      });

      // add tags that need re-opening to insert map, then set as new insert mat
      tagInsertMap[key] = newInsertMap.concat(tagsToReopen);
    }
  });

  // process combinable inline styles into html-valid string

  // const processCombinableInlineStyles = () => {
  //   const itree = IT.IntervalTree();

  // };

  if (sortedInlineStyleRanges.length > 0) {
    // let min = Infinity; 
    // let max = -Infinity;
    const lastRange = sortedInlineStyleRanges[sortedInlineStyleRanges.length - 1];
    let itree = new IntervalTree(lastRange.offset + lastRange.length);
    sortedInlineStyleRanges.map(range => {
      let tag = combinableInlineFn(range.style);
      if (!tag) return;
      itree.add(range.offset, range.offset + range.length, `${range.style}-${Math.random().toString().slice(2, 11)}`);
    });

    let cuts = new Set();
    sortedInlineStyleRanges.map(range => {
      // ALSO ADD A WAY TO GET WHICH STYLE THE CUT IS ASSOCIATED WITH
      cuts.add(range.offset);
      cuts.add(range.offset + range.length);
    });
    const sortedCuts = Array.from(cuts).sort((a, b) => a - b);
    // console.log(sortedCuts);

    let currCut;
    let nextCut;
    for (let i = 0; i < sortedCuts.length - 1; i++) {
      currCut = sortedCuts[i];
      nextCut = sortedCuts[i + 1];
      const results = itree.search((currCut + nextCut) / 2);
      const styles = results.map(result => result.id.substring(0, result.id.length - 10));
      // only allow span to be combinable for now
      // console.log(styles);
      const styleString = styles.map(style => combinableInlineFn(style)[0]).join('');
      // console.log(styleString);
      if (!tagInsertMap[currCut]) {
        tagInsertMap[currCut] = [];
      }
      tagInsertMap[currCut].push(`<span style="${styleString}">`);

      if (!tagInsertMap[nextCut]) {
        tagInsertMap[nextCut] = [];
      }
      tagInsertMap[nextCut].unshift(`</span>`);
    }
  }

  function toOpeningTag(t) {
    return t.replace('/', '');
  }
  function toClosingTag(t) {
    if (!t) {
      return '';
    }
    return '</' + t.substr(1);
  }

  function isString(str) {
    if (typeof str === 'string') return true;
    else return false;
  }

  function isTagCloseMatch(opener, closer) {
    if (!opener || !closer || !isString(opener) || !isString(close)) {
      return false;
    }
    return opener.substr(1) === closer.substr(2);
  }

  /*
   * ENTITY RANGER
   */

  let sortedEntityRanges = sortBy(block.entityRanges, 'offset');

  sortedEntityRanges.forEach(function(range) {
    if (!range) return;
    const entity = entityMap[range.key];
    const tagObj = entityTagMap[entity.type];
    if (!tagObj) return;
    const data = entityDataConversionMap[entity.type] ? entityDataConversionMap[entity.type](entity.data) : entity.data;
    // get corresponding tags depending on available data
    const tag = tagObj.process(data);

    const compiledTag0 = template(tag[0])(data);
    const compiledTag1 = template(tag[1])(data);

    if (!tagInsertMap[range.offset]) {
      tagInsertMap[range.offset] = [];
    }
    tagInsertMap[range.offset].push(compiledTag0);

    if (tag[1]) {
      if (!tagInsertMap[range.offset + range.length]) {
        tagInsertMap[range.offset + range.length] = [];
      }
      // add closing tags to start of array, otherwise tag nesting will be invalid
      tagInsertMap[range.offset + range.length].unshift(compiledTag1);
    }
  });

  /*
   * GENERATE OUTPUT
  */

  // sort on position, as we'll need to keep track of offset
  let orderedKeys = Object.keys(tagInsertMap).sort(function(a, b) {
    a = Number(a);
    b = Number(b);
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  });

  // insert tags into string, keep track of offset caused by our text insertions
  let offset = 0;
  orderedKeys.forEach(function(pos) {
    let index = Number(pos);

    tagInsertMap[pos].forEach(function(tag) {

      if (typeof tag === 'string') {
        html = html.substr(0, offset + index) +
        tag +
        html.substr(offset + index);
        offset += tag.length;
      } else {
        let [length, replacement] = tag;
        html = html.substr(0, offset + index) +
        replacement +
        html.substr(offset + index + length);
        offset += (replacement.length - length);
      }

    });
  });

  return html;
}
