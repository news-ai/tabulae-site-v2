import React, {Component} from 'react';
import {connect} from 'react-redux';
import {blue700} from 'material-ui/styles/colors';
import PreviewItem from './PreviewItem.jsx';

class PublicationPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  render() {
    const props = this.props;
    const state = this.state;
    return props.text.length > 0 ? (
      <div style={{margin: '0 10px'}}>
      {props.publication ?
        <PreviewItem {...props.publication}/> : <div>
        {!state.open &&
          <div style={{margin: 10}}>
            <div className='large-12 medium-12 small-12 columns'>
              <span>We couldn't find a publication under that name. </span>
              <span className='pointer' style={{color: blue700}} onClick={props.onOpenForm}>Add one?</span>
            </div>
          </div>}
      </div>}
      </div>) : null;
  }
}

const mapStateToProps = (state, props) => {
  const pubId = state.publicationReducer[props.text];
  return {
    publication: pubId ? state.publicationReducer[pubId] : undefined
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PublicationPreview);
