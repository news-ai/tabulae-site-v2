// @flow
import React, {Component} from 'react';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import cn from 'classnames';
import {connect} from 'react-redux';
import Draft, {
  Editor,
  EditorState,
  ContentState,
  SelectionState,
  Entity,
  RichUtils,
  AtomicBlockUtils,
  convertToRaw,
  convertFromRaw,
  CompositeDecorator,
  Modifier,
} from 'draft-js';
import draftRawToHtml from 'components/Email/EmailPanel/utils/draftRawToHtml';
// import htmlToContent from './utils/htmlToContent';
import convertFromHTML from 'components/Email/GeneralEditor/draft-convert/convertFromHTML'; // HACK!! using pull request that hasn't been merged into the package yet
import {actions as imgActions} from 'components/Email/EmailPanel/Image';
import {
  INLINE_STYLES,
  TYPEFACE_TYPES,
  POSITION_TYPES,
  FONTSIZE_TYPES
} from 'components/Email/EmailPanel/utils/typeConstants';
import {
  mediaBlockRenderer,
  getBlockStyle,
  blockRenderMap,
  styleMap,
  typefaceMap,
  fontsizeMap,
  customStyleFn
} from 'components/Email/EmailPanel/utils/renderers';
import {CONVERT_CONFIGS} from 'components/Email/EmailPanel/utils/convertToHTMLConfigs';

import linkifyLastWord from 'components/Email/EmailPanel/editorUtils/linkifyLastWord';
import linkifyContentState from 'components/Email/EmailPanel/editorUtils/linkifyContentState';
import stripSelectedInlineTagBlocks from 'components/Email/EmailPanel/editorUtils/stripSelectedInlineTagBlocks';
import applyDefaultFontSizeInlineStyle from 'components/Email/EmailPanel/editorUtils/applyDefaultFontSizeInlineStyle';
import toggleSingleInlineStyle from 'components/Email/EmailPanel/editorUtils/toggleSingleInlineStyle';
import handleLineBreaks from 'components/Email/EmailPanel/editorUtils/handleLineBreaks';
import applyFontSize from 'components/Email/EmailPanel/editorUtils/applyFontSize';
import normalizeListDepths from 'components/Email/EmailPanel/editorUtils/normalizeListDepths';

import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import Popover from 'material-ui/Popover';
import Paper from 'material-ui/Paper';
import Dropzone from 'react-dropzone';
import {blue700, grey700, grey800} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';

import CurlySpan from 'components/Email/EmailPanel/components/CurlySpan';
import Link from 'components/Email/EmailPanel/components/Link';
import Property from 'components/Email/EmailPanel/components/Property';
import Subject from 'components/Email/EmailPanel/Subject.jsx';
import EntityControls from 'components/Email/EmailPanel/components/EntityControls';
import InlineStyleControls from 'components/Email/EmailPanel/components/InlineStyleControls';
import FontSizeControls from 'components/Email/EmailPanel/components/FontSizeControls';
import ExternalControls from 'components/Email/EmailPanel/components/ExternalControls';
import PositionStyleControls from 'components/Email/EmailPanel/components/PositionStyleControls';
import TypefaceControls from 'components/Email/EmailPanel/components/TypefaceControls';
import ColorPicker from 'components/Email/EmailPanel/components/ColorPicker';
import alertify from 'alertifyjs';
import sanitizeHtml from 'sanitize-html';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import isURL from 'validator/lib/isURL';
import ValidationHOC from 'components/ValidationHOC';
import {OrderedSet} from 'immutable';

import {curlyStrategy, findEntities} from 'components/Email/EmailPanel/utils/strategies';

const placeholder = 'Tip: Use column names as variables in your template email by clicking on "Insert Property" or "+" icon in Subject, Body, or Toolbar.';

// const ENTITY_SKIP_TYPES = ['EMAIL_SIGNATURE'];

const sanitizeHtmlConfigs = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['span', 'img']),
  allowedAttributes: {
    p: ['style'],
    div: ['style'],
    span: ['style'],
    a: ['href'],
    img: ['src']
  },
  transformTags: {
    'font': function(tagName, attribs) {
      if (attribs.color) {
        if (attribs.style) attribs.style += `color: ${attribs.color};`;
        else attribs.style = `color: ${attribs.color};`;
      }
      return {
        tagName: 'span',
        attribs
      };
    },
  }
};

class BasicHtmlEditor extends Component {
  constructor(props) {
    super(props);
    this.decorator = new CompositeDecorator([
      {
        strategy: findEntities.bind(null, 'LINK'),
        component: Link,
        props: {
          updateEntityLink: newContentState => this.onChange(EditorState.push(this.state.editorState, newContentState, 'activate-entity-data'), 'force-emit-html')
        }
      },
      {
        strategy: findEntities.bind(null, 'PROPERTY'),
        component: Property
      },
      {
        strategy: curlyStrategy,
        component: CurlySpan
      }
    ]);

    this.ENTITY_CONTROLS = [
      {label: 'Hyperlink', action: this._manageLink.bind(this), icon: 'fa fa-link', entityType: 'LINK'}
    ];

    this.EXTERNAL_CONTROLS = [
      {
        label: 'Attachments',
        onToggle: this.props.onAttachmentPanelOpen,
        icon: 'fa fa-paperclip',
        isActive: _ => this.props.files.length > 0,
        tooltip: 'Attach File'
      },
      {
        label: 'Image Upload',
        onToggle: _ => this.setState({imagePanelOpen: true}),
        icon: 'fa fa-camera',
        isActive: _ => false,
      },
    ];

    this.state = {
      editorState: !isEmpty(this.props.bodyHtml) ?
        EditorState.createWithContent(convertFromHTML(CONVERT_CONFIGS)(this.props.bodyHtml), this.decorator) :
        EditorState.createEmpty(this.decorator),
      bodyHtml: this.props.bodyHtml || null,
      variableMenuOpen: false,
      variableMenuAnchorEl: null,
      styleBlockAnchorEl: null,
      filePanelOpen: false,
      imagePanelOpen: false,
      imageLink: '',
      currentDragTarget: undefined
    };

    this.focus = () => this.refs.editor.focus();
    this.onChange = this._onChange.bind(this);
    function emitHTML(editorState) {
      const contentState = applyDefaultFontSizeInlineStyle(editorState.getCurrentContent(), 'SIZE-10.5');
      let raw = convertToRaw(contentState);
      let rawToHtml = Object.assign({}, raw, {blocks: raw.blocks.map(block => {
        if (block.type === 'atomic') block.text = ' ';
        return block;
      })});
      let html = draftRawToHtml(rawToHtml);
      // console.log(raw);
      // console.log(html);
      this.props.onBodyChange(html, raw);
    }
    this.emitHTML = debounce(emitHTML, this.props.debounce);
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.toggleBlockType = this._toggleBlockType.bind(this);
    this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
    this.handleReturn = this._handleReturn.bind(this);
    this.addLink = this._addLink.bind(this);
    this.removeLink = this._removeLink.bind(this);
    this.manageLink = this._manageLink.bind(this);
    this.handlePastedText = this._handlePastedText.bind(this);
    this.handleDroppedFiles = this._handleDroppedFiles.bind(this);
    this.handleImage = this._handleImage.bind(this);
    this.onImageUploadClicked = this._onImageUploadClicked.bind(this);
    this.onOnlineImageUpload = this._onOnlineImageUpload.bind(this);
    this.handleBeforeInput = this._handleBeforeInput.bind(this);
    this.getEditorState = () => this.state.editorState;
    this.handleDrop = this._handleDrop.bind(this);
    this.cleanHTMLToContentState = this._cleanHTMLToContentState.bind(this);
    this.onInsertProperty = this.onInsertProperty.bind(this);
    this.onTab = this._onTab.bind(this);

    // cleanups
    this.onInsertPropertyClick = e => this.setState({variableMenuOpen: true, variableMenuAnchorEl: e.currentTarget});
    this.onVariableMenuClose = _ => this.setState({variableMenuOpen: false});
    this.onVariableMenuOpen = e => this.setState({variableMenuOpen: true, variableMenuAnchorEl: e.currentTarget});
    this.onImageDropzoneOpen = _ => this.imgDropzone.open();
    this.onImagePanelOpen = _ => this.setState({imagePanelOpen: false});
    this.onFontSizeToggle = selectedSize => this.onChange(applyFontSize(this.state.editorState, selectedSize), 'force-emit-html');
    this.onTypefaceToggle = newTypeface => this.onChange(toggleSingleInlineStyle(this.state.editorState, newTypeface, typefaceMap), 'force-emit-html');
    this.onColorToggle = color => this.onChange(toggleSingleInlineStyle(this.state.editorState, color, undefined, 'COLOR-'), 'force-emit-html');
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.templateChanged && nextProps.templateChanged) {
      console.log('change template');
      this.props.turnOffTemplateChange();
      let newContent;
      let editorState;
      if (nextProps.savedBodyHtml) {
        this.setState({bodyHtml: nextProps.bodyHtml});
        newContent = this.cleanHTMLToContentState(nextProps.savedBodyHtml);
        this.props.clearCacheBodyHtml();
      } else {
        newContent = convertFromRaw(nextProps.savedEditorState);
      }

      if (nextProps.templateChangeType === 'append' && nextProps.templateEntityType) {
        // email signature should append to existing content
        let oldContent = this.state.editorState.getCurrentContent();
        oldContent = stripSelectedInlineTagBlocks(oldContent, nextProps.templateEntityType);
        const newContentSelection = SelectionState
          .createEmpty()
          .merge({
            anchorKey: newContent.getFirstBlock().getKey(),
            anchorOffset: 0,
            focusKey: newContent.getLastBlock().getKey(),
            focusOffset: newContent.getLastBlock().getLength()
          });
        newContent = Modifier.applyInlineStyle(
          newContent,
          newContentSelection,
          'EMAIL_SIGNATURE'
          );
        newContent = Modifier.splitBlock(
            newContent,
            SelectionState.createEmpty().merge({
              anchorKey: newContent.getFirstBlock().getKey(),
              anchorOffset: 0,
              focusKey: newContent.getFirstBlock().getKey(),
              focusOffset: 0
            })
          );
        newContent = Modifier.replaceWithFragment(
            newContent,
            SelectionState.createEmpty().merge({
              anchorKey: newContent.getFirstBlock().getKey(),
              anchorOffset: 0,
              focusKey: newContent.getFirstBlock().getKey(),
              focusOffset: 0
            }),
            oldContent.getBlockMap()
          );

        // merge content to editorState first
        editorState = EditorState.push(this.state.editorState, newContent, 'insert-fragment');
      } else {
        editorState = EditorState.push(this.state.editorState, newContent, 'insert-fragment');
      }
      this.onChange(editorState);
    }
  }

  componentWillUnmount() {
    this.props.clearAttachments();
  }

  onInsertProperty(propertyType) {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      alertify.alert('Editor Warning', 'The editor cursor must be focused. Select a place in the editor where you would like to insert the property.');
      return;
    }
    const contentStateWithEntity = editorState.getCurrentContent().createEntity('PROPERTY', 'IMMUTABLE', {property: propertyType});
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    const newEditorState = EditorState.push(
      editorState,
      Modifier.insertText(contentStateWithEntity, selection, propertyType, undefined, entityKey),
      'insert-fragment'
      );
    this.onChange(newEditorState);
    this.setState({variableMenuOpen: false});
  }

  _cleanHTMLToContentState(html) {
    let editorState;
    const configuredContent = convertFromHTML(CONVERT_CONFIGS)(html);
    // need to process all image entities into ATOMIC blocks because draft-convert doesn't have access to contentState
    editorState = EditorState.push(this.state.editorState, configuredContent, 'insert-fragment');
    // FIRST PASS TO REPLACE IMG WITH ATOMIC BLOCKS
    editorState.getCurrentContent().getBlockMap().forEach((block, key) => {
      block.findEntityRanges(
        (character) => {
          const entityKey = character.getEntity();
          if (entityKey === null) return false;
          if (editorState.getCurrentContent().getEntity(entityKey).getType() === 'IMAGE') {
            editorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
          }
          return (editorState.getCurrentContent().getEntity(entityKey).getType() === 'IMAGE');
        },
        (start, end) => {}
        );
    });

    // SECOND PASS TO REMOVE ORPHANED NON-ATOMIC BLOCKS WITH IMG ENTITIES
    // rebuild contentState with valid blocks
    let truncatedBlocks = [];
    let okayBlock = true; // check if a block is atomic and has image
    let ignoreRest = false;
    editorState.getCurrentContent().getBlockMap().forEach((block, key) => {
      ignoreRest = false;
      block.findEntityRanges(
        (character) => {
          const entityKey = character.getEntity();
          if (ignoreRest || entityKey === null) {
            return false;
          }
          if (editorState.getCurrentContent().getEntity(entityKey).getType() === 'IMAGE') {
            if (block.getType() !== 'atomic') {
              okayBlock = false;
              ignoreRest = true;
            }
          }
        },
        (state, end) => {});
      if (okayBlock) truncatedBlocks.push(block);
    });
    const cleanedContentState = ContentState.createFromBlockArray(truncatedBlocks);
    return cleanedContentState;
  }

  _onChange(editorState, onChangeType) {
    const newEditorState = editorState;
    this.setState({editorState: newEditorState});

    const previousContent = this.state.editorState.getCurrentContent();

    // only emit html when content changes
    if (previousContent !== newEditorState.getCurrentContent() || onChangeType === 'force-emit-html') {
      this.emitHTML(editorState);
    }
  }

  _handleBeforeInput(lastInsertedChar, editorState) {
    if (editorState.getCurrentInlineStyle().has('EMAIL_SIGNATURE')) {
      let contentState = editorState.getCurrentContent();
      contentState = Modifier.removeInlineStyle(
            contentState,
            SelectionState.createEmpty().merge({
              anchorKey: contentState.getFirstBlock().getKey(),
              focusKey: contentState.getLastBlock().getKey(),
              anchorOffset: 0,
              focusOffset: contentState.getLastBlock().getLength()
            }),
            'EMAIL_SIGNATURE'
            );
      contentState = Modifier.insertText(
        contentState,
        editorState.getSelection(),
        lastInsertedChar,
        editorState.getCurrentInlineStyle().remove('EMAIL_SIGNATURE')
        );
      const newEditorState = EditorState.push(editorState, contentState, 'insert-fragment');

      this.onChange(
        newEditorState,
        'force-emit-html'
        );
      return 'handled';
    }

    if (lastInsertedChar === ' ') {
      const newEditorState = linkifyLastWord(' ', editorState);
      if (newEditorState) {
        this.onChange(newEditorState, 'force-emit-html');
        return 'handled';
      }
    }
  
    return 'not-handled';
  }


  _handleReturn(e) {
    let handled = 'not-handled';
    if (e.key === 'Enter') {
      const editorState = linkifyLastWord('\n', this.state.editorState);
      if (editorState) {
        this.onChange(editorState);
        return 'handled';
      }
    }
    return handled;
  }

  _handleKeyCommand(command) {
    const {editorState} = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      ),
    'force-emit-html'
    );
  }
  
  _onTab(e) {
    const newEditorState = RichUtils.onTab(e, this.state.editorState, 6);
    this.onChange(newEditorState, 'force-emit-html');
  }

  _manageLink() {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    if (selection.isCollapsed()) return;
    const startKey = selection.getStartKey();
    const startOffset = selection.getStartOffset();
    const endOffset = selection.getEndOffset();
    const blockAtLinkBeginning = contentState.getBlockForKey(startKey);
    let i;
    let linkKey;
    let hasEntityType = false;
    for (i = startOffset; i < endOffset; i++) {
      linkKey = blockAtLinkBeginning.getEntityAt(i);
      if (linkKey !== null) {
        const type = contentState.getEntity(linkKey).getType();
        if (type === 'LINK') {
          hasEntityType = true;
          break;
        }
      }
    }
    if (hasEntityType) {
      // REMOVE LINK
      this.removeLink();
    } else {
      // ADD LINK
      this.addLink();
    }
  }

  _addLink(/* e */) {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    if (selection.isCollapsed()) return;
    alertify.prompt(
      '',
      'Enter a URL',
      'http://',
      (e, url) => {
        const entityKey = contentState.createEntity('LINK', 'MUTABLE', {url}).getLastCreatedEntityKey();
        this.onChange(RichUtils.toggleLink(editorState, selection, entityKey));
      },
      _ => {});
  }

  _removeLink(/* e */) {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) {
      return;
    }
    this.onChange(RichUtils.toggleLink(editorState, selection, null));
  }

  _handlePastedText(text, html) {
    const {editorState} = this.state;
    let blockMap;
    // let blockArray;
    let contentState;

    if (html) {
      console.log('pasted', 'html');
      const saneHtml = sanitizeHtml(html, sanitizeHtmlConfigs);
      contentState = convertFromHTML(CONVERT_CONFIGS)(saneHtml);
    } else {
      console.log('pasted', 'plain text');
      contentState = ContentState.createFromText(text.trim());
    }

    contentState = handleLineBreaks(contentState);
    contentState = normalizeListDepths(contentState);
    const newEditorState = linkifyContentState(editorState, contentState);

    this.onChange(newEditorState);
    return 'handled';
  }

  _handleImage(url) {
    const {editorState} = this.state;
    const entityKey = editorState.getCurrentContent().createEntity('IMAGE', 'MUTABLE', {
      src: url,
      size: '100%',
      imageLink: '#',
      align: 'left'
    }).getLastCreatedEntityKey();

    const newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
    return newEditorState;
  }

  _handleDroppedFiles(selection, files) {
    files.map(file => {
      if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
        if (file.size <= 5000000) {
          this.props.uploadImage(file)
          .then(url => {
            const newEditorState = this.handleImage(url);
            this.onChange(newEditorState, 'force-emit-html');
          });
        } else {
          alertify.warning(`Image size cannot exceed 5MB. The image dropped was ${(file.size / 1000000).toFixed(2)}MB`);
        }
      } else {
        alertify.warning(`Image type must be PNG or JPEG. The file dropped was ${file.type}.`);
      }
    });
  }

  _onImageUploadClicked(acceptedFiles, rejectedFiles) {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    this.handleDroppedFiles(selection, acceptedFiles);
  }

  _onOnlineImageUpload() {
    if (isURL(this.state.imageLink)) {
      this.props.saveImageData(this.state.imageLink);
      setTimeout(_ => {
        const newEditorState = this.handleImage(this.state.imageLink);
        this.onChange(newEditorState, 'force-emit-html');
        this.setState({imageLink: ''});
      }, 50);
    }
  }

  _handleDrop(dropSelection, e) {
    if (this.state.currentDragTarget) {
      const blockKey = this.state.currentDragTarget;
      const atomicBlock = this.state.editorState.getCurrentContent().getBlockForKey(this.state.currentDragTarget);
      const newEditorState = AtomicBlockUtils.moveAtomicBlock(this.state.editorState, atomicBlock, dropSelection);
      this.onChange(newEditorState);
      return true;
    }
    return false;
  }

  render() {
    const {editorState} = this.state;
    const props = this.props;
    const state = this.state;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.

    const className = cn('RichEditor-editor', {
      'RichEditor-hidePlaceholder': editorState.getCurrentContent().hasText() &&
      editorState.getCurrentContent().getBlockMap().first().getType() !== 'unstyled'
    });

    return (
      <div>
        <Dialog actions={[<FlatButton label='Close' onClick={this.onImagePanelOpen}/>]}
        autoScrollBodyContent title='Upload Image' open={state.imagePanelOpen} onRequestClose={_ => this.setState({imagePanelOpen: false})}>
          <div style={imgPanelStyles.label} className='horizontal-center'>Drag n' Drop the image file into the editor</div>
          <div className='horizontal-center'>OR</div>
          <div className='vertical-center horizontal-center' style={imgPanelStyles.panelContentContainer}>
            <div>
              <ValidationHOC rules={[{validator: isURL, errorMessage: 'Not a valid url.'}]}>
              {({onValueChange, errorMessage}) => (
                <TextField
                errorText={errorMessage}
                hintText='Image link here'
                floatingLabelText='Image link here'
                value={state.imageLink}
                onChange={e => {
                  // for validation
                  onValueChange(e.target.value);
                  // for updating value
                  this.setState({imageLink: e.target.value});
                }}
                />)}
              </ValidationHOC>
              <RaisedButton style={imgPanelStyles.submitBtn} label='Submit' onClick={this.onOnlineImageUpload}/>
            </div>
          </div>
          <div className='horizontal-center'>OR</div>
          <div className='vertical-center horizontal-center' style={imgPanelStyles.uploadBtn}>
            <RaisedButton label='Upload from File' onClick={this.onImageDropzoneOpen}/>
          </div>
        </Dialog>

        <Dropzone ref={(node) => (this.imgDropzone = node)} style={styles.dropzone} onDrop={this.onImageUploadClicked}/>
        <Popover
        open={state.variableMenuOpen}
        anchorEl={state.variableMenuAnchorEl}
        anchorOrigin={styles.anchorOrigin}
        targetOrigin={styles.targetOrigin}
        onRequestClose={this.onVariableMenuClose}
        >
          <Menu desktop>
          {props.fieldsmap
            .filter(field => !field.hidden)
            .map((field, i) =>
            <MenuItem key={i} primaryText={field.name} onClick={_ => this.onInsertProperty(field.name)}/>)}
          </Menu>
        </Popover>
        <div style={{paddingTop: 70}} >
          <Subject
          width={props.width}
          onSubjectChange={props.onSubjectChange}
          subjectHtml={props.subjectHtml}
          fieldsmap={props.fieldsmap}
          />
          <div style={styles.editorContainer}>
            <div className={className} onClick={this.focus}>
              <Editor
              blockStyleFn={getBlockStyle}
              blockRendererFn={
                mediaBlockRenderer({
                  getEditorState: this.getEditorState,
                  onChange: this.onChange,
                  propagateDragTarget: blockKey => this.setState({currentDragTarget: blockKey})
                })}
              blockRenderMap={extendedBlockRenderMap}
              onTab={this.onTab}
              customStyleFn={customStyleFn}
              customStyleMap={styleMap}
              editorState={editorState}
              handleKeyCommand={this.handleKeyCommand}
              handleReturn={this.handleReturn}
              handlePastedText={this.handlePastedText}
              handleDroppedFiles={this.handleDroppedFiles}
              handleBeforeInput={this.handleBeforeInput}
              handleDrop={this.handleDrop}
              onChange={this.onChange}
              placeholder={placeholder}
              ref='editor'
              spellCheck
              />
            </div>
            <RaisedButton
            style={styles.insertPropertyBtn.style}
            label='Insert Property'
            labelStyle={styles.insertPropertyBtn.labelStyle}
            onClick={this.onInsertPropertyClick}
            />
          </div>
        </div>
        <div className='horizontal-center' style={styles.controlsContainer} >
          <Paper zDepth={1} style={controlsStyle}>
            <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
            inlineStyles={INLINE_STYLES}
            />
            <EntityControls
            editorState={editorState}
            entityControls={this.ENTITY_CONTROLS}
            />
            <ExternalControls
            editorState={editorState}
            externalControls={this.EXTERNAL_CONTROLS}
            active={props.files.length > 0}
            />
            <PositionStyleControls
            editorState={editorState}
            blockTypes={POSITION_TYPES}
            onToggle={this.toggleBlockType}
            />
            <FontSizeControls
            editorState={editorState}
            onToggle={this.onFontSizeToggle}
            inlineStyles={FONTSIZE_TYPES}
            />
            <TypefaceControls
            editorState={editorState}
            onToggle={this.onTypefaceToggle}
            inlineStyles={TYPEFACE_TYPES}
            />
            <ColorPicker
            editorState={editorState}
            onToggle={this.onColorToggle}
            />
            <IconButton
            iconStyle={styles.insertPropertyIcon.iconStyle}
            style={styles.insertPropertyIcon.style}
            iconClassName='fa fa-plus pointer'
            onClick={this.onVariableMenuOpen}
            tooltip='Insert Property'
            tooltipPosition='top-right'
            />
          </Paper>
        </div>
      </div>
    );
  }
}

const styles = {
  // styleBlockIconContainer: {padding: 3, marginRight: 10},
  insertPropertyIcon: {
    iconStyle: {width: 14, height: 14, fontSize: '14px', color: grey800},
    style: {width: 28, height: 28, padding: 6}
  },
  insertPropertyBtn: {
    labelStyle: {textTransform: 'none'},
    style: {margin: 10}
  },
  editorContainer: {
    height: '100%',
    marginBottom: 150,
    overflowY: 'scroll',
  },
  anchorOrigin: {horizontal: 'left', vertical: 'bottom'},
  targetOrigin: {horizontal: 'left', vertical: 'top'},
  dropzone: {display: 'none'},
  controlsContainer: {
    width: '100%',
    position: 'fixed',
    zIndex: 200,
    bottom: 80,
  }
};

const imgPanelStyles = {
  uploadBtn: {margin: '10px 0'},
  submitBtn: {margin: 5},
  panelContentContainer: {margin: '15px 0'},
  label: {margin: '10px 0'},
};

const controlsStyle = {
  display: 'flex',
  alignItems: 'center',
  height: 40,
  backgroundColor: '#ffffff',
};

const extendedBlockRenderMap = Draft.DefaultDraftBlockRenderMap.merge(blockRenderMap);

const mapStateToProps = (state, props) => {
  return {
    person: state.personReducer.person,
    files: state.emailAttachmentReducer.attached,
    templateChanged: state.emailDraftReducer.templateChanged,
    savedEditorState: state.emailDraftReducer.editorState,
    savedBodyHtml: state.emailDraftReducer.bodyHtml,
    templateChangeType: state.emailDraftReducer.templateChangeType,
    templateEntityType: state.emailDraftReducer.templateEntityType,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    setAttachments: files => dispatch({type: 'SET_ATTACHMENTS', files}),
    clearAttachments: _ => dispatch({type: 'CLEAR_ATTACHMENTS'}),
    uploadImage: file => dispatch(imgActions.uploadImage(file)),
    saveImageData: src => dispatch({type: 'IMAGE_UPLOAD_RECEIVE', src}),
    onAttachmentPanelOpen: _ => dispatch({type: 'TURN_ON_ATTACHMENT_PANEL'}),
    turnOffTemplateChange: _ => dispatch({type: 'TEMPLATE_CHANGE_OFF'}),
    clearCacheBodyHtml: _ => dispatch({type: 'CLEAR_CACHE_BODYHTML'})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BasicHtmlEditor);
