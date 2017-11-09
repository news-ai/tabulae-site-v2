import React from 'react';
import isURL from 'validator/lib/isURL';
import isEmail from 'validator/lib/isEmail';

import {grey700, grey800, red600} from 'material-ui/styles/colors';
import {ControlledInput} from 'components/ToggleableEditInput';

const styles = {
  smallIcon: {
    fontSize: 16,
    color: grey700
  },
  small: {
    width: 36,
    height: 36,
    padding: 2,
  },
  iconStyle: {
    marginRight: 15,
    color: grey800
  },
  errorText: {
    fontSize: '0.7em', color: red600
  },
  container: {
    height: 35
  }
};

let contentStyle = {
  color: 'black',
  marginLeft: 10,
  marginRight: 10,
  fontSize: '0.9em'
};

const ContactDescriptor = ({
  showTitle,
  content,
  contentTitle,
  onBlur,
  className,
  iconClassName,
  errorText,
  extraIcons,
  disabled
}) => {
  const icon = content && isURL(content) && !isEmail(content) ?
  <a href={content.substring(0, 4) === 'http' ? content : `https://${content}`} style={styles.iconStyle} target='_blank'>
    <i className={iconClassName} aria-hidden='hidden' />
  </a> : <i style={styles.iconStyle} className={iconClassName} aria-hidden='hidden' />;
  if (content) contentStyle = Object.assign({}, contentStyle, {color: grey700});

  return (
    <div className={`${className} vertical-center`} style={styles.container}>
      {iconClassName && icon}
      {showTitle && <span style={styles.iconStyle}>{contentTitle}</span>}
      {errorText !== null && <span style={styles.errorText}>{errorText}</span>}
      <ControlledInput
      disabled={disabled}
      nameStyle={contentStyle}
      name={content}
      placeholder={`---- ${contentTitle} empty ----`}
      maxTextLength={50}
      onBlur={onBlur}
      />
      {extraIcons}
  </div>);
};

export default ContactDescriptor;
