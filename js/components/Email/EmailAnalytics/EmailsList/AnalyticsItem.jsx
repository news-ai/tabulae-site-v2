import React, {Component} from 'react';
import CountViewItem from './CountViewItem.jsx';
import Link from 'react-router/lib/Link';
import StaticEmailContent from 'components/Email/PreviewEmails/StaticEmailContent.jsx';
import {
  deepOrange100, deepOrange700, deepOrange900,
  grey400, grey600, grey800
} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import {connect} from 'react-redux';
import {actions as stagingActions} from 'components/Email';
import {actions as attachmentActions} from 'components/Email/EmailAttachment';
import Paper from 'material-ui/Paper';
import {actions as listActions} from 'components/Lists';
import get from 'lodash/get';
import EditContactDialog from 'components/ListTable/EditContactDialog.jsx';
import RaisedButton from 'material-ui/RaisedButton';

import moment from 'moment-timezone';

const FORMAT = 'ddd, MMM Do Y, hh:mm A';
const DEFAULT_DATESTRING = '0001-01-01T00:00:00Z';

class AnalyticsItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPreviewOpen: false,
      showEditPanel: false,
    };
    this.onPreviewOpen = this._onPreviewOpen.bind(this);
    this.onEditContactOpen = _ => this.setState({showEditPanel: true});
    this.onEditContactClose = _ => this.setState({showEditPanel: false});
  }

  componentWillMount() {
    this.props.fetchList();
  }

  _onPreviewOpen() {
    this.props.fetchAttachments();
    this.props.onPreviewClick(this.props);
  }

  render() {
    const {
      isScrolling,
      id,
      opened,
      clicked,
      to,
      subject,
      bounced,
      bouncedreason,
      delivered,
      listid,
      updated,
      attachments,
      sendat,
      created,
      cc,
      bcc,
      archiveEmail,
      archived,
      contact,
      contactId,
      list,
      deleted,
      onOpenClick,
      onLinkClick,
      onPreviewOpen
    } = this.props;
    const state = this.state;
    const wrapperStyle = (bounced || !delivered) ? Object.assign({}, styles.wrapper, {backgroundColor: deepOrange100}) : styles.wrapper;
    const SUBTRING_LIMIT = 20;
    let sendAtDate = moment(sendat);
    const sendAtDatestring = sendat === DEFAULT_DATESTRING ? 'IMMEDIATE' : sendAtDate.tz(moment.tz.guess()).format(FORMAT);
    let createdDate = moment(created);
    const recepientString = contact ? `${contact.firstname} ${contact.lastname} <${to}>` : to;

    let listNameString = list ? list.name : `(Archived) ${listid}`;

    return (
      <Paper zDepth={1} className='clearfix' style={wrapperStyle}>
        <div className='row'>
          <div className='small-12 medium-6 large-6 columns'>
          {listid !== 0 &&
            <div>
              <span style={styles.sentFrom}>Sent from List</span>
              <span style={styles.linkContainerSpan}>
                <Link to={`/tables/${listid}`}>{listNameString}</Link>
              </span>
            {attachments !== null &&
              <FontIcon style={styles.attachmentIcon} className='fa fa-paperclip' />}
            {!archived ?
              <FontIcon
              className='pointer fa fa-trash'
              style={styles.trashIcon}
              color={grey400}
              hoverColor={grey600}
              onClick={archiveEmail}
              /> : <span className='smalltext' style={styles.archived}>(Archived)</span>}
            </div>}
            <span style={styles.to}>To</span>
            <span className='text' style={{color: (bounced || !delivered) ? deepOrange900 : grey800}}>{recepientString}</span>
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
        <div className='row' style={styles.analytics}>
          <div className='small-12 medium-8 large-8 columns truncate-ellipsis' style={styles.toContainer}>
            <span className='pointer' onClick={this.onPreviewOpen} style={styles.subjectText} >{subject || '(No Subject)'}</span>
          </div>
        {(!delivered || bouncedreason) &&
          <div className='small-12 medium-12 large-12 columns'>
          {!delivered &&
            <div style={styles.errorText}>
              <span>Something went wrong on our end. Let us know!</span>
              <p>Email ID: {id}</p>
            </div>}
          {bouncedreason &&
            <p style={styles.bouncedReason}>{bouncedreason}</p>}
          </div>}
          <div className='small-12 medium-2 large-2 columns horizontal-center' style={styles.tagContainer}>
          {(!bounced && delivered) &&
            <CountViewItem onClick={onOpenClick} label='Opened' count={opened} iconName='fa fa-paper-plane-o' />}
          </div>
          <div className='small-12 medium-1 large-1 columns horizontal-center' style={styles.tagContainer}>
          {(!bounced && delivered) &&
            <CountViewItem onClick={onLinkClick} label='Clicked' count={clicked} iconName='fa fa-hand-pointer-o' />}
          </div>
        {bounced &&
          <div className='small-12 medium-12 large-12 columns'>
          {deleted ?
            <span className='right' style={styles.bouncedLabel} >Contact Deleted from List</span> :
            <RaisedButton className='right' onClick={this.onEditContactOpen} label='Edit Contact' />}
            <EditContactDialog
            listId={listid}
            contactId={contactId}
            open={state.showEditPanel}
            onClose={this.onEditContactClose}
            />
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
    padding: '10px 15px',
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
  bouncedReason: {
    color: deepOrange900,
  },
  bouncedLabel: {
    color: deepOrange700,
    fontSize: '0.9em',
    margin: '0 20px'
  },
  tagContainer: {
    padding: 3
  },
  archived: {color: grey600, margin: '0 3px'},
  fullname: {color: grey800}
};

const mapStateToProps = (state, props) => {
  const list = state.listReducer[props.listid];
  return {
    list,
    isFetchingList: get(state, `isFetchingReducer.lists[${props.listid}].isReceiving`, false),
    contact: state.contactReducer[props.contactId],
    deleted: list ? !list.contacts.some(id => id === props.contactId) : false,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchAttachments: _ => props.attachments !== null && props.attachments.map(id => dispatch(attachmentActions.fetchAttachment(id))),
    archiveEmail: _ => dispatch(stagingActions.archiveEmail(props.id)),
    fetchList: _ => dispatch(listActions.fetchList(props.listid)),
    startFetch: _ => dispatch({type: 'IS_FETCHING', resource: 'lists', id: props.listid, fetchType: 'isReceiving'}),
    endFetch: _ => dispatch({type: 'IS_FETCHING_DONE', resource: 'lists', id: props.listid, fetchType: 'isReceiving'}),
  };
};

const mergeProps = (sProps, dProps, props) => {
  return {
    ...sProps,
    ...dProps,
    ...props,
    fetchList: _ => {
      if (!sProps.isFetchingList && !sProps.list) {
        // only fetch if it is not currently fetching
        dProps.startFetch();
        dProps.fetchList()
        .then(_ => dProps.endFetch());
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(AnalyticsItem);