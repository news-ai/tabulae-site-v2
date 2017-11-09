import React from 'react';
import {connect} from 'react-redux';
import ContactDescriptor from '../ContactDescriptor.jsx';
import {actions as publicationActions} from 'components/Publications';
import {blue50} from 'material-ui/styles/colors';
import isURL from 'validator/lib/isURL';
import withRouter from 'react-router/lib/withRouter';

const PreviewItem = ({id, name, url, patchPublication, router}) => (
  <div
  style={{
    backgroundColor: blue50,
    margin: '15px 5px',
    padding: 10
  }}>
    <div className='row' style={{margin: '0 10px'}}>
      {url ? <span className='pointer' onClick={() => router.push(`/publications/${id}`)}>{name}</span> : <span>{name}</span>}
    </div>
    <div className='row' style={{margin: '3px 0'}}>
      <ContactDescriptor
      iconClassName='fa fa-external-link'
      className='large-12 medium-12 small-12 columns'
      content={url}
      contentTitle='Website Link'
      onBlur={url => {
        if (isURL(url)) patchPublication({url});
      }}/>
    </div>
  </div>
  );

const mapStateToProps = (state, props) => {
  return {
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    patchPublication: publicationBody => dispatch(publicationActions.patchPublication(props.id, publicationBody)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PreviewItem));
