// @flow
import React, {Component} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import Dropzone from 'react-dropzone';
import AttachmentPreview from '../EmailAttachment/AttachmentPreview.jsx';
import FlatButton from 'material-ui/FlatButton';
import alertify from 'alertifyjs';

class FileWrapper extends Component {
  onDrop: (acceptedFiles: Array<Object>, rejectedFiles: Array<Object>) => void;
  constructor(props) {
    super(props);
    this.onDrop = this._onDrop.bind(this);
  }

  _onDrop(acceptedFiles: Array<Object>, rejectedFiles: Array<Object>):void {
    if (rejectedFiles.length > 0) {
      alertify.warning(`File size cannot exceed 5MB. The file(s) dropped: ${rejectedFiles.map(file => (file.size / 1000000).toFixed(2) + 'MB').join(', ')}.`);
    }
    const files = [...this.props.files, ...acceptedFiles];
    this.props.setAttachments(files);
  }

  render() {
    const props = this.props;
    return (
      <Dialog
      actions={[<FlatButton label='Close' onClick={props.onRequestClose}/>]}
      title='File Upload' autoScrollBodyContent
      open={props.open || false} onRequestClose={props.onRequestClose}
      >
        <div style={{margin: 10}} className='horizontal-center'>
          <Dropzone maxSize={5000000} onDrop={this.onDrop}>
            <div style={{margin: 10}}>Try dropping some files here, or click to select some files.</div>
          </Dropzone>
        </div>
        {props.files.length > 0 && (
          <div>
            <h4>Attached {props.files.length} file(s)...</h4>
            <div className='row'>
            {props.files.map((file, i) =>
              <AttachmentPreview
              onRemoveClick={_ => props.setAttachments(props.files.filter((f, fi) => fi !== i))}
              key={`file-${i}`}
              name={file.name}
              preview={file.preview}
              size={file.size}
              maxLength={17}
              />)}
            </div>
          </div>)}
      </Dialog>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    files: state.emailAttachmentReducer.attached,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    setAttachments: files => dispatch({type: 'SET_ATTACHMENTS', files}),
    clearAttachments: _ => dispatch({type: 'CLEAR_ATTACHMENTS'}),
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(FileWrapper);
