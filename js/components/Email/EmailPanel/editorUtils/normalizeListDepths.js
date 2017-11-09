import {ContentState} from 'draft-js';


// normalize list-items that have depths that are >1 away from previous list-item
// breaks draftToHTML conversion
const normalizeListDepths = (contentState) => {
  let blocks = [];
  contentState.getBlockMap().map((block, i) => {
    const blockType = block.getType();
    if (blockType !== 'ordered-list-item' && blockType !== 'unordered-list-item') {
      blocks.push(block);
      return;
    }
    const prevBlock = contentState.getBlockBefore(block.getKey());
    const prevBlockType = prevBlock ? prevBlock.getType() : undefined;
    let adjustedDepth = block.getDepth();
    if (prevBlockType !== 'unordered-list-item' && prevBlockType !== 'ordered-list-item') {
      adjustedDepth = 0;
    } else {
      if (block.getDepth() - prevBlock.getDepth() > 1) adjustedDepth = prevBlock.getDepth() + 1;
    }
    const newAdjustedDepthBlock = block.set('depth', adjustedDepth);
    blocks.push(newAdjustedDepthBlock);
  });
  return ContentState.createFromBlockArray(blocks);
};

export default normalizeListDepths;
