import React from 'react';
import Image from 'components/Email/EmailPanel/Image/Image.jsx';
import Immutable from 'immutable';
import {
  convertToRaw,
  convertFromRaw,
  EditorState
} from 'draft-js';

// draft-convert has a bug that uses 'a' as anchor textNode for atomic block
export function stripATextNodeFromContent(content) {
  const {entityMap, blocks} = convertToRaw(content);
  const newRaw = {entityMap, blocks: blocks.map(block => {
    if (block.type === 'atomic') {
      return Object.assign({}, block, {text: ' '});
    }
    return block;
  })};
  return convertFromRaw(newRaw);
}

const Media = props => {
  const {block, contentState} = props;
  const entityKey = block.getEntityAt(0);
  if (entityKey === null) return null;
  // console.log(block.getEntityAt(0));
  const entity = contentState.getEntity(entityKey);
  // console.log(entity.getData());
  const type = entity.getType();
  const blockKey = block.getKey();

  let media = null;
  if (type === 'IMAGE') {
    // const realEntity = props.blockProps.getEditorState().getCurrentContent().getEntity(block.getEntityAt(0));
    // const {src, align, imageLink, size, wrap} = entity.getData();
    const {src, align, imageLink, size} = entity.getData();
    media = (
      <Image
      align={align}
      imageLink={imageLink}
      size={size}
      src={src}
      onDragStart={_ => {
        props.blockProps.propagateDragTarget(blockKey);
      }}
      onSizeChange={newSize => {
        const editorState = props.blockProps.getEditorState();
        const newContent = editorState.getCurrentContent()
        .mergeEntityData(block.getEntityAt(0), {size: `${newSize}%`});

        const newEditorState = EditorState.push(editorState, newContent, 'activate-entity-data');
        const selection = newEditorState.getSelection();
        props.blockProps.onChange(EditorState.forceSelection(newEditorState, selection), 'force-emit-html');
      }}
      onImageLinkChange={newImageLink => {
        const editorState = props.blockProps.getEditorState();
        const newContent = editorState.getCurrentContent()
        .mergeEntityData(block.getEntityAt(0), {imageLink: newImageLink});

        const newEditorState = EditorState.push(editorState, newContent, 'activate-entity-data');
        const selection = newEditorState.getSelection();
        props.blockProps.onChange(EditorState.forceSelection(newEditorState, selection), 'force-emit-html');
      }}
      onImageAlignChange={newAlign => {
        const editorState = props.blockProps.getEditorState();
        const newContent = editorState.getCurrentContent()
        .mergeEntityData(block.getEntityAt(0), {align: newAlign});

        const newEditorState = EditorState.push(editorState, newContent, 'activate-entity-data');
        const selection = newEditorState.getSelection();
        props.blockProps.onChange(EditorState.forceSelection(newEditorState, selection), 'force-emit-html');
      }}
      />);
    /*
      onToggleImageWrap={wrap => {
        const editorState = props.blockProps.getEditorState();
        const newContent = editorState.getCurrentContent()
        .mergeEntityData(block.getEntityAt(0), {wrap: wrap});

        const newEditorState = EditorState.push(editorState, newContent, 'activate-entity-data');
        const selection = newEditorState.getSelection();
        props.blockProps.onChange(EditorState.forceSelection(newEditorState, selection), 'force-emit-html');
      }}
     */
  }
  return media;
};

export const mediaBlockRenderer = ({
  getEditorState,
  onChange,
  propagateDragTarget
}) => (block) => {
  // const editorState = getEditorState();
  // console.log(editorState);
  if (block.getType() === 'atomic') {
    return {
      component: Media,
      editable: false,
      props: {
        getEditorState,
        onChange,
        propagateDragTarget
      }
    };
  }
  return null;
};

export function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote';
    case 'right-align':
      return 'RichEditor-right-align';
    case 'left-align':
      return 'RichEditor-left-align';
    case 'center-align':
      return 'RichEditor-center-align';
    case 'justify-align':
      return 'RichEditor-justify-align';
    case 'atomic':
      return 'RichEditor-atomic';
    default:
      return null;
  }
}

export const blockRenderMap = Immutable.Map({
  'right-align': {
    element: 'div',
  },
  'center-align': {
    element: 'div'
  },
  'justify-align': {
    element: 'div'
  }
});

export const fontsizeMap = {
  'SIZE-5': {fontSize: '5.5pt'},
  'SIZE-6': {fontSize: '6pt'},
  'SIZE-7.5': {fontSize: '7.5pt'},
  'SIZE-8': {fontSize: '8pt'},
  'SIZE-9': {fontSize: '9pt'},
  'SIZE-10': {fontSize: '10pt'},
  'SIZE-10.5': {fontSize: '10.5pt'},
  'SIZE-11': {fontSize: '11pt'},
  'SIZE-12': {fontSize: '12pt'},
  'SIZE-14': {fontSize: '14pt'},
  'SIZE-16': {fontSize: '16pt'},
  'SIZE-18': {fontSize: '18pt'},
  'SIZE-20': {fontSize: '20pt'},
  'SIZE-22': {fontSize: '22pt'},
  'SIZE-24': {fontSize: '24pt'},
  'SIZE-26': {fontSize: '26pt'},
  'SIZE-28': {fontSize: '28pt'},
  'SIZE-36': {fontSize: '36pt'},
  'SIZE-48': {fontSize: '48pt'},
  'SIZE-72': {fontSize: '72pt'},
};

export const typefaceMap = {
  'Arial': {fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'},
  'Helvetica': {fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'},
  'Times New Roman': {fontFamily: '"Times New Roman", Times, serif'},
  'Courier New': {fontFamily: '"Courier New", Courier, "Lucida Sans Typewriter", "Lucida Typewriter", monospace'},
  'Courier': {fontFamily: 'Courier'},
  'Palatino': {fontFamily: 'Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif'},
  'Garamond': {fontFamily: 'Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", "Times New Roman", serif'},
  'Bookman': {fontFamily: 'Bookman'},
  'Avant Garde': {fontFamily: '"Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, AppleGothic, sans-serif'},
  'Verdana': {fontFamily: 'Verdana, Geneva, sans-serif'},
  'Tahoma': {fontFamily: 'Tahoma, Geneva, sans-serif'},
  'Impact': {fontFamily: 'Impact, Charcoal, sans-serif'},
  'Avenir': {fontFamily: '"Avenir Next", sans-serif'},
  'Nunito': {fontFamily: 'Nunito'},
};

export const specialMap = {
  'EMAIL_SIGNATURE': {}
};

const customBlocks = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2
  }
};

export const customStyleFn = style => {
  const styleNames = style.toJS();
  // console.log(styleNames);
  return styleNames.reduce((styles, styleName) => {
    if (styleName.startsWith('COLOR-')) {
      styles.color = styleName.split('COLOR-')[1];
    }
    if (styleName.startsWith('SIZE-')) {
      styles.fontSize = styleName.split('SIZE-')[1] + 'pt';
    }
    return styles;
  }, {});
}

// Custom overrides for "code" style.
export const styleMap = Object.assign({}, customBlocks, typefaceMap, specialMap);
