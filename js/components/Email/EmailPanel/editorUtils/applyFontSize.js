import {EditorState, SelectionState, Modifier, convertToRaw} from 'draft-js';

const applyFontSize = (editorState, selectedSize) => {
  const FONT_PREFIX = 'SIZE-';
  let contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const startKey = selection.getStartKey();
  const endKey = selection.getEndKey();
  const selectionStart = selection.getStartOffset();
  const selectionEnd = selection.getEndOffset();
  let selectedBlocks = [];
  let inBlock = false;
  editorState.getCurrentContent().getBlockMap().forEach(block => {
    if (block.getKey() === startKey) inBlock = true;
    if (inBlock) selectedBlocks.push(block);
    if (block.getKey() === endKey) inBlock = false;
  });
  selectedBlocks.map((block, i) => {
    const blockKey = block.getKey();

    // DESELECT ALL SELECTED WITH FONTSIZE
    let font = undefined;
    block.findStyleRanges(
      char => {
        const charFont = char.getStyle().toJS().filter(font => font.substring(0, FONT_PREFIX.length) === FONT_PREFIX)[0];
        font = charFont;
        if (charFont) return true;
        return false;
      },
      (styleStart, styleEnd) => {
        if (
          !(blockKey === startKey && styleEnd < selectionStart) && // first block: style range is before
          !(blockKey === endKey && styleStart > selectionEnd) // last block: style range is after
          ) {
          let start = styleStart;
          let end = styleEnd;
          if (startKey === blockKey && selectionStart > start && selectionStart < end) start = selectionStart;
          if (endKey === blockKey && selectionEnd < end && selectionEnd > start) end = selectionEnd;

          contentState = Modifier.removeInlineStyle(
            contentState,
            SelectionState.createEmpty().merge({
              anchorKey: blockKey,
              focusKey: blockKey,
              anchorOffset: start,
              focusOffset: end
            }),
            font
            )
        }
      });
  });
   // // APPLY SELECTED SIZE TO CLEANED SELECTED REGION
  contentState = Modifier.applyInlineStyle(
    contentState,
    selection,
    selectedSize
    );
  // console.log(selectedSize);
  editorState = EditorState.push(
    editorState,
    contentState,
    'change-inline-style'
  );
  return editorState;
};

export default applyFontSize;
