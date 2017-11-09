import {Modifier, RichUtils, EditorState} from 'draft-js';

function toggleSingleInlineStyle(editorState, toggledStyle, inlineStyleMap, PREFIX_MATCH) {
  const selection = editorState.getSelection();
  const currentStyle = editorState.getCurrentInlineStyle();

  // Let's just allow one color at a time. Turn off all active colors.
  // get a list of active colors
  const activeStyles = PREFIX_MATCH ?
    currentStyle.filter(val => val.substring(0, PREFIX_MATCH.length) === PREFIX_MATCH) :
    Object.keys(inlineStyleMap);

  // turn off active colors
  const nextContentState = activeStyles
  .reduce((contentState, inlineStyle) =>
    Modifier.removeInlineStyle(contentState, selection, inlineStyle),
    editorState.getCurrentContent());

  let nextEditorState = EditorState.push(
    editorState,
    nextContentState,
    'change-inline-style'
  );

  // Unset style override for current color.
  if (selection.isCollapsed()) {
    nextEditorState = currentStyle.reduce((state, inlineStyle) => {
      return RichUtils.toggleInlineStyle(state, inlineStyle);
    }, nextEditorState);
  }

  // If the color is being toggled on, apply it.
  if (!currentStyle.has(toggledStyle)) {
    nextEditorState = RichUtils.toggleInlineStyle(
      nextEditorState,
      toggledStyle
    );
  }
  return nextEditorState;
}

export default toggleSingleInlineStyle;
