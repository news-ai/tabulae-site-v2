import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as stagingActions} from 'components/Email';
import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import {grey400} from 'material-ui/styles/colors';
import LinkItem from './LinkItem.jsx';

class LinkAnalytics extends Component {
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
        <FontIcon color={grey400} className='fa fa-spinner fa-spin'/> :
        <div>
        {props.logs && props.links &&
          <div>
          {Object.keys(props.links).map((link, i) =>
            <LinkItem key={link} link={link} count={props.links[link]}/>)}
          </div>}
        {!props.links &&
          <span>No links were clicked in this email.</span>}
        </div>}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  return {
    logs: state.stagingReducer[props.emailId].logs,
    links: state.stagingReducer[props.emailId].links,
    isReceiving: state.stagingReducer.isReceiving
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchLogs: _ => dispatch(stagingActions.fetchLogs(props.emailId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LinkAnalytics);