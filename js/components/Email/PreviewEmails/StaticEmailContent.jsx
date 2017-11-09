import React from 'react';
import {grey600} from 'material-ui/styles/colors';
import moment from 'moment-timezone';
import {connect} from 'react-redux';
import FontIcon from 'material-ui/FontIcon';

const styles = {
  content: {
    // margin: '5px',
  },
  span: {
    margin: '10px 5px'
  },
  strong: {
    color: 'gray',
    marginRight: 15
  },
};

const FORMAT = 'ddd, MMM Do Y, hh:mm A';

function createMarkUp(html) {
  return { __html: html };
}

const AttachmentLineItem = props => {
  return (
    <div className='vertical-center'>
      <FontIcon style={{fontSize: '0.8em', margin: 5}} className='fa fa-paperclip'/>
      <span style={{fontSize: '0.8em'}}>{props.originalname}</span>
    </div>);
};

function StaticEmailContent({to, subject, body, sendat, attachments, files, cc, bcc, fromemail}) {
  let date;
  if (sendat !== null && sendat !== '0001-01-01T00:00:00Z') date = moment(sendat);
  return (
    <div className='u-full-width' style={styles.content}>
      {fromemail && fromemail !== null && <div className='vertical-center' style={styles.span}><strong style={styles.strong}>From</strong>{fromemail}</div>}
      <div className='vertical-center' style={styles.span}><strong style={styles.strong}>To</strong>{to}</div>
      <div className='vertical-center' style={styles.span}><strong style={styles.strong}>Subject</strong>{subject.length === 0 ? '(No Subject)' : subject}</div>
      {cc !== null && <div className='vertical-center' style={styles.span}><strong style={styles.strong}>CC</strong>{cc.join(', ')}</div>}
      {bcc !== null && <div className='vertical-center' style={styles.span}><strong style={styles.strong}>BCC</strong>{bcc.join(', ')}</div>}
      {attachments !== null &&
        <div>
          {files.map((file, i) => <AttachmentLineItem key={`attachment-${file.id}`} {...file}/>)}
        </div>}
      {date && <p style={styles.span}><span style={{fontSize: '0.9em', color: grey600}}>Scheduled: {date.tz(moment.tz.guess()).format(FORMAT)} {moment.tz.guess()} (adjusted)</span></p>}
      <div style={styles.span} dangerouslySetInnerHTML={createMarkUp(body)}/>
    </div>
    );
}

const mapStateToProps = (state, props) => {
  return {
    files: props.attachments !== null && props.attachments.filter(fileId => state.emailAttachmentReducer[fileId]).map(fileId => state.emailAttachmentReducer[fileId]),
  };
};

export default connect(mapStateToProps)(StaticEmailContent);
