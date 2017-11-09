import React, {Component} from 'react';
import {connect} from 'react-redux';
import EmailStats from './EmailStats/EmailStats.jsx';
import {actions as campaignActions} from './Campaign';
import {List, AutoSizer, CellMeasurer, WindowScroller} from 'react-virtualized';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
import Tooltip from 'components/Tooltip';

import withRouter from 'react-router/lib/withRouter';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import {grey400, grey600, grey700, grey500, grey800, blue800} from 'material-ui/styles/colors';
import Campaign from './Campaign/Campaign.jsx';

const styles = {
};

const fontIconStyle = {color: grey400};
const isReceivingContainerStyle = {margin: '10px 0'};
const iconButtonIconStyle = {color: grey600};
const pageTitleSpan = {fontSize: '1.5em'};

class CampaignContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.rowRenderer = this._rowRenderer.bind(this);
    this._campaignRef = this._campaignRef.bind(this);
    this._campaignCellMeasurerRef = this._campaignCellMeasurerRef.bind(this);
    this.cellRenderer = ({rowIndex, ...rest}) => this.rowRenderer({index: rowIndex, ...rest});
    window.onresize = () => {
      if (this._campaign) {
        this._campaignCellMeasurer.resetMeasurements();
        this._campaign.recomputeRowHeights();
      }
    };
  }

  componentWillUnmount() {
    window.onresize = undefined;
  }

  _campaignRef(ref) {
    this._campaign = ref;
  }

  _campaignCellMeasurerRef(ref) {
    this._campaignCellMeasurer = ref;
  }

  componentWillMount() {
    this.props.fetchCampaignStats();
  }

  _rowRenderer({key, index, isScrolling, isVisible, style}) {
    return (
      <div style={style} key={key}>
        <Campaign {...this.props.campaigns[index]}/>
      </div>);
  }

  render() {
    const props = this.props;
    const state = this.state;

    return (
      <div>
        <div className='row'>
          <div className='large-12 medium-12 small-12 columns'>
            <span style={pageTitleSpan}>Opens/Clicks History</span>
          </div>
        </div>
        <EmailStats/>
        <div className='row'>
          <span style={pageTitleSpan}>Campaigns</span>
        </div>
      {props.campaigns && 
        <WindowScroller>
        {({height, isScrolling, scrollTop}) =>
          <AutoSizer disableHeight>
            {({width}) =>
              <CellMeasurer
              ref={this._campaignCellMeasurerRef}
              cellRenderer={this.cellRenderer}
              columnCount={1}
              rowCount={props.campaigns.length}
              width={width}
              >
              {({getRowHeight}) =>
                <List
                ref={this._campaignRef}
                autoHeight
                width={width}
                height={height}
                rowHeight={getRowHeight}
                rowCount={props.campaigns.length}
                rowRenderer={this.rowRenderer}
                scrollTop={scrollTop}
                isScrolling={isScrolling}
                />
              }
              </CellMeasurer>
            }
            </AutoSizer>
          }
        </WindowScroller>}
      {props.isReceiving &&
        <div className='horizontal-center' style={isReceivingContainerStyle}>
          <FontIcon style={fontIconStyle} className='fa fa-spinner fa-spin'/>
        </div>}
      {props.hasNext && !props.isReceiving &&
        <div className='horizontal-center'>
          <IconButton
          tooltip='Load More'
          tooltipPosition='top-center'
          onClick={props.fetchCampaignStats}
          iconClassName='fa fa-chevron-down'
          iconStyle={iconButtonIconStyle}
          />
        </div>}
      </div>);
  }
}


const mapStateToProps = (state, props) => {
  return {
    campaigns: state.campaignStatsReducer.received.map(id => state.campaignStatsReducer[id]).filter(campaign => campaign.show),
    hasNext: state.campaignStatsReducer.offset !== null,
    isReceiving: state.campaignStatsReducer.isReceiving,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchCampaignStats: _ => dispatch(campaignActions.fetchCampaignStats()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CampaignContainer));
