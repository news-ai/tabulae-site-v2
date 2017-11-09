export function findEntities(entityType, contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (entityKey !== null && contentState.getEntity(entityKey).getType() === entityType);
    },
    callback
  );
}

const CURLY_REGEX = /{([^}]+)}/g;
function findWithRegex(regex, contentBlock, callback, contentState) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

export function curlyStrategy(contentBlock, callback, contentState) {
  findWithRegex(CURLY_REGEX, contentBlock, callback);
}
