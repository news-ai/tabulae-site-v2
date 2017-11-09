import React from 'react';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import FontIcon from 'material-ui/FontIcon';
import {blue200, blue50} from 'material-ui/styles/colors';

const fontIconStyle = {fontSize: 16};

function CountViewItem({label, count, iconName, onClick, style}) {
  return (
      <Chip style={style} backgroundColor={blue50} onClick={onClick}>
        <Avatar
        size={25}
        backgroundColor={blue200}
        color='#ffffff'
        >{count}</Avatar>
        {label} <FontIcon style={fontIconStyle} className={iconName}/>
      </Chip>
    );
}

export default CountViewItem;
