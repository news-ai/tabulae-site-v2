import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import withRouter from 'react-router/lib/withRouter';
import RaisedButton from 'material-ui/RaisedButton';
import {connect} from 'react-redux';
import {actions as listActions} from 'components/Lists';
import {actions as fileActions} from 'components/ImportFile';
import Dropzone from 'react-dropzone';
import FontIcon from 'material-ui/FontIcon';
import {WithContext as ReactTags} from 'react-tag-input';

import Waiting from '../Waiting';
import {grey500, grey800} from 'material-ui/styles/colors';
import alertify from 'alertifyjs';


const FileDroppedIndicator = ({file, onClose}) => {
  return (
      <div className='row vertical-center' style={{margin: '20px 0'}}>
        <span style={{marginRight: 20}}>{file.name} ---- {file.size} bytes</span>
        <FontIcon
        color={grey800}
        hoverColor={grey500}
        style={{fontSize: '16px'}}
        onClick={onClose}
        className='fa fa-close pointer'
        />
      </div>
    );
};

const FileDroppedError = ({error}) => {
  return (
    <div>
      <p>Oops. An error occurred in processing the file.</p>
      <ol>
        <li>The file was corrupt</li>
        <li>The file had hidden fields that we couldn't handle</li>
        <li>Our processing servers are experiencing downtime</li>
      </ol>
      <p>Here are a couple strategies that could potentially solve the problem.</p>
      <ol>
        <li>Refresh the page and try again</li>
        <li>Make sure that you are saving your Excel file with <code>.xlsx</code> format</li>
        <li>Open the Excel file you are uploading and copy the columns you need into a new Excel file to get rid of potentially hidden columns/formulas/etc</li>
        <li>Contact Support</li>
      </ol>
    </div>
    );
};

class DropFileWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listId: null,
      value: this.props.defaultValue || '',
      isFileDropped: false,
      isFileSubmitted: false,
      file: null,
      clicked: false,
      tags: [],
    };
    this.onDrop = this._onDrop.bind(this);
    this.onUploadClick = this._onUploadClick.bind(this);
    this.onFileClose = _ => this.setState({file: null, isFileDropped: false, value: this.props.defaultValue});
    this.handleAddition = this._handleAddition.bind(this);
    this.handleDelete = this._handleDelete.bind(this);
    this.handleDrag = this._handleDrag.bind(this);
    this.onNameChange = e => this.setState({value: e.target.value});
  }

  componentWillReceiveProps(nextProps) {
  }

  componentWillUnmount() {
    this.props.resetError();
  }

  _handleDelete(i) {
    this.setState({
      tags: this.state.tags.filter((tag, index) => index !== i)
    });
  }

  _handleAddition(tag) {
    if (this.state.tags.some(cTag => cTag.text === tag)) return;
    this.setState({
      tags: [
        ...this.state.tags,
        {
          id: this.state.tags.length + 1,
          text: tag
        }
      ]
    });
  }

  _handleDrag(tag, currPos, newPos) {
    const tags = [ ...this.state.tags ];

    // mutate array
    tags.splice(currPos, 1);
    tags.splice(newPos, 0, tag);

    // re-render
    this.setState({tags});
  }

  _onUploadClick() {
    window.Intercom('trackEvent', 'uploaded_sheet');
    mixpanel.track('uploaded_sheet');
    // create empty list first then upload file to populare the list
    this.setState({clicked: true});
    let listObj = {name: this.state.value};
    if (this.state.tags.length > 0) {
      listObj.tags = this.state.tags.map(tag => tag.text);
      mixpanel.track('add_list_tag');
    }
    const client = this.refs.clientname.getValue();
    if (client) {
      listObj.client = client;
      mixpanel.track('add_list_client');
    }
    this.props.createEmptyListObject(listObj)
    .then(response => {
      this.setState({listId: response.data.id});
      return response.data.id;
    })
    .then(listId => {
      let data = new FormData();
      data.append('file', this.state.file);
      this.setState({isFileSubmitted: true});
      this.props.uploadFile(listId, data)
      .then(_ => {
        if (!this.props.didInvalidate) this.props.router.push(`/headersnaming/${listId}`);
      });
    });
  }

  _onDrop(files) {
    if (files.length > 0) {
      const file = files[files.length - 1];
      const fileExtensionArray = file.name.split('.');
      const fileExtension = fileExtensionArray[fileExtensionArray.length - 1];
      if (fileExtension === 'xlsx') {
        this.setState({
          file,
          isFileDropped: true,
          value: fileExtensionArray[0],
        });
      } else {
        alertify.alert('File Dropped', `File dropped but not of accepted file types. We only accept .xlsx file format. You dropped a .${fileExtension} file.`, function() {});
      }
    } else {
      alertify.alert('File Dropped', 'File dropped but not of accepted file types. We only accept .xlsx file format.', function() {});
    }
  }

  render() {
    const state = this.state;
    const props = this.props;
    let renderNode;
    if (!state.isFileSubmitted) {
      renderNode = (
        <div style={styles.mainContainer}>
          <div className='row vertical-center'>
            <div className='large-2 medium-3 small-12 columns'>
              <span style={styles.label}>List Name</span>
            </div>
            <div className='large-10 medium-9 small-12 columns'>
              <TextField
              fullWidth
              id='filedrop-textfield'
              value={state.value}
              onChange={this.onNameChange}
              />
            </div>
          </div>
          <div className='row vertical-center'>
            <div className='large-2 medium-3 small-12 columns'>
              <span style={styles.label}>Client</span>
            </div>
            <div className='large-10 medium-9 small-12 columns'>
              <TextField fullWidth id='clientname' ref='clientname' placeholder='(Optional)' />
            </div>
          </div>
          <div className='row vertical-center'>
            <div className='large-2 medium-3 small-12 columns'>
              <span style={styles.label}>Tags</span>
            </div>
            <div className='large-10 medium-9 small-12 columns'>
              <ReactTags
              tags={state.tags}
              placeholder='Hit Enter after to add tag (Optional)'
              handleDelete={this.handleDelete}
              handleAddition={this.handleAddition}
              handleDrag={this.handleDrag}
              />
            </div>
          </div>
          <div style={styles.dropzoneContainer}>
          {state.isFileDropped ?
            <div className='row horizontal-center vertical-center' style={styles.details}>
              <FileDroppedIndicator file={state.file} onClose={this.onFileClose} />
            </div>
            : <Dropzone
              accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
              style={styles.dropzone.default} activeStyle={styles.dropzone.active} rejectStyle={styles.dropzone.reject}
              onDrop={this.onDrop}
              multiple={false}
              >
              <div>Try dropping an Excel (xlsx) file here, or click to select file to upload.</div>
            </Dropzone>}
          </div>
          <div className='vertical-center horizontal-center'>
            <RaisedButton
            primary
            label='Upload'
            disabled={state.clicked || state.file === null}
            onClick={this.onUploadClick}
            />
          </div>
          <div className='vertical-center horizontal-center' style={styles.details}>
            <span>For more details, you may refer to <a rel='noreferrer' href='https://help.newsai.co/tabulae-how-to/how-to-upload-a-media-list' target='_blank'>Upload Guide</a>.</span>
          </div>
        </div>
        );
    } else {
      renderNode = (
        <div className='horizontal-center' style={styles.waiting.container}>
          <Waiting
          isReceiving={props.isReceiving || props.headerIsReceiving}
          textStyle={styles.waiting.textStyle}
          text='Waiting for Columns to be processed...'
          />
        </div>
        );
    }
    if (props.didInvalidate) {
      return <FileDroppedError error={props.error}/>;
    }
    return renderNode
  }
}

const styles = {
  dropzone: {
    default: {
      borderWidth: 2,
      borderColor: 'black',
      borderStyle: 'dashed',
      borderRadius: 4,
      margin: 30,
      padding: 30,
      transition: 'all 0.4s',
    },
    active: {
      borderStyle: 'solid',
      borderColor: '#4FC47F'
    },
    reject: {
      borderStyle: 'solid',
      borderColor: '#DD3A0A'
    }
  },
  waiting: {
    textStyle: {marginTop: 20},
    container: {marginTop: 30}
  },
  details: {margin: '20px 0'},
  dropzoneContainer: {height: 180, minWidth: 500},
  mainContainer: {margin: '0 30px'},
  label: {color: grey500}
};

const mapStateToProps = (state, props) => {
  return {
    isProcessWaiting: state.fileReducer.isProcessWaiting,
    isReceiving: state.fileReducer.isReceiving,
    headerIsReceiving: state.headerReducer.isReceiving,
    headerReducer: state.headerReducer,
    didInvalidate: state.fileReducer.didInvalidate,
    errorMessage: state.fileReducer.error,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    createEmptyList: listname => dispatch(listActions.createEmptyList(listname)),
    createEmptyListObject: listObj => dispatch(listActions.createEmptyListObject(listObj)),
    uploadFile: (listId, file) => dispatch(fileActions.uploadFile(listId, file)),
    fetchHeaders: listId => dispatch(fileActions.fetchHeaders(listId)),
    resetError: _ => dispatch({type: 'RESET_FILE_REDUCER_ERROR'})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(DropFileWrapper));
