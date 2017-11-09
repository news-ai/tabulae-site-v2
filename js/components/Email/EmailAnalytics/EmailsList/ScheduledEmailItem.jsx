import React, {Component} from 'react';
import Link from 'react-router/lib/Link';
import Dialog from 'material-ui/Dialog';
import StaticEmailContent from 'components/Email/PreviewEmails/StaticEmailContent.jsx';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import {connect} from 'react-redux';
import {actions as stagingActions} from 'components/Email';
import {actions as attachmentActions} from 'components/Email/EmailAttachment';
import {deepOrange600, grey400, grey600, grey800, deepOrange700, deepOrange900} from 'material-ui/styles/colors';
import moment from 'moment-timezone';
import alertify from 'alertifyjs';
import FontIcon from 'material-ui/FontIcon';

const DEFAULT_DATESTRING = '0001-01-01T00:00:00Z';
const FORMAT = 'ddd, MMM Do Y, hh:mm A';

class ScheduledEmailItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPreviewOpen: false,
    };
    this.onPreviewOpen = this._onPreviewOpen.bind(this);
    this.onPreviewClose = _ => this.setState({isPreviewOpen: false});
  }

  _onPreviewOpen() {
    this.props.fetchAttachments();
    this.setState({isPreviewOpen: true});
  }

  render() {
    const {
      id,
      opened,
      clicked,
      to,
      subject,
      bounced,
      bouncedreason,
      delivered,
      listid,
      listname,
      updated,
      attachments,
      sendat,
      created,
      cc,
      bcc,
      archiveEmail,
      archived,
      cancel,
      onCancelClick,
      contact,
      contactId
    } = this.props;
    const state = this.state;
    const SUBTRING_LIMIT = 20;
    let sendAtDate = moment(sendat);
    const sendAtDatestring = sendat === DEFAULT_DATESTRING ? 'IMMEDIATE' : sendAtDate.tz(moment.tz.guess()).format(FORMAT);
    let createdDate = moment(created);
    const recepientString = contact ? `${contact.firstname} ${contact.lastname} <${to}>` : to;
    // console.log(cancel);
    // console.log(id);
    return (
      <Paper zDepth={1} className='clearfix' style={styles.wrapper}>
        <div className='row'>
          <div className='small-12 medium-6 large-6 columns'>
          {listid !== 0 &&
            <div>
              <span style={styles.sentFrom}>Sent from List</span>
              <span style={styles.linkContainerSpan}>
                <Link to={`/tables/${listid}`}>{listname || `(Archived) ${listid}`}</Link>
              </span>
            {attachments !== null &&
              <FontIcon style={styles.attachmentIcon} className='fa fa-paperclip'/>}
            {!archived ?
              <FontIcon
              className='pointer fa fa-trash'
              style={styles.trashIcon}
              color={grey400}
              hoverColor={grey600}
              onClick={archiveEmail}
              /> : <span className='smalltext' styles={styles.archived}>(Archived)</span>}
            </div>}
            <span style={styles.to}>To</span>
            <span className='text' style={styles.toLabel}>{recepientString}</span>
          </div>
          <div className='small-12 medium-6 large-6 columns'>
            <div className='row'>
              <div className='large-12 medium-12 small-12 columns'>
                <span style={styles.sentLabel}><strong>Created at:</strong> {createdDate.tz(moment.tz.guess()).format(FORMAT)}</span>
              </div>
              <div className='large-12 medium-12 small-12 columns'>
                <span style={styles.sentLabel}><strong>Send at:</strong> {sendAtDatestring}</span>
              </div>
            </div>
          </div>
        </div>
        <Dialog open={this.state.isPreviewOpen} onRequestClose={this.onPreviewClose} autoScrollBodyContent >
          <StaticEmailContent {...this.props} />
        </Dialog>
        <div className='row' style={styles.analytics}>
          <div className='small-12 medium-8 large-8 columns truncate-ellipsis' style={styles.toContainer}>
            <span className='pointer' onClick={this.onPreviewOpen} style={styles.subjectText} >{subject || '(No Subject)'}</span>
          </div>
          <div className='small-12 medium-4 large-4 columns horizontal-center'>
            {!cancel &&
              <FlatButton
              onClick={_ =>
                alertify.confirm(
                'Cancel Email Delivery',
                'Canceling email delivery cannot be undone. You would have to resend the email. Are you sure?',
                onCancelClick,
                _ => ({}))
              }
              label='Cancel Delivery' secondary/>}
          </div>
        {cancel &&
          <div className='small-12 large-6 columns left'>
            <span style={styles.cancel}>Canceled Delivery</span>
          </div>}
        </div>
      </Paper>
      );
  }
}

const styles = {
  analytics: {
    display: 'flex',
    alignItems: 'center'
  },
  wrapper: {
    padding: 20,
    margin: 5,
    marginBottom: 10,
  },
  to: {
    color: 'gray',
    fontSize: '0.8em',
    marginRight: 5
  },
  toContainer: {margin: '15px 0'},
  subjectText: {
    fontWeight: 500,
    color: grey800,
    marginLeft: 10
  },
  sentFrom: {
    color: 'gray',
    fontSize: '0.8em',
    marginRight: 5
  },
  linkContainerSpan: {
    fontSize: '0.9em'
  },
  attachmentIcon: {
    fontSize: '0.8em', margin: '0 3px'
  },
  trashIcon: {
    fontSize: '16px',
    marginLeft: 8
  },
  sentLabel: {
    marginRight: 10, fontSize: '0.9em', float: 'right', color: 'gray'
  },
  tagContainer: {
    padding: 3
  },
  toLabel: {color: grey800},
  archived: {color: grey600, margin: '0 3px'},
  fullname: {color: grey800},
  cancel: {color: deepOrange600, fontSize: '0.8em'},
};

const mapStateToProps = (state, props) => {
  return {
    listname: state.listReducer[props.listid] ? state.listReducer[props.listid].name : undefined
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    onCancelClick: _ => dispatch(stagingActions.cancelScheduledEmail(props.id)),
    fetchAttachments: _ => props.attachments !== null && props.attachments.map(id => dispatch(attachmentActions.fetchAttachment(id))),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ScheduledEmailItem);
