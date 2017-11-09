import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as stagingActions} from 'components/Email';
import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import {grey400, grey600, yellow50} from 'material-ui/styles/colors';
import moment from 'moment-timezone';

const FORMAT = 'ddd, MMM Do Y, hh:mm A';

const openItemStyle = {margin: '0 5px', color: grey600, fontSize: '0.9em'};
const openItemContainerStyle = {margin: '5px 0'};

const OpenItem = ({CreatedAt}) => {
  let createdDate = moment(CreatedAt);
  return (
  <div className='row vertical-center' style={openItemContainerStyle}>
    <span style={openItemStyle}>{createdDate.tz(moment.tz.guess()).format(FORMAT)}</span>
  </div>
  );
};

class OpenAnalytics extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchLogs();
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div style={props.style}>
      {props.isReceiving ?
        <FontIcon style={styles.loadingIcon} color={grey400} className='fa fa-spinner fa-spin'/> :
        <div style={styles.openContaner}>
      {props.opens &&
        props.opens
        .map((item, i) =>
          <OpenItem key={`${props.emailId}-open-${i}`} {...item}/>)}
        {!props.opens &&
          <span>Email was never opened.</span>}
        </div>}
        <div style={styles.warning}>
          <span>Sometimes, open count might be off by +/-1 count depending on how your recipient's devices are set up to receive emails.
          On some phones, the email is previewed on the home screens and that would count as a view.</span>
        </div>
      </div>);
  }
}

const styles = {
  warning: {backgroundColor: yellow50, padding: 10, margin: 10, fontSize: '0.9em'},
  openContaner: {margin: '20px 0'},
  loadingIcon: {margin: '10px 0'},
};

const mapStateToProps = (state, props) => {
  const logs = state.stagingReducer[props.emailId].logs;
  return {
    logs,
    links: state.stagingReducer[props.emailId].links,
    isReceiving: state.stagingReducer.isReceiving,
    opens: logs && logs.length > 0 && logs.filter(item => item.Type === 'open')
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchLogs: _ => dispatch(stagingActions.fetchLogs(props.emailId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(OpenAnalytics);