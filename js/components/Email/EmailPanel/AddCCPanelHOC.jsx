import React, {Component} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import {WithContext as ReactTags} from 'react-tag-input';
import isEmail from 'validator/lib/isEmail';
import {yellow50} from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton'

class AddCCPanelHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    this.onRequestClose = _ => this.setState({open: false});
    this.onRequestOpen = _ => this.setState({open: true});
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div className={props.className} >
        <Dialog actions={[<FlatButton label='Close' onClick={this.onRequestClose}/>]}
        open={state.open} onRequestClose={this.onRequestClose}>
          <div className='panel' style={styles.warningPanel}>
            <h5>Warning</h5>
            <span className='smalltext'>
              If you set CC/BCC here, Tabulae will set the same CC/BCC on <strong>every
              emails generated and send them to every contacts selected!</strong> Proceed cautiously.
            </span>
          </div>
          <div style={styles.labelContainer}>
            <span className='smalltext' style={styles.label}>CC</span>
            <ReactTags
            tags={props.cc}
            placeholder='Hit Enter after input'
            handleDelete={props.handleDeletionCC}
            handleAddition={props.handleAdditionCC}
            />
          </div>
          <div style={styles.labelContainer}>
            <span className='smalltext' style={styles.label}>BCC</span>
            <ReactTags
            tags={props.bcc}
            placeholder='Hit Enter after input'
            handleDelete={props.handleDeletionBCC}
            handleAddition={props.handleAdditionBCC}
            />
          </div>
        </Dialog>
        {props.children({onRequestOpen: this.onRequestOpen})}
      </div>
      );
  }
}

const styles = {
  warningPanel: {
    backgroundColor: yellow50,
    margin: 10,
    padding: 10
  },
  label: {margin: '0 3px'},
  labelContainer: {margin: 10},
}

const mapStateToProps = (state, props) => {
  return {
    cc: state.emailDraftReducer[props.listId].cc || [],
    bcc: state.emailDraftReducer[props.listId].bcc || [],
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    updateCC: cc => dispatch({type: 'UPDATE_CC', cc, listId: props.listId}),
    updateBCC: bcc => dispatch({type: 'UPDATE_BCC', bcc, listId: props.listId})
  };
};

const mergeProps = (sProps, dProps, oProps) => {
  return {
    ...sProps,
    ...dProps,
    ...oProps,
    handleAdditionCC: email => {
      if (!isEmail(email)) return;
      dProps.updateCC([...sProps.cc, {text: email}]);
    },
    handleDeletionCC: index => dProps.updateCC(sProps.cc.filter((item, i) => i !== index)),
    handleAdditionBCC: email => {
      if (!isEmail(email)) return;
      dProps.updateBCC([...sProps.bcc, {text: email}]);
    },
    handleDeletionBCC: index => dProps.updateBCC(sProps.bcc.filter((item, i) => i !== index)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(AddCCPanelHOC);
