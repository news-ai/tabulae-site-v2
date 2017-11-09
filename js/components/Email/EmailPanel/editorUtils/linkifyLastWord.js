import {
  EditorState,
  ContentState,
  SelectionState,
  RichUtils,
  Modifier,
} from 'draft-js';

import linkifyIt from 'linkify-it';
import tlds from 'tlds';

const linkify = linkifyIt();
linkify
.tlds(tlds)
.set({fuzzyLink: false});

function linkifyLastWord(insertChar = '', editorState) {
  // check last words in a block and linkify if detect link
  // insert special char after handling linkify case
  if (editorState.getSelection().getHasFocus() && editorState.getSelection().isCollapsed()) {
    const selection = editorState.getSelection();
    const focusKey = selection.getFocusKey();
    const focusOffset = selection.getFocusOffset();
    const block = editorState.getCurrentContent().getBlockForKey(focusKey);
    const links = linkify.match(block.get('text'));
    if (typeof links !== 'undefined' && links !== null) {
      for (let i = 0; i < links.length; i++) {
        if (links[i].lastIndex === focusOffset) {
          // last right before space inserted
          let selectionState = SelectionState.createEmpty(block.getKey());
          selectionState = selection.merge({
            anchorKey: block.getKey(),
            anchorOffset: focusOffset - links[i].raw.length,
            focusKey: block.getKey(),
            focusOffset
          });
          editorState = EditorState.acceptSelection(editorState, selectionState);

          // check if entity exists already
          const startOffset = selectionState.getStartOffset();
          const endOffset = selectionState.getEndOffset();

          let linkKey;
          let hasEntityType = false;
          for (let j = startOffset; j < endOffset; j++) {
            linkKey = block.getEntityAt(j);
            if (linkKey !== null) {
              const type = editorState.getCurrentContent().getEntity(linkKey).getType();
              if (type === 'LINK') {
                hasEntityType = true;
                break;
              }
            }
          }

          if (!hasEntityType) {
            // insert space
            const content = editorState.getCurrentContent();
            const newContent = Modifier.insertText(content, selection, insertChar);
            editorState = EditorState.push(editorState, newContent, 'insert-fragment');

            // insert entity if no entity exist
            const entityKey = editorState
            .getCurrentContent()
            .createEntity('LINK', 'MUTABLE', {url: links[i].url})
            .getLastCreatedEntityKey();
            editorState = RichUtils.toggleLink(editorState, selectionState, entityKey);

            // move selection focus back to original spot
            selectionState = selectionState.merge({
              anchorKey: block.getKey(),
              anchorOffset: focusOffset + 1, // add 1 for space in front of link
              focusKey: block.getKey(),
              focusOffset: focusOffset + 1
            });
            editorState = EditorState.acceptSelection(editorState, selectionState);
            return editorState;
          }
          break;
        }
      }
    }
  }
  return false;
}

export default linkifyLastWord;
