// @flow
import React from 'react';
import debounce from 'lodash/debounce';
import cn from 'classnames';
import {connect} from 'react-redux';
import Draft, {
  Editor,
  EditorState,
  ContentState,
  Entity,
  RichUtils,
  AtomicBlockUtils,
  convertToRaw,
  convertFromRaw,
  CompositeDecorator,
  Modifier,
  SelectionState,
  getDefaultKeyBinding,
  KeyBindingUtil,
  // getVisibleSelectionRect
} from 'draft-js';
import keycode from 'keycode';
import draftRawToHtml from 'components/Email/EmailPanel/utils/draftRawToHtml';
// import htmlToContent from './utils/htmlToContent';
import {convertToHTML} from 'draft-convert';
import convertFromHTML from './draft-convert/convertFromHTML'; // HACK!! using pull request that hasn't been merged into the package yet
import {actions as imgActions} from 'components/Email/EmailPanel/Image';
import {INLINE_STYLES, BLOCK_TYPES, POSITION_TYPES, FONTSIZE_TYPES, TYPEFACE_TYPES} from 'components/Email/EmailPanel/utils/typeConstants';
import {mediaBlockRenderer, getBlockStyle, blockRenderMap, styleMap, fontsizeMap, typefaceMap, customStyleFn} from 'components/Email/EmailPanel/utils/renderers';
import {CONVERT_CONFIGS} from 'components/Email/EmailPanel/utils/convertToHTMLConfigs';

import linkifyLastWord from 'components/Email/EmailPanel/editorUtils/linkifyLastWord';
import linkifyContentState from 'components/Email/EmailPanel/editorUtils/linkifyContentState';
import applyDefaultFontSizeInlineStyle from 'components/Email/EmailPanel/editorUtils/applyDefaultFontSizeInlineStyle';
import toggleSingleInlineStyle from 'components/Email/EmailPanel/editorUtils/toggleSingleInlineStyle';
import handleLineBreaks from 'components/Email/EmailPanel/editorUtils/handleLineBreaks';
import applyFontSize from 'components/Email/EmailPanel/editorUtils/applyFontSize';
import stripDuplicateFontSize from 'components/Email/EmailPanel/editorUtils/stripDuplicateFontSize';
import getSelectedSplitBlocks from 'components/Email/EmailPanel/editorUtils/getSelectedSplitBlocks';
import normalizeListDepths from 'components/Email/EmailPanel/editorUtils/normalizeListDepths';

import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import Dropzone from 'react-dropzone';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';

import CurlySpan from 'components/Email/EmailPanel/components/CurlySpan';
import Subject from 'components/Email/EmailPanel/Subject.jsx';
import Link from 'components/Email/EmailPanel/components/Link';
import Property from 'components/Email/EmailPanel/components/Property';
import EntityControls from 'components/Email/EmailPanel/components/EntityControls';
import InlineStyleControls from 'components/Email/EmailPanel/components/InlineStyleControls';
import BlockStyleControls from 'components/Email/EmailPanel/components/BlockStyleControls';
import FontSizeControls from 'components/Email/EmailPanel/components/FontSizeControls';
import TypefaceControls from 'components/Email/EmailPanel/components/TypefaceControls';
import ExternalControls from 'components/Email/EmailPanel/components/ExternalControls';
import PositionStyleControls from 'components/Email/EmailPanel/components/PositionStyleControls';
import ColorPicker from 'components/Email/EmailPanel/components/ColorPicker';
import alertify from 'alertifyjs';
// import alertify from 'utils/alertify';
import sanitizeHtml from 'sanitize-html';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import isURL from 'validator/lib/isURL';
import ValidationHOC from 'components/ValidationHOC';

import {grey300, grey400, grey500, grey600, grey700} from 'material-ui/styles/colors';
import {curlyStrategy, findEntities} from 'components/Email/EmailPanel/utils/strategies';
import styled from 'styled-components';
import {List} from 'immutable';

const placeholder = 'Tip: Use column names as variables in your template email. E.g. "Hi {firstname}! It was so good to see you at {location} the other day...';

const defaultControlsStyle = {
  height: 40,
  zIndex: 200,
  paddingLeft: 10,
  paddingRight: 10,
  backgroundColor: '#ffffff',
};

const icon = {
  iconStyle: {width: 14, height: 14, fontSize: '14px', color: grey600},
  style: {width: 28, height: 28, padding: 7, position: 'fixed'}
};

const BodyEditorContainer = styled.div`
  width: ${props => props.width ? props.width : 400}px;
  height: ${props => props.height !== 'unlimited' && `${props.height}px`};
`;

const getVisibleSelectionRect = (global) => {
  const selection = global.getSelection();
  if (!selection.rangeCount) {
    return null;
  }

  const range = selection.getRangeAt(0);
  if (range === null) return null;
  const boundingRect = range.getBoundingClientRect();
  const {top, right, bottom, left} = boundingRect;

  // When a re-render leads to a node being removed, the DOM selection will
  // temporarily be placed on an ancestor node, which leads to an invalid
  // bounding rect. Discard this state.
  if (top === 0 && right === 0 && bottom === 0 && left === 0) {
    return null;
  }

  return boundingRect;
}

const sanitizeHtmlConfigs = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['span', 'img']),
  allowedAttributes: {
    p: ['style'],
    div: ['style'],
    span: ['style'],
    a: ['href'],
    img: ['src', 'style']
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

const myKeyBindingFn = (e) => {
  if (keycode(e) === 'c' && KeyBindingUtil.hasCommandModifier(e)) {
    return 'body-editor-copy';
  }
  return getDefaultKeyBinding(e);
}

class GeneralEditor extends React.Component {
  constructor(props) {
    super(props);
    this.ENTITY_CONTROLS = [
      {label: 'Hyperlink', action: this._manageLink.bind(this), icon: 'fa fa-link', entityType: 'LINK'}
    ];

    this.EXTERNAL_CONTROLS = [
      {
        label: 'Image Upload',
        onToggle: _ => this.setState({imagePanelOpen: true}),
        icon: 'fa fa-camera',
        isActive: _ => false,
      }
    ];


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

    this.state = {
      editorState: this.props.rawBodyContentState ?
      stripDuplicateFontSize(EditorState.createWithContent(convertFromRaw(this.props.rawBodyContentState), this.decorator)) :
      EditorState.createEmpty(this.decorator),
      variableMenuOpen: false,
      variableMenuAnchorEl: null,
      isStyleBlockOpen: true,
      styleBlockAnchorEl: null,
      filePanelOpen: false,
      imagePanelOpen: false,
      imageLink: '',
      showToolbar: false,
      onHoverToolbar: false,
      currentFocusPosition: null
    };

    this.focus = () => {
      this.refs.editor.focus();
      this.setState({showToolbar: true});
    }
    this.onChange = this._onChange.bind(this);
    this.handleTouchTap = (event) => {
      event.preventDefault();
      this.setState({
        variableMenuOpen: true,
        variableMenuAnchorEl: event.currentTarget,
      });
    };
    function emitHTML(editorState) {
      let contentState = editorState.getCurrentContent();
      contentState = applyDefaultFontSizeInlineStyle(contentState, 'SIZE-10.5');
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
      let raw = convertToRaw(contentState);
      let rawToHtml = Object.assign({}, raw, {blocks: raw.blocks.map(block => {
        if (block.type === 'atomic') block.text = ' ';
        return block;
      })});
      // console.log(rawToHtml);
      // console.log(JSON.stringify(rawToHtml));
      let html = draftRawToHtml(rawToHtml);
      // console.log(html);
      // used to generate testable html string
      const escapedHtml = html.replace(/"/g, "&quot;").replace(/'/g, "\\'").replace(/\n/g, '\\n');
      // console.log(escapedHtml);
      // console.log(raw);
      this.props.onBodyChange(html, raw);
    }
    this.emitHTML = debounce(emitHTML, this.props.debounce);
    this.insertText = this._insertText.bind(this);
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.toggleBlockType = this._toggleBlockType.bind(this);
    this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
    this.handleReturn = this._handleReturn.bind(this);
    this.addLink = this._addLink.bind(this);
    this.removeLink = this._removeLink.bind(this);
    this.manageLink = this._manageLink.bind(this);
    this.onCheck = _ => this.setState({isStyleBlockOpen: !this.state.isStyleBlockOpen});
    this.handlePastedText = this._handlePastedText.bind(this);
    this.handleDroppedFiles = this._handleDroppedFiles.bind(this);
    this.handleImage = this._handleImage.bind(this);
    this.onImageUploadClicked = this._onImageUploadClicked.bind(this);
    this.onOnlineImageUpload = this._onOnlineImageUpload.bind(this);
    this.handleBeforeInput = this._handleBeforeInput.bind(this);
    this.getEditorState = () => this.state.editorState;
    this.handleDrop = this._handleDrop.bind(this);
    this.onFontSizeToggle = selectedSize => this.onChange(applyFontSize(this.state.editorState, selectedSize), 'force-emit-html');
    this.onTypefaceToggle = newTypeface => this.onChange(toggleSingleInlineStyle(this.state.editorState, newTypeface, typefaceMap), 'force-emit-html');
    this.onColorToggle = color => this.onChange(toggleSingleInlineStyle(this.state.editorState, color, undefined, 'COLOR-'), 'force-emit-html');
    this.cleanHTMLToContentState = this._cleanHTMLToContentState.bind(this);
    this.onTab = this._onTab.bind(this);
    this.getSelectDOMRect = () => {
      let rect = getVisibleSelectionRect(window);
      if (rect === null) {
        const node = window.getSelection().focusNode;
        if (node === null) return null;
        const nodeAttribute = node.getAttribute('data-offset-key');
        if (nodeAttribute === null) return null;
        rect = node.getBoundingClientRect();
      }
      // prevent showing property icon for Subject
      // TODO: use the same buttom to add property for Subject eventually
      if (!this.state.editorState.getSelection().isCollapsed() || !this.state.editorState.getSelection().getHasFocus()) return null;
      return {top: rect.top - 10, bottom: rect.bottom, left: rect.left, right: rect.right} ;
    };
    this.onPropertyIconClick = e => {
      alertify.prompt('Name the Property to be Inserted', '', '',
        (evt, value) => this.onInsertProperty(value),
        function() {});
    };
    this.getPropertyIconLocation = debounce(_ => {
      const currentFocusPosition = this.getSelectDOMRect();
      if (currentFocusPosition !== null) this.setState({currentFocusPosition});
    }, 2);

    this.removePropertyLocation = _ => this.setState({currentFocusPosition: null});

  }

  componentWillMount() {
    if (this.props.bodyContent) {
      let editorState;
      let contentState;

      if (typeof this.props.bodyContent === 'string') {
        contentState = this.cleanHTMLToContentState(this.props.bodyContent);
      } else {
        contentState = convertFromRaw(this.props.bodyContent);
      }
      editorState = EditorState.push(this.state.editorState, contentState, 'insert-fragment');
      this.onChange(editorState);
    }
  }

  componentDidMount() {
    if (this.props.allowGeneralizedProperties) window.addEventListener('scroll', this.getPropertyIconLocation);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.bodyContent !== nextProps.bodyContent && this.props.allowReplacement) {
      let newContent;
      let editorState;
      // is HTML
      if (nextProps.bodyContent) {
        if (typeof nextProps.bodyContent === 'string') newContent = this.cleanHTMLToContentState(nextProps.bodyContent);
        else newContent = convertFromRaw(nextProps.bodyContent);
        editorState = stripDuplicateFontSize(EditorState.push(this.state.editorState, newContent, 'insert-fragment'));
      } else {
        editorState = EditorState.createEmpty(this.decorator);
      }
      this.onChange(editorState);
    }
  }

  componentWillUnmount() {
    if (this.props.allowGeneralizedProperties) window.removeEventListener('scroll', this.getPropertyIconLocation);
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
        (start, end) => {});
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
    let newEditorState = editorState;
    this.setState({editorState: newEditorState});
    this.getPropertyIconLocation();

    let previousContent = this.state.editorState.getCurrentContent();

    // only emit html when content changes
    if (previousContent !== newEditorState.getCurrentContent() || onChangeType === 'force-emit-html') {
      this.emitHTML(editorState);
    }
  }

  _handleBeforeInput(lastInsertedChar) {
    let handled = 'not-handled';
    if (lastInsertedChar === ' ') {
      const editorState = linkifyLastWord(' ', this.state.editorState);
      if (editorState) {
        this.onChange(editorState);
        handled = 'handled';
      }
    }
    return handled;
  }

  _insertText(replaceText) {
    const {editorState} = this.state;
    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const newContent = Modifier.insertText(content, selection, '{' + replaceText + '}');
    const newEditorState = EditorState.push(editorState, newContent, 'insert-fragment');
    this.onChange(newEditorState);
  }

  _onTab(e) {
    const newEditorState = RichUtils.onTab(e, this.state.editorState, 6);
    this.onChange(newEditorState, 'force-emit-html');
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
    if (command === 'body-editor-copy') {
      const selectedAsContentState = getSelectedSplitBlocks(editorState);
      const raw = convertToRaw(selectedAsContentState);
      let rawToHtml = Object.assign({}, raw, {blocks: raw.blocks.map(block => {
        if (block.type === 'atomic') block.text = ' ';
        return block;
      })});
      let html = draftRawToHtml(rawToHtml);
      const handler = e => {
        e.clipboardData.setData('text/plain', selectedAsContentState.getPlainText());
        e.clipboardData.setData('text/html', html);
        e.preventDefault();
        document.removeEventListener('copy', handler, true);
      }
      document.addEventListener('copy', handler, true);
      document.execCommand('copy');
      return 'handled';
    }
    if (newState) {
      this.onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      ),
      'force-emit-html'
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
        const entityKey = contentState
        .createEntity('LINK', 'MUTABLE', {url}).getLastCreatedEntityKey();
        this.onChange(RichUtils.toggleLink(editorState, selection, entityKey), 'force-emit-html');
      },
      _ => {});
  }

  _removeLink(/* e */) {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) {
      return;
    }
    this.onChange(RichUtils.toggleLink(editorState, selection, null), 'force-emit-html');
  }

  _handlePastedText(text, html) {
    const {editorState} = this.state;
    let blockMap;
    // let blockArray;
    let contentState;

    if (html) {
      // console.log('pasted', 'html');
      // console.log(html);
      const saneHtml = sanitizeHtml(html, sanitizeHtmlConfigs);
      // console.log(saneHtml);
      contentState = convertFromHTML(CONVERT_CONFIGS)(saneHtml);
      // console.log('convertFromHTML', convertToRaw(contentState));
    } else {
      // console.log('pasted', 'plain text');
      contentState = ContentState.createFromText(text.trim());
      // console.log('plain text', convertToRaw(contentState));
    }

    // console.log(convertToRaw(contentState));
    contentState = handleLineBreaks(contentState);
    // console.log('handleLineBreaks', convertToRaw(contentState));
    contentState = normalizeListDepths(contentState);
    // console.log('normalizeListDepths', convertToRaw(contentState));

    let newEditorState = linkifyContentState(editorState, contentState);
    // console.log('linkifyContentState', convertToRaw(newEditorState.getCurrentContent()));

    this.onChange(newEditorState, 'force-emit-html');
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
    const props = this.props;
    const imageLink = this.state.imageLink;
    if (isURL(imageLink)) {
      setTimeout(_ => {
        const newEditorState = this.handleImage(imageLink);
        this.onChange(newEditorState);
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

  onInsertProperty(propertyType) {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      alertify.alert('Editor Warning', 'The editor cursor must be focused and not highlighted to insert property.');
      return;
    }
    const contentStateWithEntity = editorState.getCurrentContent().createEntity('PROPERTY', 'IMMUTABLE', {property: propertyType});
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    const newEditorState = EditorState.push(
      editorState,
      Modifier.insertText(contentStateWithEntity, selection, propertyType, undefined, entityKey),
      'insert-fragment'
      );
    this.onChange(newEditorState, 'force-emit-html');
    setTimeout(_ => this.setState({currentFocusPosition: null}), 5);
  }

  render() {
    const {editorState} = this.state;
    const props = this.props;
    const state = this.state;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    const containerClassName = props.containerClassName || 'RichEditor-editor';
    const className = cn(
      containerClassName,
      {'RichEditor-hidePlaceholder': editorState.getCurrentContent().hasText() && editorState.getCurrentContent().getBlockMap().first().getType() !== 'unstyled'}
      );
    let customStyleMap = styleMap;
    let controlsStyle = props.controlsStyle ? Object.assign({}, defaultControlsStyle, props.controlsStyle): defaultControlsStyle;
    
    const showToolbar = props.allowToolbarDisappearOnBlur ? state.showToolbar : true;
    if (props.allowToolbarDisappearOnBlur) controlsStyle.display = showToolbar ? 'flex' : 'none';
    // if (this.outerContainer) {

    // console.log(this.outerContainer.offsetTop - document.body.scrollTop);
    // console.log(controlsStyle);

    // }
    // console.log(editorState.getCurrentInlineStyle().toJS());
    // console.log(draftRawToHtml(convertToRaw(editorState.getCurrentContent())));
    // console.log(this.props.bodyContent);

    return (
      <div ref={ref => this.outerContainer = ref} >
        <Dialog actions={[<FlatButton label='Close' onClick={_ => this.setState({imagePanelOpen: false})}/>]}
        autoScrollBodyContent title='Upload Image' open={state.imagePanelOpen} onRequestClose={_ => this.setState({imagePanelOpen: false})}>
          <div style={{margin: '10px 0'}} className='horizontal-center'>Drag n' Drop the image file into the editor</div>
          <div className='horizontal-center'>OR</div>
          <div className='vertical-center horizontal-center' style={{margin: '15px 0'}}>
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
              <RaisedButton style={{margin: 5}} label='Submit' onClick={this.onOnlineImageUpload}/>
            </div>
          </div>
          <div className='horizontal-center'>OR</div>
          <div className='vertical-center horizontal-center' style={{margin: '10px 0'}}>
            <RaisedButton label='Upload from File' onClick={_ => this.imgDropzone.open()}/>
          </div>
        </Dialog>
        <Dropzone ref={(node) => (this.imgDropzone = node)} style={{display: 'none'}} onDrop={this.onImageUploadClicked} />
      {props.controlsPosition === 'top' &&
        <div className='horizontal-center'>
          <Paper
          zDepth={1}
          className='vertical-center'
          style={controlsStyle}
          onMouseEnter={e => this.setState({onHoverToolbar: true})}
          onMouseLeave={e => this.setState({onHoverToolbar: false})}
          >
            <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
            inlineStyles={INLINE_STYLES}
            tooltipPosition='bottom-center'
            />
            <EntityControls
            editorState={editorState}
            entityControls={this.ENTITY_CONTROLS}
            tooltipPosition='bottom-center'
            />
            <ExternalControls
            editorState={editorState}
            externalControls={this.EXTERNAL_CONTROLS}
            active={props.files.length > 0}
            tooltipPosition='bottom-center'
            />
            <PositionStyleControls
            editorState={editorState}
            blockTypes={POSITION_TYPES}
            onToggle={this.toggleBlockType}
            tooltipPosition='bottom-center'
            />
            <FontSizeControls
            editorState={editorState}
            onToggle={this.onFontSizeToggle}
            inlineStyles={FONTSIZE_TYPES}
            tooltipPosition='bottom-center'
            />
            <TypefaceControls
            editorState={editorState}
            onToggle={this.onTypefaceToggle}
            inlineStyles={TYPEFACE_TYPES}
            tooltipPosition='bottom-center'
            />
            <ColorPicker
            editorState={editorState}
            onToggle={this.onColorToggle}
            />
          </Paper>
        </div>}
      {props.onSubjectChange &&
        <Subject
        {...props.subjectParams}
        width={props.width}
        onSubjectChange={props.onSubjectChange}
        subjectHtml={props.subjectHtml}
        fieldsmap={props.fieldsmap}
        rawSubjectContentState={props.rawSubjectContentState}
        />}
      {props.allowGeneralizedProperties && state.currentFocusPosition !== null && this.outerContainer !== null &&
        <div style={{
          position: 'fixed',
          top: state.currentFocusPosition.top,
          left: this.outerContainer.getBoundingClientRect().left - 60,
        }} >
          <IconButton
          tooltip='Insert Property'
          tooltipPosition='bottom-center'
          iconClassName='fa fa-plus-square-o'
          onClick={this.onPropertyIconClick}
          />
        </div>}
        <BodyEditorContainer width={props.width} height={props.height} >
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
            customStyleMap={customStyleMap}
            customStyleFn={props.overwriteCustomStyleFn || customStyleFn}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            handleReturn={this.handleReturn}
            handlePastedText={this.handlePastedText}
            handleDroppedFiles={this.handleDroppedFiles}
            handleBeforeInput={this.handleBeforeInput}
            handleDrop={this.handleDrop}
            onTab={this.onTab}
            onChange={this.onChange}
            placeholder={props.placeholder || placeholder}
            onBlur={e => {
              e.preventDefault();
               if (editorState.getSelection().isCollapsed() && !state.onHoverToolbar) this.setState({showToolbar: false});
            }}
            keyBindingFn={myKeyBindingFn}
            ref='editor'
            spellCheck
            />
          </div>
        </BodyEditorContainer>
      {(!props.controlsPosition || props.controlsPosition === 'bottom') &&
        <Paper zDepth={1} className='row vertical-center clearfix' style={controlsStyle} >
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
          {/*<BlockStyleControls
          editorState={editorState}
          blockTypes={BLOCK_TYPES}
          onToggle={this.toggleBlockType}
          />*/}
        </Paper>}
      </div>
    );
  }
}


const extendedBlockRenderMap = Draft.DefaultDraftBlockRenderMap.merge(blockRenderMap);

const mapStateToProps = (state, props) => {
  return {
    files: state.emailAttachmentReducer.attached,
    templateChanged: state.emailDraftReducer.templateChanged,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    setAttachments: files => dispatch({type: 'SET_ATTACHMENTS', files}),
    clearAttachments: _ => dispatch({type: 'CLEAR_ATTACHMENTS'}),
    uploadImage: file => dispatch(imgActions.uploadImage(file)),
    // saveImageData: src => dispatch({type: 'IMAGE_UPLOAD_RECEIVE', src}),
    onAttachmentPanelOpen: _ => dispatch({type: 'TURN_ON_ATTACHMENT_PANEL'}),
    turnOffTemplateChange: _ => dispatch({type: 'TEMPLATE_CHANGE_OFF'}),
    clearCacheBodyHtml: _ => dispatch({type: 'CLEAR_CACHE_BODYHTML'})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GeneralEditor);
