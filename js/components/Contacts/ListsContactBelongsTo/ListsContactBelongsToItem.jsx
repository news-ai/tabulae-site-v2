import React, {Component} from 'react';
import Link from 'react-router/lib/Link';
import {
  teal400, teal900,
  grey50, grey500, grey700, grey800
} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';

// TODO: implement redo and pass action back up parent container
const ListsContactBelongsToItem = ({list}) => (
  <div className='vertical-center'>
    <Link
    key={list.id}
    to={{pathname: `/tables/${list.id}`}}
    style={{
      cursor: 'pointer',
      fontSize: '0.9em',
      color: grey700,
      marginRight: '15px'
    }}
    >{list.name}</Link>
    <FontIcon
    className='fa fa-trash'
    color={grey500}
    hoverColor={grey700}
    style={{fontSize: '0.8em'}}
    />
  </div>
  );

export default ListsContactBelongsToItem;
