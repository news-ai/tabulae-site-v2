import React from 'react';
import {grey50, grey200, grey800, grey500} from 'material-ui/styles/colors';
import Link from 'react-router/lib/Link';
import FontIcon from 'material-ui/FontIcon';

const styles = {
  container: {
    margin: '2px 5px',
    padding: '1px 8px',
    display: 'inline-block',
    textAlign: 'center',
    lineHeight: '100%'
  },
  text: {
    fontSize: '0.8em'
  },
  icon: {fontSize: '0.8em', marginLeft: 8},
};

const Tag = ({textStyle, text, onDeleteTag, hideDelete, color, borderColor, link, whiteLabel}) => {
  const span = (
    <span style={Object.assign(
      {},
      styles.text,
      {color: whiteLabel ? '#ffffff' : grey800},
      textStyle)}>{text}</span>);

  return (
    <div style={Object.assign({}, styles.container, {
      backgroundColor: color,
      borderRight: `1px solid ${borderColor}`,
      borderBottom: `1px solid ${borderColor}`,
    })}>
      {link ? <Link to={link}>{span}</Link> : span}
      {!hideDelete &&
        <FontIcon
        onClick={onDeleteTag}
        style={styles.icon}
        className='fa fa-times pointer'
        color={whiteLabel ? grey200 : grey500}
        hoverColor={whiteLabel ? grey50 : grey800}
        />}
    </div>);
};

export default Tag;
