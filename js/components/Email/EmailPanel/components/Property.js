
import React from 'react';
import {lightBlue50} from 'material-ui/styles/colors';

export default function Property(props) {
  // let property;
  // if (props.entityKey !== null) {
  //   property = props.contentState.getEntity(props.entityKey).getData().href;
  // } else {
  //   property = props.decoratedText;
  // }
  return (
    <span style={{color: 'blue', backgroundColor: lightBlue50}} >
      {props.children}
    </span>
  );
}