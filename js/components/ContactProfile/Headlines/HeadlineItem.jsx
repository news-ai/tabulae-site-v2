import React, {Component} from 'react';
import {connect} from 'react-redux';
import {grey400} from 'material-ui/styles/colors';
import {actions as publicationActions} from 'components/Publications';

const createMarkup = markup => ({__html: markup});

const defaultStyle = {
  paddingTop: 10,
  paddingBottom: 10,
  marginTop: 20,
  marginBottom: 20,
  marginRight: 3,
  marginLeft: 3,
  border: `dotted 1px ${grey400}`,
  borderRadius: '0.4em'
};

const HeadlineItem = ({style, url, title, createdat, summary, publisherName}) => {
  const date = new Date(createdat);
  const containerStyle = style ? Object.assign({}, defaultStyle, style) : defaultStyle;
  return (
  <div className='row headline-item' style={containerStyle}>
    <div className='large-12 medium-12 small-12 columns'><span style={{fontSize: '0.8em', color: grey400}}>from RSS</span></div>
    <div className='large-12 medium-12 small-12 columns'>
      <a target='_blank' href={url}><span style={{fontSize: '1.1em'}}>{title}</span></a>
    </div>
    <div className='large-12 medium-12 small-12 columns' style={{fontSize: '0.8em'}}>
      <span>{date.toDateString()}</span><span style={{marginLeft: 8}}>{date.toTimeString()}</span>
    </div>
    <div className='large-12 medium-12 small-12 columns'>
      <span style={{fontWeight: 500}}>{publisherName}</span>
    </div>
    <div className='large-12 medium-12 small-12 columns rss-feed-markup-item' style={{margin: '20px 0'}}>
      <div dangerouslySetInnerHTML={createMarkup(summary)} />
    </div>
  </div>
  );
};

class HeadlineItemContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const props = this.props;
    if (!props.publisherName && !props.isReceiving) {
      props.fetchPublication(props.publicationid);
    }
  }

  render() {
    return <HeadlineItem {...this.props} />;
  }
}

const mapStateToProps = (state, props) => {
  return {
    publisherName: state.publicationReducer[props.publicationid] && state.publicationReducer[props.publicationid].name,
    isReceiving: state.publicationReducer[props.publicationid] && state.publicationReducer[props.publicationid].isReceiving
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchPublication: id => dispatch(publicationActions.fetchPublication(id))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HeadlineItemContainer);
