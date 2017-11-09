import React from 'react';

const defaultStyle = {
  zIndex: 160,
};

const defaultTextStyle = {
  zIndex: 160,
};

export default function Waiting({isReceiving, style, text, textStyle}) {
  const mergeStyles = style ? Object.assign({}, defaultStyle, style) : defaultStyle;
  const mergeTextStyle = textStyle ? Object.assign({}, defaultTextStyle, textStyle) : defaultTextStyle;
  return isReceiving ? (
    <div style={mergeStyles}>
      <i className='fa fa-spinner fa-spin fa-3x' aria-hidden='true' />
      {text ? <p style={mergeTextStyle}>{text}</p> : null}
    </div>
  ) : <span />;
}
