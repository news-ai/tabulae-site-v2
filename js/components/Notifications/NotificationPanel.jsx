import React from 'react';
import {connect} from 'react-redux';
import {grey300, grey700} from 'material-ui/styles/colors';
import Link from 'react-router/lib/Link';
import EmailNotification from './EmailNotification';

const Notification = ({message}) => (
  <div className='vertical-center horizontal-center' style={{padding: 10, borderBottom: `1px dotted ${grey300}`}}>
    <span className='smalltext' style={{color: grey700}}>{message}</span>
  </div>
  );

const styles = {
  container: {
    backgroundColor: '#ffffff',
    width: 350,
    minHeight: 30,
    maxHeight: 300
  },
  empty: {
    container: {padding: 10},
    text: {color: grey700}
  }
};

const NotificationPanel = ({notifications}) => {
  return (
    <div style={styles.container}>
    {
      notifications
      .filter(message => message.resourceName === 'email')
      .map((message, i) => {
        switch (message.resourceName) {
          // case 'email':
          //   return <EmailNotification key={`message-${i}`} {...message} />
          default:
            // return <Notification {...message} />
            return <EmailNotification key={`message-${i}`} {...message} />
        }
      })
    }
    {notifications.length === 0 &&
      <div className='vertical-center horizontal-center' style={styles.empty.container}>
        <span className='smalltext' style={styles.empty.text}>No new notifications.</span>
      </div>}
    </div>
    );
};

const mapStateToProps = (state, props) => {
  return {
    notifications: state.notificationReducer.messages
  };
};

export default connect(mapStateToProps)(NotificationPanel);
