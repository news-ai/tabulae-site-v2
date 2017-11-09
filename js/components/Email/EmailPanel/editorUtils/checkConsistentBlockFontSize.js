import {EditorState, SelectionState, Modifier, convertToRaw, RichUtils} from 'draft-js';
import toggleSingleInlineStyle from 'components/Email/EmailPanel/editorUtils/toggleSingleInlineStyle';
import {OrderedSet} from 'immutable'

const DEFAULT_FONTSIZE = 'SIZE-10.5';
const FONT_PREFIX = 'SIZE-';

const checkConsistentBlockFontSize = oldEditorState => {
  let editorState = oldEditorState;
  oldEditorState.getCurrentContent().getBlockMap().forEach((block, i) => {
    // const countMap = {};
    // block.getCharacterList().forEach((char, j) => {
    //   const fontsize = char.getStyle()
    //   .filter(fontsize => fontsize.substring(0, FONT_PREFIX.length) === FONT_PREFIX).first() || DEFAULT_FONTSIZE;
    //   console.log(fontsize);
    //   if (countMap[fontsize]) countMap[fontsize]++;
    //   else countMap[fontsize] = 1;
    // });
    // const maxUsedSize = Object.keys(countMap).reduce(({fontsize, count}, nextFontsize) =>
    //   countMap[nextFontsize] > count ? {fontsize: nextFontsize, count: countMap[nextFontsize]} : {fontsize, count},
    //   {fontsize: DEFAULT_FONTSIZE, count: 0}).fontsize;
    // const seenSizes = {};
    // let currSize = undefined;
    // console.log(maxUsedSize);
    // console.log(countMap);


    const maxUsedSize = 'SIZE-10.5';
    const countMap = {'SIZE-9.5': 36, 'SIZE-10.5': 99};
    let currStyle;
    block.findStyleRanges(
      char => {
        currStyle = char.getStyle()
        .filter(fontsize => fontsize.substring(0, FONT_PREFIX.length) === FONT_PREFIX).first() || DEFAULT_FONTSIZE;
        return countMap[currStyle];
      },
      (start, end) => {
        const selection = SelectionState.createEmpty(block.getKey()).merge({focusOffset: start, anchorOffset: end});
        editorState = RichUtils.toggleInlineStyle(
          EditorState.forceSelection(editorState, selection),
          currStyle
          );
        console.log('start', start);
        console.log('end', end);
        console.log('currStyle', currStyle);
        console.log(convertToRaw(editorState.getCurrentContent()));
      })

    // deselect all font styles in the block
    // Object.keys(countMap).map(fontsize => {
    //   contentState = Modifier.removeInlineStyle(
    //     contentState,
    //     SelectionState.createEmpty().merge({focusKey: block.getKey(), anchorKey: block.getKey(), focusOffset: 0, anchorOffset: block.getLength()}),
    //     fontsize
    //     );
    //   console.log(fontsize, convertToRaw(contentState));
    // });

    // set SelectionState and untoggle maxUsedSize where it applies then retoggles maxUsedSize for the entire block
    editorState = RichUtils.toggleInlineStyle(
      EditorState.forceSelection(
        editorState,
        SelectionState.createEmpty().merge({focusKey: block.getKey(), anchorKey: block.getKey(), focusOffset: 0, anchorOffset: block.getLength()}),
        ),
      maxUsedSize
      );
    console.log(convertToRaw(editorState.getCurrentContent()));
    // editorState = toggleSingleInlineStyle(editorState, maxUsedSize, undefined, 'SIZE-');

  });
  return editorState;
};

export default checkConsistentBlockFontSize;