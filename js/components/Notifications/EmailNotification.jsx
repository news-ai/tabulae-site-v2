import React, {Component} from 'react';
import {connect} from 'react-redux';
import {grey50, grey300, grey500, grey600, grey700, blue500} from 'material-ui/styles/colors';
import Link from 'react-router/lib/Link';
import FontIcon from 'material-ui/FontIcon';
import moment from 'moment-timezone';

const styles = {
  container: {padding: '5px 10px 10px 10px', borderBottom: `1px dotted ${grey300}`},
  text: {color: grey700},
  resourceButton: {margin: '0 5px', color: grey700, padding: '1px 8px', border: `1px solid ${grey300}`, borderRadius: '1.1em'},
  icon: {fontSize: '0.9em', marginRight: 5},
  link: {textDecoration: 'none'},
  datestring: {color: grey600},
  textContainer: {marginTop: 5}
};

moment.fn.fromNowOrNow = function (a) {
  if (Math.abs(moment().diff(this)) < 1000 * 60 * 2) { // 1000 milliseconds
    return 'just now';
  }
  return this.fromNow(a);
}

const EmailNotification = ({resourceName, resourceId, resourceAction, data, isReceiving, createdAt, unread}) => {
  const m = moment.utc(createdAt).local();
  const fromNowDateString = m.fromNowOrNow();

  const clickableToLabel = <Link to={`/tables/${data.listid}/${data.contactId}`} style={styles.link} >{data.to}</Link>;
  const containerStyle = unread ? Object.assign({}, styles.container, {backgroundColor: grey50}) : styles.container;
  return (
    <div style={containerStyle} >
      <div className='vertical-center'>
        <span className='right smalltext' style={styles.datestring} >{fromNowDateString}</span>
      </div>
      <div className='vertical-center' style={styles.textContainer} >
        <span className='text' style={styles.text}>
          <FontIcon color={blue500} style={styles.icon} className={resourceAction === 'click' ? 'fa fa-mouse-pointer' : 'fa fa-envelope-open'} />
          <strong>{clickableToLabel}</strong> {`${resourceAction}ed`} on email from <strong>{data.subject}</strong>
        </span>
      </div>
    </div>
    );
}

export default EmailNotification;
