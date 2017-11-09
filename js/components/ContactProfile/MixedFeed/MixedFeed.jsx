import React, {Component} from 'react';
import Tweet from '../Tweets/Tweet.jsx';
import HeadlineItem from '../Headlines/HeadlineItem.jsx';
import InstagramItem from '../Instagram/InstagramItem.jsx';
import GenericFeed from '../GenericFeed.jsx';

class MixedFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.setRef = ref => {
      this._mixedList = ref;
    };
    this.setCellRef = ref => {
      this._mixedListCellMeasurer = ref;
    };
    this.rowRenderer = this._rowRenderer.bind(this);
  }

  componentDidMount() {
    this.recomputeIntervalTimer = setInterval(_ => {
      if (this._mixedList && this._mixedListCellMeasurer) {
        this._mixedListCellMeasurer.resetMeasurements();
        this._mixedList.recomputeRowHeights();
      }
    }, 5000);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.containerWidth !== this.props.containerWidth) {
      if (this._mixedList && this._mixedListCellMeasurer) {
        this._mixedListCellMeasurer.resetMeasurements();
        this._mixedList.recomputeRowHeights();
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.recomputeIntervalTimer);
  }

  _rowRenderer({key, index, style}) {
    const feedItem = this.props.feed[index];
    let row;
    switch (feedItem.type) {
      case 'headlines':
        row = <HeadlineItem screenWidth={this.props.containerWidth} style={this.props.rowStyle} {...feedItem} />;
        break;
      case 'tweets':
        row = <Tweet screenWidth={this.props.containerWidth} style={this.props.rowStyle} {...feedItem} />;
        break;
      case 'instagrams':
        row = <InstagramItem screenWidth={this.props.containerWidth} style={this.props.rowStyle} {...feedItem} />;
        break;
      default:
        row = <HeadlineItem screenWidth={this.props.containerWidth} style={this.props.rowStyle} {...feedItem} />;
    }

    let newstyle = style;
    if (newstyle) newstyle.padding = '0 18px';
    return (
      <div className='vertical-center' key={key} style={newstyle}>
        {row}
      </div>);
  }

  render() {
    const props = this.props;
    return (
      <GenericFeed
      setCellRef={this.setCellRef}
      setRef={this.setRef}
      rowRenderer={this.rowRenderer}
      title='RSS/Twitter/Instagram'
      {...props}
      />);
  }
}

export default MixedFeed;
