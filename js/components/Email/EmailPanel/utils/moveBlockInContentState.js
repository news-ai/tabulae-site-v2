// took from AtomicBlockUtils until draft.js 0.11.0 lands

export default function moveBlockInContentState(
  contentState: ContentState,
  blockToBeMoved: ContentBlock,
  targetBlock: ContentBlock,
  insertionMode: DraftInsertionType
): ContentState {
  if (blockToBeMoved.getKey() === targetBlock.getKey())
    throw new Error('Block cannot be moved next to itself.');

  if (insertionMode === 'replace')
    throw new Error('Replacing blocks is not supported.');

  const targetKey = targetBlock.getKey();
  const blockBefore = contentState.getBlockBefore(targetKey);
  const blockAfter = contentState.getBlockAfter(targetKey);

  const blockMap = contentState.getBlockMap();
  const blockMapWithoutBlockToBeMoved = blockMap.delete(blockToBeMoved.getKey());
  const blocksBefore = blockMapWithoutBlockToBeMoved.toSeq().takeUntil(v => v === targetBlock);
  const blocksAfter = blockMapWithoutBlockToBeMoved.toSeq().skipUntil(v => v === targetBlock).skip(1);

  let newBlocks;

  if (insertionMode === 'before') {
    if (!((!blockBefore) || blockBefore.getKey() !== blockToBeMoved.getKey()))
      throw new Error('Block cannot be moved next to itself.');

    newBlocks = blocksBefore.concat(
      [[blockToBeMoved.getKey(), blockToBeMoved], [targetBlock.getKey(), targetBlock]],
      blocksAfter
    ).toOrderedMap();
  } else if (insertionMode === 'after') {
    if (!((!blockAfter) || blockAfter.getKey() !== blockToBeMoved.getKey()))
      throw new Error('Block cannot be moved next to itself.');

    newBlocks = blocksBefore.concat(
      [[targetBlock.getKey(), targetBlock], [blockToBeMoved.getKey(), blockToBeMoved]],
      blocksAfter
    ).toOrderedMap();
  }

  return contentState.merge({
    blockMap: newBlocks,
    selectionBefore: contentState.getSelectionAfter(),
    selectionAfter: contentState.getSelectionAfter().merge({
      anchorKey: blockToBeMoved.getKey(),
      focusKey: blockToBeMoved.getKey(),
    }),
  });
}
