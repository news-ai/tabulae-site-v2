import React, {Component} from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import {List, CellMeasurer, WindowScroller, AutoSizer} from 'react-virtualized';
import {grey700} from 'material-ui/styles/colors';

const styleEmptyRow = {
  padding: 10,
  marginTop: 20,
  marginBottom: 20,
};

const BasicFeed = props => (
  <CellMeasurer
  ref={props.setCellRef}
  cellRenderer={({rowIndex, ...rest}) => props.rowRenderer({index: rowIndex, ...rest})}
  columnCount={1}
  rowCount={props.feed.length}
  width={props.containerWidth}
  >
  {({getRowHeight}) => (
    <List
    ref={ref => props.setRef(ref)}
    width={props.containerWidth || 500}
    height={props.containerHeight}
    rowCount={props.feed.length}
    rowHeight={getRowHeight}
    rowRenderer={props.rowRenderer}
    scrollTop={props.scrollTop}
    overscanRowCount={5}
    onScroll={args => {
      if (((args.scrollHeight - args.scrollTop) / args.clientHeight) < 2) props.fetchFeed();
    }}
    />)}
  </CellMeasurer>);

class GenericFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.props.fetchFeed();
  }
  
  render() {
    const props = this.props;
    const limitedHeightList = props.feed && <BasicFeed {...props}/>;
    const windowScrollableList = props.feed && (
       <WindowScroller>
        {({height, scrollTop}) => (<BasicFeed {...props} containerHeight={height} scrollTop={scrollTop}/>)}
        </WindowScroller>);
    const autoSizedList = props.feed && (
        <AutoSizer>
        {({height}) => (<BasicFeed {...props} containerHeight={height}/>)}
        </AutoSizer>);
    const renderNode = (
      <div>
        {!props.hideEmptyPlaceholder && props.feed
          && !props.didInvalidate
          && props.feed.length === 0
          && (
            <div className='row' style={styleEmptyRow}>
              <p style={{color: grey700, fontSize: '0.9em'}}>No {props.title} attached. Try clicking on 'Settings' to start seeing some headlines.</p>
            </div>
            )}
        {props.didInvalidate
          && (
            <div className='row' style={styleEmptyRow}>
              <p>Something went wrong. Sorry about that. A bug has been filed. Check back in a while or use the bottom right chat button to leave us a message and we'll try to resolve this for you as fast as we can.</p>
            </div>
            )}
        {props.feed && !props.autoSizer && (
          props.containerHeight ? limitedHeightList : windowScrollableList)}
      </div>
      );

    return props.value === props.name ? renderNode : null;
  }
}

export default GenericFeed;
