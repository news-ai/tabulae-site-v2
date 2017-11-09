import {EditorState, SelectionState, Modifier} from 'draft-js';
const dedupe = list => Object.keys(list.reduce((acc, val) => Object.assign(acc, {[val]: true}), {}));
const findAllFontSizesInSelection = (editorState) => {
  const FONT_PREFIX = 'SIZE-';
  let contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const anchorKey = selection.getIsBackward() ? selection.getFocusKey() : selection.getAnchorKey();
  const focusKey = selection.getIsBackward() ? selection.getAnchorKey() : selection.getFocusKey();
  const selectionStart = selection.getStartOffset();
  const selectionEnd = selection.getEndOffset();
  let selectedBlocks = [];
  let inBlock = false;
  editorState.getCurrentContent().getBlockMap().forEach(block => {
    if (block.getKey() === anchorKey) inBlock = true;
    if (inBlock) selectedBlocks.push(block);
    if (block.getKey() === focusKey) inBlock = false;
  });
  let fontUnion = [];
  selectedBlocks.map((block, i) => {
    const blockKey = block.getKey();

    // DESELECT ALL SELECTED WITH FONTSIZE
    let font = undefined;
    block.findStyleRanges(
      char => {
        const charFont = char.getStyle().toJS().filter(font => font.substring(0, FONT_PREFIX.length) === FONT_PREFIX)[0];
        font = charFont;
        if (charFont) return true;
        else {
          font = 'SIZE-10.5'; // default
          return true;
        }
      },
      (styleStart, styleEnd) => {
        if (selection.hasEdgeWithin(blockKey, styleStart, styleEnd)) {
          fontUnion.push(font);
        }
      });
  });
  return dedupe(fontUnion);
};

export default findAllFontSizesInSelection;
