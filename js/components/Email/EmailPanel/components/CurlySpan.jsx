import React from 'react';

export default function CurlySpan(props) {
  // console.log(props);
  return <span style={{ color: 'red' }}>{props.children}</span>;
}
