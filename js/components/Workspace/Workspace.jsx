import React, { Component } from 'react';
import {connect} from 'react-redux';
import {actions as templateActions} from 'components/Email/Template';
import withRouter from 'react-router/lib/withRouter';
import GeneralEditor from 'components/Email/GeneralEditor';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import Collapse from 'react-collapse';
import Slider from 'rc-slider';
import alertify from 'utils/alertify';
import {blue50, blue100, blue200, blueGrey50, blueGrey100,
  blue500, blueGrey400, blueGrey600, blueGrey800} from 'material-ui/styles/colors';
import isJSON from 'validator/lib/isJSON';
import find from 'lodash/find';
import styled from 'styled-components';
import {convertToRaw} from 'draft-js';
import draftRawToHtml from 'components/Email/EmailPanel/utils/draftRawToHtml';
import {FONTSIZE_TYPES} from 'components/Email/EmailPanel/utils/typeConstants';
import TextField from 'material-ui/TextField';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import PlainIconButton from 'components/ListTable/PlainIconButton';

const MainSection = styled.div`
  display: flex;
  flex-grow: 2;
  justify-content: center;
  order: 1;
  padding-bottom: 40px;
`;

const SideSection = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  flex-grow: 1;
  flex-basis: 170px;
  max-width: 200px;
  order: -1;
  z-index: 100;
`;

const TabButton = styled.span`
  flex: 1;
  padding: 5px 15px;
  background-color: ${props => props.active ? blue50 : '#fff'};
  border: ${props => props.active && `2px solid ${blue200}`};
  text-align: center;
  font-size: 0.8em;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background-color: ${props => !props.active && blue50};
  }
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
`;

const LoadingIcon = styled.i.attrs({
  className: 'fa fa-spin fa-spinner'
})`
  color: ${blueGrey600};
`;

function createMarkUp(html) {
  return { __html: html };
}

const overwriteCustomStyleFn = style => {
  const styleNames = style.toJS();
  // console.log(styleNames);
  return styleNames.reduce((styles, styleName) => {
    if (styleName.startsWith('COLOR-')) {
      styles.color = styleName.split('COLOR-')[1];
    }
    if (styleName.startsWith('SIZE-')) {
      styles.fontSize = parseFloat(styleName.split('SIZE-')[1]) + 4 + 'pt';
    }
    return styles;
  }, {});
}

const EDITOR_DISTANCE_FROM_TOP = 80;

const DEFAULT_PADDING = 65 + 100 + 40; // top bar height + utility bar height + padding
const MIN_WIDTH = 600;
const MIN_HEIGHT = 530;
class Workspace extends Component {
  constructor(props) {
    super(props);

    const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    let height = Math.floor(screenHeight - DEFAULT_PADDING);
    if (height < MIN_HEIGHT) height = MIN_HEIGHT; // set some minimal height
    // console.log(screenWidth)
    // console.log(screenHeight);
    this.state = {
      subject: '', // original
      mutatingSubject: '', // editted
      subjectContentState: '', // current contentstate
      body: '',
      mutatingBody: '',
      bodyContentState: '',
      open: false,
      anchorEl: null,
      useExisting: false,
      showToolbar: false,
      width: 600,
      height: height,
      mode: 'writing',
      screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 900),
      templateName: ''
    };
    this.onSubjectChange = this.onSubjectChange.bind(this);
    this.onBodyChange = this.onBodyChange.bind(this);
    this.handleTemplateChange = this.handleTemplateChange.bind(this);
    this.onClearEditor = this.onClearEditor.bind(this);
    this.onSaveNewTemplateClick = this.onSaveNewTemplateClick.bind(this);
    this.onSaveCurrentTemplateClick = this.onSaveCurrentTemplateClick.bind(this);
    this.saveNameOnBlur = this.saveNameOnBlur.bind(this);

    // window.onresize = _ => {
    //   const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    //   const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    //   this.setState({screenWidth, screenHeight});
    // };
  }

  componentWillMount() {
  }

  componentDidMount() {
    if (this.props.template) {
      this.handleTemplateChange(this.props.template);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.template && this.props.template !== nextProps.template) {
      this.handleTemplateChange(nextProps.template);
    }

    if (nextProps.template && this.props.params.templateId !== nextProps.params.templateId) {
      this.handleTemplateChange(nextProps.template);
    }
  }

  componentWillUnmount() {
    // window.onresize = undefined;
  }

  onBodyChange(html, raw) {
    this.setState({mutatingBody: html, bodyContentState: raw});
  }

  onClearEditor() {
    this.setState({
      subject: 'clear', // original
      mutatingSubject: '', // editted
      subjectContentState: '', // current contentstate
      body: 'clear',
      mutatingBody: '',
      bodyContentState: '',
      useExisting: false,
    },
    _ => {
      // Hack!! add something to editor then clearing it to triggle in componentWillReceiveProps
      this.setState({subject: '', body: ''});
    });
  }

  handleTemplateChange(template) {
    if (!!template) {
      let subject = template.subject;
      this.setState({
        subject,
        mutatingSubject: subject,
        useExisting: true,
        templateName: template.name.length > 0 ? template.name : template.subject,
        currentTemplateId: template.id
      });
      if (isJSON(template.body)) {
        const templateJSON = JSON.parse(template.body);
        if (templateJSON.subjectData) subject = templateJSON.subjectData;
        this.setState({body: templateJSON.data, subject});;
      } else {
        this.setState({body: template.body});
      }
    }
  }

  onSubjectChange(contentState) {
    const subjectContent = contentState;
    const subjectBlock = contentState.getBlocksAsArray()[0];
    const subject = subjectBlock.getText();
    let mutatingSubject = '';
    let lastOffset = 0;
    subjectBlock.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity();
        if (entityKey === null) return false;
        return (contentState.getEntity(entityKey).getType() === 'PROPERTY');
      },
      (start, end) => {
        const {property} = subjectContent.getEntity(subjectBlock.getEntityAt(start)).getData();
        mutatingSubject += (subject.slice(lastOffset, start) + `<%= ${property} %>`);
        lastOffset = end;
      });
    mutatingSubject += subject.slice(lastOffset, subject.length);
    const subjectContentState = convertToRaw(subjectContent);

    this.setState({mutatingSubject, subjectContentState});
  }
  
  onSaveNewTemplateClick() {
    alertify.promisifyPrompt(
      '',
      'Name the New Email Template',
      ''
      )
    .then(
      name => {
        mixpanel.track('save_new_template_from_workspace');
        this.props.createTemplate(
          name,
          this.state.mutatingSubject || this.state.subject,
          JSON.stringify({type: 'DraftEditorState', data: this.state.bodyContentState, subjectData: this.state.subjectContentState})
          )
        .then(currentTemplateId => this.setState({currentTemplateId}, _ => this.props.router.push(`/workspace/${currentTemplateId}`)));
      },
      _ => console.log('template saving cancelled')
      );
  }

  onSaveCurrentTemplateClick() {
    mixpanel.track('edit_template_from_workspace');
    this.props.saveCurrentTemplate(
      this.state.currentTemplateId,
      this.state.mutatingSubject,
      JSON.stringify({type: 'DraftEditorState' , data: this.state.bodyContentState, subjectData: this.state.subjectContentState})
      );
  }

  saveNameOnBlur(e) {
    const defaultName = this.props.template.name.length > 0 ? this.props.template.name : this.props.template.subject;
    const newName = this.state.templateName;
    if (newName !== defaultName) {
      this.props.changeTemplateName(this.props.template.id, newName);
    }
  }

  render() {
    const state = this.state;
    const props = this.props;

    return (
      <div style={{display: 'flex', flexDirection: 'column'}} >
        <TopBar>
          <div className='vertical-center' style={{marginTop: 10}} >
            <PlainIconButton
            label='Clear Editor'
            className='fa fa-eraser'
            onClick={this.onClearEditor}
            margin='3px 0px 3px 30px'
            />
            <PlainIconButton
            className='fa fa-file-text-o'
            disabled={!state.bodyContentState || !state.subjectContentState}
            onClick={props.template ? this.onSaveCurrentTemplateClick : this.onSaveNewTemplateClick}
            label='Save'
            margin='3px 20px'
            />
          {this.props.template &&
            <PlainIconButton
            className='fa fa-file-o'
            disabled={!state.bodyContentState || !state.subjectContentState}
            onClick={this.onSaveNewTemplateClick}
            label='Save New'
            margin='3px 30px 3px 0px'
            />}
          {this.props.template &&
            <div>
              <TextField
              floatingLabelFixed
              name='template-name'
              value={state.templateName}
              onChange={e => this.setState({templateName: e.target.value})}
              floatingLabelText='Template Name'
              onBlur={this.saveNameOnBlur}
              />
            {this.props.isLoading &&
              <LoadingIcon />}
            </div>}
          </div>
          <div className='vertical-center'>
            <span style={{fontSize: '0.7em', color: blueGrey800}} >{`Viewport ${(state.width/state.screenWidth * 100).toFixed(0)}%`}</span>
            <div style={{display: 'block', width: 120, marginRight: 10, marginLeft: 5}} > 
              <Slider
              min={200} max={state.screenWidth} step={1}
              onChange={width => this.setState({width})}
              value={state.width}
              />
            </div>
            <div style={{display: 'block'}} >
              <TabButton active={state.mode === 'writing'} onClick={_ => this.setState({mode: 'writing'})}>Writing Mode</TabButton>
              <TabButton active={state.mode === 'preview'} onClick={_ => this.setState({mode: 'preview'})}>HTML Preview</TabButton>
            </div>
          </div>
        </TopBar>
        <div style={{display: 'flex'}}>
          <MainSection>
            <div style={{display: state.mode === 'writing' ? 'block' : 'none'}} >
              <GeneralEditor
              onEditMode
              allowReplacement
              allowGeneralizedProperties
              allowToolbarDisappearOnBlur
              containerClassName='RichEditor-editor-workspace'
              width={state.width}
              height='unlimited'
              debounce={500}
              bodyContent={state.body}
              rawBodyContentState={state.bodyContentState}
              subjectHtml={state.subject}
              rawSubjectContentState={state.subjectContentState}
              subjectParams={{allowGeneralizedProperties: true, style: {marginTop: EDITOR_DISTANCE_FROM_TOP, marginBottom: 15}}}
              controlsStyle={{zIndex: 100, marginBottom: 15, position: 'fixed', backgroundColor: '#ffffff'}}
              controlsPosition='top'
              onBodyChange={this.onBodyChange}
              onSubjectChange={this.onSubjectChange}
              placeholder='Start building your template here...'
              overwriteCustomStyleFn={overwriteCustomStyleFn}
              />
            {/*
            */}
            </div>
          {state.mode === 'preview' &&
            <div style={{marginTop: EDITOR_DISTANCE_FROM_TOP}} >
              <div
              style={{width: state.width, borderBottom: '2px solid gray', paddingBottom: 10, marginBottom: 10}}
              dangerouslySetInnerHTML={createMarkUp(state.mutatingSubject)}
              />
              <div
              style={{width: state.width}}
              dangerouslySetInnerHTML={createMarkUp(state.mutatingBody)}
              />
            </div>}
          </MainSection>
        </div>
      </div>
    );
  }
}

const styles = {
  transformNone: {textTransform: 'none'},
};

export default connect(
  (state, props) => ({
    isLoading: state.templateReducer.isReceiving,
    template: props.params.templateId !== 'new-template' && state.templateReducer[parseInt(props.params.templateId)],
  }),
  dispatch => ({
    saveCurrentTemplate: (id, subject, body) => dispatch(templateActions.patchTemplate(id, subject, body)),
    changeTemplateName: (id, name) => dispatch(templateActions.patchTemplateName(id, name)),
    createTemplate: (name, subject, body) => dispatch(templateActions.createTemplate(name, subject, body)),
  })
  )(withRouter(Workspace));
