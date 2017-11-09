import React from 'react';
import StyleButton from './StyleButton';

export default function PositionStyleControls(props) {
  const {editorState, blockTypes} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className='RichEditor-controls vertical-center'>
      {blockTypes.map(type =>
        <StyleButton
        key={`position-${type.label}`}
        active={type.style === blockType}
        label={type.label}
        onToggle={props.onToggle}
        style={type.style}
        icon={type.icon}
        tooltipPosition={props.tooltipPosition}
        />
      )}
    </div>
  );
}
