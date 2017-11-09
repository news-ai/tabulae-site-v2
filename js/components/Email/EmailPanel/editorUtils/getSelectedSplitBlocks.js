import {EditorState, ContentState, SelectionState, Modifier, convertToRaw} from 'draft-js';

const getSelectedSplitBlocks = (editorState) => {
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

  // split 1st and last block and drop unselected regions
  let selectedContentState = ContentState.createFromBlockArray(selectedBlocks);
  selectedContentState = Modifier.splitBlock(
    selectedContentState,
    SelectionState.createEmpty(selectedContentState.getFirstBlock().getKey()).merge({anchorOffset: selectionStart, focusOffset: selectionStart})
    );
  selectedContentState = Modifier.splitBlock(
    selectedContentState,
    SelectionState.createEmpty(selectedContentState.getLastBlock().getKey()).merge({anchorOffset: selectionEnd, focusOffset: selectionEnd})
    );
  const selectedBlockArray = selectedContentState.getBlocksAsArray();
  const finalBlockArray = selectedBlockArray.slice(1, selectedBlockArray.length - 1);
  const finalContentState = ContentState.createFromBlockArray(finalBlockArray);
  return finalContentState;
};

export default getSelectedSplitBlocks;
