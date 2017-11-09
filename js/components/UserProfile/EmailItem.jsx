import React from 'react';
import {connect} from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import {grey500, grey800} from 'material-ui/styles/colors';
import {actions as loginActions} from 'components/Login';

const EmailItem = props => {
  return (
    <div className='vertical-center' style={{margin: '3px 0'}}>
      <span style={{color: grey800, fontSize: '0.8em', margin: '0 5px'}}>{props.email}</span>
      <FontIcon onClick={props.removeExternalEmail} style={{fontSize: '0.8em'}} className='fa fa-times' color={grey500} hoverColor={grey800}/>
    </div>);
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    removeExternalEmail: _ => dispatch(loginActions.removeExternalEmail(props.email))
  };
};

export default connect(null, mapDispatchToProps)(EmailItem);
