import React from 'react';
import StyleButton from './StyleButton';

export default function InlineStyleControls(props) {
  let {inlineStyles} = props;
  var currentStyle = props.editorState.getCurrentInlineStyle();

  return (
    <div className='RichEditor-controls vertical-center'>
      {inlineStyles.map(type =>
        <StyleButton
        key={type.label}
        active={currentStyle.has(type.style)}
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
