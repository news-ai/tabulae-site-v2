import {fontsizeMap} from '../utils/renderers';
import {SelectionState, Modifier} from 'draft-js';

const fontInlineStyles = Object.keys(fontsizeMap);

const FONT_PREFIX = 'SIZE-';

function applyDefaultFontSizeInlineStyle(contentState, defaultInlineStyle) {
  let newContentState = contentState;
  contentState.getBlockMap().forEach(block => {
    block.findStyleRanges(
        char => char.getStyle().toJS().filter(style => style.substring(0, FONT_PREFIX.length) === FONT_PREFIX).length === 0,
        (start, end) => {
          // console.log(start, end);
          const selection = SelectionState
          .createEmpty()
          .merge({
            anchorKey: block.getKey(),
            anchorOffset: start,
            focusKey: block.getKey(),
            focusOffset: end
          });
          newContentState = Modifier.applyInlineStyle(newContentState, selection, defaultInlineStyle);
        }
      );
  });
  return newContentState;
}

export default applyDefaultFontSizeInlineStyle;
