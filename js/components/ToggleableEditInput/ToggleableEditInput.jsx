import React from 'react';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';

const styles = {
  nameBlock: {
    title: {
      marginLeft: 5,
      marginRight: 5,
      width: 500,
      fontSize: '1.2em'
    }
  },
  icon: {
    fontSize: '0.9em'
  },
  textfield: {
    left: 0, float: 'left'
  },
};

function ToggleableEditInput({
  isTitleEditing,
  onToggleTitleEdit,
  onUpdateName,
  name,
  nameStyle,
  placeholder,
  hideIcon,
  disabled,
  maxTextLength,
  onKeyDown,
}) {
  const spanStyle = nameStyle ? Object.assign({}, styles.nameBlock.title, nameStyle) : styles.nameBlock.title;
  const content = placeholder && (!name || name.length === 0) ? placeholder : name;
  const renderNode = isTitleEditing && !disabled ? (
    <TextField
    className='u-full-width noprint'
    style={styles.textfield}
    id='toggle-text-field'
    type='text'
    name={name}
    onBlur={onToggleTitleEdit}
    onKeyDown={onKeyDown}
    value={name}
    onChange={onUpdateName}
    autoFocus
    />) : (
    <div className='u-full-width' onClick={onToggleTitleEdit}>
      <span
      className='print'
      style={spanStyle}
      >{maxTextLength && content.length >= maxTextLength - 4 ? `${content.substring(0, maxTextLength - 4)} ...` : content}</span>
      {!hideIcon && !disabled &&
        <FontIcon
        className='fa fa-pencil-square-o pointer'
        color='lightgray'
        hoverColor='gray'
        style={styles.icon}
        />}
    </div>
    );
  return <div>{renderNode}</div>;
}

export default ToggleableEditInput;
