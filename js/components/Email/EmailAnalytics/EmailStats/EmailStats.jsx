import React, {Component} from 'react';
import {connect} from 'react-redux';

import * as actions from './actions';
import {actions as stagingActions} from 'components/Email';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import IconButton from 'material-ui/IconButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import moment from 'moment-timezone';

const dateFormat = (time) => {
  return moment(time).format('MM/DD');
};

const areaChartMargins = {top: 10, right: 30, left: 0, bottom: 0};

const emptyDivStyle = {margin: '20px 0'};

class EmailStats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentOffset: 0,
      currentLimit: 30,
      data: []
    };
    this.onLeftClick = this._onLeftClick.bind(this);
    this.onRightClick = this._onRightClick.bind(this);
    this.fetchEmailStats = this._fetchEmailStats.bind(this);
    this.onLimitChange = this._onLimitChange.bind(this);
    this.handleAreaChartOnClick = this._handleAreaChartOnClick.bind(this);
  }

  componentWillMount() {
    this.fetchEmailStats();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.length !== this.props.data.length) {
      const data = nextProps.data;
      // fill in empty days with empty object with right date to fill out the graph
      const filledData = data.reduce((acc, curr, i) => {
        if (i === 0) return [curr];
        const prev = data[i - 1];
        const prevDay = moment(prev.Date);
        const currDay = moment(curr.Date);
        const diff = currDay.diff(prevDay, 'days');
        if (diff === 1) {
          acc.push(curr);
          return acc;
        } else {
          for (let j = 1; j <= diff - 1; j++) {
            acc.push({Date: prevDay.add(1, 'days').format('YYYY-MM-DD')});
          }
          acc.push(curr);
          return acc;
        }
      }, []);
      // console.log(data);
      // console.log(filledData);
      this.setState({data: filledData});
    }
  }

  _fetchEmailStats() {
    return this.props.fetchEmailStats(this.state.currentLimit);
  }

  _onLeftClick() {

    new Promise((resolve, reject) => {
      window.Intercom('trackEvent', 'get_older_stats', {limit: this.state.currentLimit});
      mixpanel.track('get_older_stats', {limit: this.state.currentLimit});
      if (this.props.doneLoading) resolve(true); // no more stats available for loading
      else this.fetchEmailStats().then(resolve, reject);
    })
    .then(_ => {
      const {currentOffset, currentLimit} = this.state;
      this.setState({currentOffset: currentOffset + currentLimit});
    });
  }

  _onRightClick() {
    const {currentOffset, currentLimit} = this.state;
    if (currentOffset - currentLimit > 0) {
      this.setState({currentOffset: currentOffset - currentLimit});
    } else {
      // limit changed, set right as edge
      this.setState({currentOffset: 0});
    }
  }

  _onLimitChange(event, index, newLimit) {
    this.setState({currentLimit: newLimit}, _ => {
      if (!this.props.doneLoading) this.fetchEmailStats();
    });
  }

  _handleAreaChartOnClick(args) {
    const datestring = args.activeLabel;
    if (this.props.onDateSelected) this.props.onDateSelected(datestring);
  }

  render() {
    const props = this.props;
    const state = this.state;
    let left = state.data.length - (state.currentOffset + state.currentLimit);
    if (left < 0) left = 0;
    const right = state.data.length - state.currentOffset;
    const data = state.data.slice(left, right);
    return (
      <div>
        <div className='vertical-center horizontal-center'>
        {state.data.length === 0 &&
          <div style={emptyDivStyle}>No sent email history. Check back here after sending some emails.</div>}
          <AreaChart
          width={800}
          height={300}
          data={data}
          onClick={this.handleAreaChartOnClick}
          margin={areaChartMargins}
          >
            <XAxis dataKey='Date' tickFormatter={dateFormat}/>
            <YAxis/>
            <CartesianGrid strokeDasharray='3 3'/>
            <Tooltip/>
            <Legend
            verticalAlign='top'
            height={36}
            />
            <Area
            type='monotone'
            dataKey='Opens'
            stackId='1'
            stroke='#82ca9d'
            fill='#82ca9d'
            />
            <Area
            type='monotone'
            dataKey='Clicks'
            stackId='1'
            stroke='#8884d8'
            fill='#8884d8'
            />
          </AreaChart>
        </div>
        <div className='vertical-center horizontal-center'>
          <IconButton
          tooltip='Back'
          disabled={state.data.length === 0 || (props.doneLoading && left === 0)}
          onClick={this.onLeftClick}
          iconClassName='fa fa-angle-left'
          />
          <DropDownMenu value={state.currentLimit} onChange={this.onLimitChange}>
            <MenuItem key={7} value={7} primaryText='Past 7 Days' />
            <MenuItem key={14} value={14} primaryText='Past Two Weeks' />
            <MenuItem key={30} value={30} primaryText='Past 30 Days' />
            <MenuItem key={90} value={90} primaryText='Past 90 Days' />
          </DropDownMenu>
          <IconButton
          tooltip='Forward'
          disabled={state.data.length === 0 || state.currentOffset === 0}
          onClick={this.onRightClick}
          iconClassName='fa fa-angle-right'
          />
        </div>
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    data: state.emailStatsReducer.received.map(datestring => state.emailStatsReducer[datestring]),
    doneLoading: state.emailStatsReducer.offset === null,
    isReceiving: state.emailStatsReducer.isReceiving,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchEmailStats: limit => dispatch(actions.fetchEmailStats(limit)),
    fetchSpecificDayEmails: day => dispatch(stagingActions.fetchSpecificDayEmails(day)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailStats);
