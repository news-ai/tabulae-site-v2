import {SelectionState, Modifier, convertToRaw} from 'draft-js';


const handleLineBreaks = (oldContentState) => {
  let newContentState = oldContentState;
  oldContentState.getBlockMap().reverse().forEach(lastUnprocessedBlock => {
    const text = lastUnprocessedBlock.getText();
    let i, char;
    for (i = text.length - 1; i >= 0; i--) {
      if (text.charAt(i) === '\n') {
        newContentState = Modifier.splitBlock(
          newContentState,
          SelectionState.createEmpty(lastUnprocessedBlock.getKey()).merge({anchorOffset: i, focusOffset: i})
          );
      }
    }
  });
  newContentState.getBlockMap().forEach(block => {
    if (block.getText().charAt(0) === '\n') {
      newContentState = Modifier.removeRange(
        newContentState,
        SelectionState.createEmpty(block.getKey()).merge({anchorOffset: 0, focusOffset: 1}),
        'right'
        );
    }
  });
  return newContentState;
}

export default handleLineBreaks;
