import sanitizeHtml from 'sanitize-html';
import {ContentState, Modifier, EditorState, RichUtils, SelectionState, convertToRaw} from 'draft-js';
import linkifyIt from 'linkify-it';
import tlds from 'tlds';

const linkify = linkifyIt();
linkify
.tlds(tlds)
.set({fuzzyLink: false});

function _removeWhiteSpace(editorState) {
  // // HACK: remove empty character in empty block to have paragraph breaks
  let newEditorState = editorState;
  newEditorState.getCurrentContent().getBlockMap().map(block => {
    if (block.getType() === 'atomic') return;
    let text = block.getText();
    // console.log(text);
    text = text.replace(/^\s+/, '').replace(/\s+$/, '');
    if (text === '') {
      // console.log('hit empty block');
      const selection = SelectionState.createEmpty(block.getKey());
      const newContent = Modifier.removeRange(
        newEditorState.getCurrentContent(),
        selection.merge({anchorOffset: 0, focusOffset: block.getText().length}),
        'right'
       );
      newEditorState = EditorState.push(newEditorState, newContent, 'insert-fragment');
    }
  });
  return newEditorState;
}

/**
 * [handlePastedText description]
 * @param  {[type]} editorState  oldEditorState
 * @param  {[type]} contentState processed ContentState to add to oldEditorState
 * @return {[type]} newEditorState              [description]
 */

function linkifyContentState(editorState, contentState) {
  // Save location of block/selection before paste to know where to insert pasted content when rebuilding contentState
  const prePasteSelection = editorState.getSelection();
  const prePasteNextBlock = editorState.getCurrentContent().getBlockAfter(prePasteSelection.getEndKey());

  let newEditorState = EditorState.push(
    editorState,
    Modifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), contentState.getBlockMap()),
    'insert-fragment'
    );

  // HACK: remove empty character in empty block to have paragraph breaks
  newEditorState = _removeWhiteSpace(newEditorState);

  // go through each block and linkify words
  let inPasteRange = false;
  newEditorState.getCurrentContent().getBlockMap().forEach((block, key) => {
    if (prePasteNextBlock && key === prePasteNextBlock.getKey()) {
      // hit next block pre-paste, stop linkify
      return false;
    }
    if (key === prePasteSelection.getStartKey() || inPasteRange) {
      inPasteRange = true;
      const links = linkify.match(block.get('text'));
      if (typeof links !== 'undefined' && links !== null) {
        for (let i = 0; i < links.length; i++) {
          let selectionState = SelectionState.createEmpty(block.getKey());
          selectionState = newEditorState.getSelection().merge({
            anchorKey: block.getKey(),
            anchorOffset: links[i].index,
            focusKey: block.getKey(),
            focusOffset: links[i].lastIndex
          });
          newEditorState = EditorState.acceptSelection(newEditorState, selectionState);

          // check if entity exists already
          const startOffset = selectionState.getStartOffset();
          const endOffset = selectionState.getEndOffset();

          let linkKey;
          let hasEntityType = false;
          for (let j = startOffset; j < endOffset; j++) {
            linkKey = block.getEntityAt(j);
            if (linkKey !== null) {
              const type = contentState.getEntity(linkKey).getType();
              if (type === 'LINK') {
                hasEntityType = true;
                break;
              }
            }
          }
          if (!hasEntityType) {
            // insert entity if no entity exist
            const entityKey = newEditorState
            .getCurrentContent()
            .createEntity('LINK', 'MUTABLE', {url: links[i].url})
            .getLastCreatedEntityKey();
            newEditorState = RichUtils.toggleLink(newEditorState, selectionState, entityKey);
          }
        }
      }
    }
  });

  newEditorState = EditorState.forceSelection(newEditorState, prePasteSelection);
  return newEditorState;
}

export default linkifyContentState;
