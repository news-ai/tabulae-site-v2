import {ContentState} from 'draft-js';

/**
 * Strip any ContentBlock with selected inlineStyle,
 * used to strip EMAIL_SIGNATURE inline style when switching emails
 * @param  {ContentState} contentState   Dirty ContentState
 * @param  {InlineStyleType} overwriteStyle Type of inlineStyle to strip from contentState
 * @return {ContentState}                Clean ContentState without selected inlineStyle blocks
 */
function stripSelectedInlineTagBlocks(contentState, overwriteStyle) {
  if (!overwriteStyle) return contentState;
  // used to strip EMAIL_SIGNATURE inline style when switching emails
  let truncatedBlocks = [];
  const blocks = contentState.getBlockMap();
  blocks.map(block => {
    let hasStyle = false;
    block.findStyleRanges(
      (character) => {
        if (character.hasStyle(overwriteStyle)) {
          if (!hasStyle) hasStyle = true;
        }
        return character.hasStyle(overwriteStyle);
      },
      (start, end) => {}
      );
    if (!hasStyle) truncatedBlocks.push(block);
  });
  // Now select all stripped blocks and insert overwriteEntityType
  return ContentState.createFromBlockArray(truncatedBlocks);
}

export default stripSelectedInlineTagBlocks;
