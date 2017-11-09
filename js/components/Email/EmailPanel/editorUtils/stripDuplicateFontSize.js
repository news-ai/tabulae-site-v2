import {EditorState, SelectionState, Modifier, convertToRaw} from 'draft-js';

// this.onFontSizeToggle = selectedSize => this.onChange(applyFontSize(this.state.editorState, selectedSize), 'force-emit-html');

const FONT_PREFIX = 'SIZE-';

const stripDuplicateFontsize = editorState => {
  let contentState = editorState.getCurrentContent();
  let hasMoreExtraFont;

  do {
    hasMoreExtraFont = false;
    contentState.getBlockMap().forEach(block => {
      let extraFont;
      block.findStyleRanges(
        char => {
          const charFonts = char.getStyle().toJS().filter(font => font.substring(0, FONT_PREFIX.length) === FONT_PREFIX);
          if (charFonts.length <= 1) return false;
          else {
            const lastCharFont = charFonts[charFonts.length - 1];
            if (!extraFont) {
              extraFont = charFonts[charFonts.length - 1];
              return true;
            }
            if (lastCharFont !== extraFont) hasMoreExtraFont = true;
            return lastCharFont === extraFont;
          }
        },
        (start, end) => {
          // extraFont range
          contentState = Modifier.removeInlineStyle(
            contentState,
            SelectionState.createEmpty().merge({
              anchorKey: block.getKey(),
              focusKey: block.getKey(),
              anchorOffset: start,
              focusOffset: end
            }),
            extraFont
            );
        });
    });
  } while (hasMoreExtraFont);

  return EditorState.push(
    editorState,
    contentState,
    'change-inline-style'
  );
};

export default stripDuplicateFontsize;
