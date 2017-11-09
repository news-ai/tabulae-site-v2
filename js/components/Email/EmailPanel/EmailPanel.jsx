// @flow
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as feedActions} from 'components/ContactProfile/RSSFeed';
import {actions as contactActions} from 'components/Contacts';
import {actions as listActions} from 'components/Lists';
import {actions as publicationActions} from 'components/Publications';
import {actions as fileActions} from 'components/ImportFile';
import {actions as loginActions} from 'components/Login';
import {actions as stagingActions} from 'components/Email';
import {actions as templateActions} from 'components/Email/Template';
import get from 'lodash/get';
import find from 'lodash/find';
import isEmail from 'validator/lib/isEmail';
import isEmpty from 'lodash/isEmpty';
import isJSON from 'validator/lib/isJSON';

import Select from 'react-select';

import ReactTooltip from 'react-tooltip'
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import IconMenu from 'material-ui/IconMenu';
import SelectField from 'material-ui/SelectField';
import Paper from 'material-ui/Paper';
import FontIcon from 'material-ui/FontIcon';

import PreviewEmails from '../PreviewEmails';
import FileWrapper from './FileWrapper.jsx';
import BasicHtmlEditor from './BasicHtmlEditor.jsx';
import DatePickerHOC from './DatePickerHOC.jsx';
import AddCCPanelHOC from './AddCCPanelHOC.jsx';
import SwitchEmailHOC from './SwitchEmailHOC.jsx';
import SwitchEmailDropDown from './SwitchEmailDropDown.jsx';
import PauseOverlay from './PauseOverlay.jsx';
import {convertToRaw, convertFromRaw} from 'draft-js';

import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import './react-select-hack.css';
import './ReactTagsStyle.css';
import {blueGrey50, grey50, grey600, grey700, grey800, red800, blue400, lightBlue500, blue50} from 'material-ui/styles/colors';
import {_getter} from 'components/ListTable/helpers';
import replaceAll from 'components/Email/EmailPanel/utils/replaceAll';
import triggerNewEntityFormatWarning from 'components/Email/EmailPanel/utils/triggerNewEntityFormatWarning';
import styled from 'styled-components';
import alertify from 'utils/alertify';

function NameOptionRenderer (option) {
  const classNames = ['nameOption'];

  if (option.type === 'header') {
    classNames.push('nameHeader');

    return (
      <div className={classNames.join(' ')} >
        {option.label}
      </div>
    )
  } else {

    return (
      <div className={classNames.join(' ')} >
        {option.label}
      </div>
    )
  }
}

const TemplateBar = styled.div`
  padding: 3px 10px;
  position: fixed;
  bottom: 0px;
  width: 100%;
  z-index: 500;
  display: ${props => props.isPreveiwOpen ? 'none' : 'flex'};
  background-color: ${blueGrey50};
`;

const EditorShowingContainer = styled.div`
  z-index: 300;
  display: ${props => props.isPreveiwOpen ? 'none' : 'block'};
`;

const EditorContainer = styled.div.attrs({className: 'RichEditor-root'})`
  width: ${props => props.width - 20}px;
  height: 580px;
  padding: 0 10px;
`;

const TopBarContainer = styled.div`
  display: flex;
  align-items: center;
  z-index: 700;
  padding: 5px 20px;
  background-color: ${blueGrey50};
  position: fixed;
  top: 0;
  width: 100%;
`;

class EmailPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subjectContentState: null,
      subjectHtml: null,
      subject: '',
      fieldsmap: [],
      currentTemplateId: 0,
      bodyContentState: null,
      bodyHtml: '',
      body: '',
      minimized: false,
      isPreveiwOpen: false,
      dirty: false,
      isReceiving: false,
      tempPreviewLabel: undefined,
      isReceivingLabel: undefined,
    };
    this.checkMembershipLimit = this.checkMembershipLimit.bind(this);
    this.updateBodyHtml = (html, rawContentState) => {
      this.setState({body: html, bodyContentState: rawContentState, dirty: true});
      this.props.saveContentState(rawContentState);
    };
    this.handleTemplateChange = this.handleTemplateChange.bind(this);
    this.onPreviewEmailsClick = this._onPreviewEmailsClick.bind(this);
    this.onSubjectChange = this.onSubjectChange.bind(this);
    this.getGeneratedHtmlEmails = this._getGeneratedHtmlEmails.bind(this);
    this.sendGeneratedEmails = this._sendGeneratedEmails.bind(this);
    this.onSaveNewTemplateClick = this._onSaveNewTemplateClick.bind(this);
    this.onSaveCurrentTemplateClick = this._onSaveCurrentTemplateClick.bind(this);
    this.onDeleteTemplate = this._onArchiveTemplate.bind(this);
    this.onClearClick = this._onClearClick.bind(this);
    this.checkEmailDupes = this._checkEmailDupes.bind(this);
    this.changeEmailSignature = this._changeEmailSignature.bind(this);
    this.loadAllContactsIfRequired = this._loadAllContactsIfRequired.bind(this);

    // cleanups
    this.onEmailSendClick = _ => this.checkMembershipLimit()
    .then(_ => new Promise(resolve => {
      this.setState({
        isReceiving: true,
        isReceivingLabel: 'Loading contacts...this step might take a while if list is large...'
      });
      resolve(true);
    }))
    .then(this.loadAllContactsIfRequired)
    .then(_ => new Promise(resolve => {
      this.setState({
        isReceiving: true,
        isReceivingLabel: 'Checking Email Validity...'
      });
      resolve(true);
    }))
    .then(this.checkEmailDupes)
    .then(_ => new Promise(resolve => {
      this.setState({
        isReceiving: true,
        isReceivingLabel: 'Generating Preview...'
      });
      resolve(true);
    }))
    .then(this.onPreviewEmailsClick)
    .then(_ => new Promise(resolve => {
      this.setState({isReceiving: false, isReceivingLabel: undefined})
      resolve(true);
    }))
    .catch(err => this.setState({
      isReceiving: false,
      isReceivingLabel: undefined
    }))
  }

  componentWillMount() {
    this.props.fetchTemplates();
    this.props.initializeEmailDraft();
    // figure out if trial user or not
    this.props.getEmailMaxAllowance();
  }

  componentDidMount() {
    // treats it like a template
    this.changeEmailSignature(this.props.emailsignature);
  }

  componentWillReceiveProps(nextProps) {
    // add immutable here
    const fieldsmap = nextProps.fieldsmap;
    this.setState({fieldsmap});

    if (this.props.from !== nextProps.from) {
      // from email changed
      let emailsignature = nextProps.emailsignature;
      this.changeEmailSignature(nextProps.emailsignature)
    }
  }

  componentWillUnmount() {
    this.props.clearUTCTime();
    this.props.initializeEmailDraft();
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

    this.setState({subject: mutatingSubject, subjectContentState: convertToRaw(subjectContent)});
  }

  _changeEmailSignature(emailsignature) {
    // check if want to replace
    if (emailsignature && emailsignature !== null) {
      if (isJSON(emailsignature)) {
        const sign = JSON.parse(emailsignature);
        this.setState({bodyContentState: sign.data});
        this.props.saveContentState(sign.data);
      } else {
        this.props.setBodyHtml(emailsignature);
        this.setState({bodyHtml: emailsignature});
      }
      this.props.turnOnTemplateChange('append', 'EMAIL_SIGNATURE');
      setTimeout(_ => this.setState({dirty: false}), 1000);
    }
  }

  _onArchiveTemplate() {
    this.props.toggleArchiveTemplate(this.state.currentTemplateId)
    .then(_ => this._handleTemplateValueChange(null, null, 0));
    setTimeout(_ => this.setState({dirty: false}), 10);
  }

  _onSaveNewTemplateClick() {
    alertify.promisifyPrompt(
      '',
      'Name the New Email Template',
      ''
      )
    .then(
      name => {
        this.props.createTemplate(
          name,
          this.state.subject,
          JSON.stringify({type: 'DraftEditorState', data: this.state.bodyContentState, subjectData: this.state.subjectContentState})
          )
        .then(currentTemplateId => {
          this.setState({currentTemplateId}, _ => {
            setTimeout(_ => {
              this.setState({dirty: false});
            }, 10);
          });
        });
      },
      _ => console.log('template saving cancelled')
      );
  }

  _onSaveCurrentTemplateClick() {
    this.props.onSaveCurrentTemplateClick(
      this.state.currentTemplateId,
      this.state.subject,
      JSON.stringify({type: 'DraftEditorState' , data: this.state.bodyContentState, subjectData: this.state.subjectContentState})
      );
    setTimeout(_ => this.setState({dirty: false}), 10);
  }

  handleTemplateChange(obj) {
    const templateId = obj !== null ? obj.value : null;

    const onPostTemplateProcessing = () => {
      this.setState({currentTemplateId: templateId});
      this.props.turnOnTemplateChange();
      setTimeout(_ => {
        this.changeEmailSignature(this.props.emailsignature)
        this.setState({dirty: false});
      }, 1000);
    };

    if (templateId !== null) {
      const template = find(this.props.templates, tmp => templateId === tmp.id);
      const subjectHtml = template.subject;
      const bodyHtml = template.body;
      this.setState({subjectHtml});
      if (isJSON(template.body)) {
        const templateJSON = JSON.parse(template.body);
        if (templateJSON.date) {
          window.Intercom('trackEvent', 'use_prev_email_template', {date: templateJSON.date});
          mixpanel.track('use_prev_email_template', {date: templateJSON.date});
        }

        if (templateJSON.subjectData) {
          this.setState({subjectHtml: templateJSON.subjectData});
        }

        return triggerNewEntityFormatWarning(templateJSON.data)
        .then(rawContentState => {
          // triggerNewEntityFOrmatWarning returns templateJSON.data if denied
          this.setState({bodyContentState: rawContentState});
          this.props.saveContentState(rawContentState);
          onPostTemplateProcessing();
          return;
        });
      } else {
        // TODO: do normal detect warning without attempting to replace entities
        this.props.setBodyHtml(bodyHtml);
        this.setState({bodyHtml, subjectHtml});
      }
    } else {
      this.setState({bodyHtml: '', subjectHtml: ''});
    }
    onPostTemplateProcessing();
  }

  _getGeneratedHtmlEmails(selectedContacts, subject, body) {
    let emptyFields = [];
    const contactEmails = selectedContacts.reduce((acc, contact, i) => {
      if (contact && contact !== null) {
        const bodyObj = replaceAll(body, selectedContacts[i], this.state.fieldsmap);
        const subjectObj = replaceAll(subject, selectedContacts[i], this.state.fieldsmap);

        let emailObj = {
          listid: this.props.listId,
          to: contact.email,
          subject: subjectObj.html,
          body: bodyObj.html,
          contactid: contact.id,
          templateid: this.state.currentTemplateId,
          cc: this.props.cc.map(item => item.text),
          bcc: this.props.bcc.map(item => item.text),
          fromemail: this.props.from,
        };
        if (this.props.scheduledtime !== null) {
          emailObj.sendat = this.props.scheduledtime;
        }
        if (subjectObj.numPropertiesUsed > 0) {
          emailObj.baseSubject = subject;
        }
        const fields = [...bodyObj.emptyFields, ...subjectObj.emptyFields];
        if (fields.length > 0) {
          emptyFields = [
          ...emptyFields,
          {
            email: contact.email,
            fields: fields
          }
          ];
        }
        acc.push(emailObj);
      }
      return acc;
    }, []);

    return {contactEmails, emptyFields};
  }

  _sendGeneratedEmails(contactEmails) {
    return this.props.postEmails(contactEmails)
    .then(
      _ => this.setState({isPreveiwOpen: true}),
      err => {
        alertify.alert(err.toString());
      });
  }

  checkMembershipLimit() {
    return new Promise((resolve, reject) => {
      const {selectedContacts, dailyEmailsAllowed, numEmailsSentToday, membershipPlan} = this.props;
      if (selectedContacts.length + numEmailsSentToday > dailyEmailsAllowed) {
        alertify.alert(
          `Exceeding Membership Limit: ${membershipPlan}`,
          `
          You only have <span style='color:red'>${dailyEmailsAllowed - numEmailsSentToday < 0 ? 0 : dailyEmailsAllowed - numEmailsSentToday} emails left available</span> on your plan based on your daily email allowance on your current plan (${dailyEmailsAllowed} emails/day). You have selected ${selectedContacts.length} contacts to email. <a href='https://tabulae.newsai.org/api/billing'>Upgrade your membership today.</a></span>
          `
          )
        reject();
      } else {
        resolve(true);
      }
    })
  }

  _loadAllContactsIfRequired() {
    const bodyContentState = this.state.bodyContentState;
    const subjectContentState = this.state.subjectContentState;
    if (this.props.selectedContacts.length === this.props.selected.length) {
      return Promise.resolve(true);
    } else {
      return new Promise((resolve, reject) => {
        this.setState({isReceiving: true, tempPreviewLabel: 'Loading...'});
        this.props.loadAllContacts()
        .then(_ => {
          this.setState({isReceiving: false, tempPreviewLabel: undefined});
          resolve(true);
        });
      });
    }
  }

  _checkEmailDupes() {
    return new Promise((resolve, reject) => {
      const {selectedContacts} = this.props;
      // check dupes
      let seen = {};
      let dupMap = {};
      let dupes = [];
      selectedContacts.map(contact => {
        if (isEmpty(contact.email)) return;
        if (seen[contact.email]) {
          dupes.push(contact.id);
          dupMap[contact.email] = true;
        }
        else seen[contact.email] = true;
      });

      if (Object.keys(dupMap).length > 0) {
        let cancelDelivery = false;
        alertify.confirm(
          'Duplicate Email Warning',
          `We found email duplicates selected: ${Object.keys(dupMap).join(', ')}. Are you sure you want to continue?`,
          () => resolve(true),
          () => reject(dupMap)
          );
      } else {
        resolve(true);
      }
    })
  }

  _onPreviewEmailsClick() {
    const {selectedContacts} = this.props;
    const {subject, body} = this.state;

    if (selectedContacts.length === 0) {
      alertify.alert(`Contact Selection Error`, `You didn't select any contact to send this email to.`, function() {});
      return;
    }
    
    let validEmailContacts = [];
    let invalidEmailContacts = [];
    selectedContacts.map(contact => {
      if (contact.email !== null && contact.email.length > 0 && isEmail(contact.email)) validEmailContacts.push(contact);
      else invalidEmailContacts.push(contact);
    });
    const {contactEmails, emptyFields} = this.getGeneratedHtmlEmails(validEmailContacts, subject, body);

    return Promise.resolve()
    .then(_ =>
      new Promise((resolve, reject) => {
        if (emptyFields.length > 0) {
          alertify.confirm(
            `Empty properties found. Are you sure you want to continue?`,
            `Found ${emptyFields.length} contacts with empty selected property: ${emptyFields.map(({email, fields}) => `${email}:[${fields.join(', ')}]`).join(', ')}`,
            resolve,
            reject
            );
          } else {
            resolve();
          }
        })
      )
    .then(_ =>
      new Promise((resolve, reject) => {
        if (invalidEmailContacts.length > 0) {
          alertify.confirm(
            `Invalid Email Addresses Found`,
            `Would you like to ignore these and continue with valid emails? Found ${invalidEmailContacts.length} email(s) with invalid format: ${invalidEmailContacts.map(contact => contact.email).join(',')}.`,
            resolve,
            reject
            );
        } else {
          resolve();
        }
      })
    )
    .then(_ =>
      new Promise((resolve, reject) => {
        if (subject.length === 0) {
          alertify.confirm(
            `Empty Field Warning`,
            `Your subject is empty. Are you sure you want to send this email?`,
            resolve,
            reject
            );
        } else {
          resolve();
        }
      })
    )
    .then(_ =>
      new Promise((resolve, reject) => {
        if (body.length === 0) {
          alertify.confirm(
            `Empty Field Warning`,
            `Your body is empty. Are you sure you want to send this email?`,
            resolve,
            reject
            );
        } else {
          resolve();
        }
      })
    )
    .then(_ => {
      console.log('SENDING EMAILS');
      if (contactEmails.length > 0) return this.sendGeneratedEmails(contactEmails);
    })
    .catch(_ => {
      console.log('CANCELLED');
    });
  }

  _onClearClick() {
    if (this.state.dirty) {
      alertify.promisifyConfirm(
        'Are you sure?',
        'Resetting the editor will cause your subject/body to be discarded.',
        )
      .then(this.props.onReset)
      .catch(err => {});
    } else {
      this.props.onReset();
    }
  }

  render() {
    const state = this.state;
    const props = this.props;

    let options = [];
    if (props.templates.length > 0) {
      const {recent, saved} = props.templates
      .reduce(({recent, saved}, template) => {
        if (isJSON(template.body) && JSON.parse(template.body).date) {
          recent = [...recent, {
            label: template.name.length > 0 ? template.name : template.subject,
            value: template.id,
            type: 'name'
          }];
        } else {
          saved = [...saved, {
            label: template.name.length > 0 ? template.name : template.subject,
            value: template.id,
            type: 'name'
          }];
        }
        return {recent, saved};
      }, {recent: [], saved: []});
      options = [
        {label: 'Recently Sent Emails', type: 'header', disabled: true},
        ...recent,
        {label: 'Saved Templates', type: 'header', disabled: true},
        ...saved
      ]
    }

    return (
      <div style={styles.container} >
        <EditorShowingContainer isPreveiwOpen={state.isPreveiwOpen} >
          <FileWrapper open={props.isAttachmentPanelOpen} onRequestClose={props.onAttachmentPanelClose} />
          <TopBarContainer>
            <span style={styles.sentFromText} className='text'>Emails are sent from: </span>
            <SwitchEmailDropDown listId={props.listId} />
            <div style={styles.clearEditorBtn}>
              <FlatButton label='Clear Editor' labelStyle={styles.textTransformNone} onClick={this.onClearClick} />
            </div>
            <div
            onClick={props.onAttachmentPanelOpen}
            className='pointer'
            style={Object.assign({}, styles.attachTooltip, {display: (props.files && props.files.length > 0) ? 'block' : 'none'})}
            >
              <span className='smalltext' style={{color: grey700}}>File{props.files.length > 1 && 's'} Attached</span>
            </div>
          {props.isImageReceiving &&
            <FontIcon style={styles.imageLoading} color={grey800} className='fa fa-spin fa-spinner'/>}
            <div className='vertical-center' style={styles.sendButtonContainer} >
              <RaisedButton
              backgroundColor={lightBlue500}
              labelColor='#ffffff'
              onClick={this.onEmailSendClick}
              label={state.tempPreviewLabel || 'Preview'}
              disabled={props.isReceiving || state.isReceiving}
              icon={<FontIcon color='#ffffff' className='fa fa-envelope' />}
              />
            </div>
          </TopBarContainer>
        {!state.isPreveiwOpen && props.isImageReceiving &&
          <PauseOverlay message='Image is loading.' />}
        {state.isReceiving &&
          <PauseOverlay message={state.isReceivingLabel} />}
          <EditorContainer width={props.width}>
            <BasicHtmlEditor
            listId={props.listId}
            fieldsmap={state.fieldsmap}
            width={props.width}
            bodyHtml={state.bodyHtml}
            subjectHtml={state.subjectHtml}
            onBodyChange={this.updateBodyHtml}
            onSubjectChange={this.onSubjectChange}
            debounce={500}
            />
          </EditorContainer>
        </EditorShowingContainer>
        <TemplateBar isPreveiwOpen={state.isPreveiwOpen} >
          <div className='select-up' style={{width: 350}} >
            <Select
            labelKey='label'
            valueKey='value'
            maxHeight={200}
            options={options}
            placeholder='Select Email Template'
            optionRenderer={NameOptionRenderer}
            onChange={this.handleTemplateChange}
            value={state.currentTemplateId}
            />
          </div>
          <IconMenu
          className='left'
          iconButtonElement={
            <IconButton
            iconStyle={{color: grey800}}
            tooltipPosition='top-right'
            tooltip='Templates'
            iconClassName='fa fa-cogs'
            />}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
          >
            <MenuItem
            disabled={state.currentTemplateId ? false : true}
            onClick={this.onSaveCurrentTemplateClick}
            primaryText='Save Text to Existing Template'
            />
            <MenuItem onClick={this.onSaveNewTemplateClick} primaryText='Save Text as New Template' />
            <MenuItem
            onClick={this.onDeleteTemplate}
            disabled={state.currentTemplateId ? false : true}
            primaryText='Delete Template'
            />
          </IconMenu>
          <DatePickerHOC className='left'>
          {({onRequestOpen}) =>
            <IconButton
            iconStyle={{color: props.scheduledtime === null ? grey800 : blue400}}
            onClick={onRequestOpen}
            iconClassName='fa fa-calendar'
            tooltip='Schedule & Send Later'
            tooltipPosition='top-right'
            />}
          </DatePickerHOC>
          <AddCCPanelHOC className='left' listId={props.listId}>
          {({onRequestOpen}) =>
            <IconButton
            iconStyle={{color: props.cc.length > 0 || props.bcc.length > 0 ? blue400 : grey800}}
            iconClassName='fa fa-user-plus'
            onClick={onRequestOpen}
            tooltip='CC/BCC'
            tooltipPosition='top-right'
            />}
          </AddCCPanelHOC>
        </TemplateBar>
      {
        state.isPreveiwOpen &&
        <div style={styles.previewContainer} >
          <PreviewEmails
          onClose={props.onClose}
          onBack={_ => this.setState({isPreveiwOpen: false})}
          contacts={props.selectedContacts}
          fieldsmap={state.fieldsmap}
          listId={props.listId}
          sendLater={props.scheduledtime !== null}
          isReceiving={props.isReceiving}
          previewEmails={props.previewEmails}
          width={props.width - 20}
          />
        </div>
      }
        <div style={styles.hidePanelBtn} >
          <FlatButton labelStyle={styles.textTransformNone} label='Hide Panel' onClick={props.onClose} />
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    overflowX: 'hidden', height: '100%'
  },
  smallIcon: {
    margin: '0 3px', fontSize: '14px', float: 'right'
  },
  attachTooltip: {
    zIndex: 500,
    margin: '0 15px',
  },
  imageLoading: {margin: '0 3px', fontSize: '14px'},
  hidePanelBtn: {
    position: 'fixed',
    bottom: 5,
    right: 5,
    zIndex: 500,
    backgroundColor: blueGrey50
  },
  clearEditorBtn: {
    margin: '0 5px'
  },
  previewContainer: {paddingBottom: 20, zIndex: 300},
  textTransformNone: {textTransform: 'none'},
  sentFromText: {color: grey800, marginRight: 10},
  sendButtonContainer: {position: 'fixed', right: 10},
};

const mapStateToProps = (state, props) => {
  const templates = state.templateReducer.received.map(id => state.templateReducer[id]).filter(template => !template.archived);
  const person = state.personReducer.person;
  let fromEmail = get(state, `emailDraftReducer[${props.listId}].from`) || state.personReducer.person.email
  if (person.outlook) fromEmail = person.outlookusername;
  let emailsignature;
  if (fromEmail === person.email) emailsignature = person.emailsignature || null;
  else emailsignature = person.emailsignatures !== null ? find(person.emailsignatures, sign => JSON.parse(sign).email === fromEmail) : null;
  return {
    person,
    scheduledtime: state.stagingReducer.utctime,
    isReceiving: state.stagingReducer.isReceiving,
    stagedEmailIds: state.stagingReducer.previewEmails,
    previewEmails: state.stagingReducer.previewEmails
    .map(pEmail => state.stagingReducer[pEmail.id])
    .filter(email => !email.issent),
    stagingReducer: state.stagingReducer,
    templates: templates,
    selectedContacts: props.selected.reduce((acc, id) => state.contactReducer[id] ? [...acc, state.contactReducer[id]] : acc, []),
    attachedfiles: state.emailAttachmentReducer.attached,
    isAttaching: state.emailAttachmentReducer.isReceiving,
    emailsignature: person.emailsignature || null,
    cc: get(state, `emailDraftReducer[${props.listId}].cc`) || [],
    bcc: get(state, `emailDraftReducer[${props.listId}].bcc`) || [],
    from: fromEmail,
    isImageReceiving: state.emailImageReducer.isReceiving,
    files: state.emailAttachmentReducer.attached,
    isAttachmentPanelOpen: state.emailDraftReducer.isAttachmentPanelOpen,
    emailsignature,
    ontrial: state.personReducer.ontrial,
    dailyEmailsAllowed: state.personReducer.dailyEmailsAllowed,
    numEmailsSentToday: state.personReducer.numEmailsSentToday,
    membershipPlan: state.personReducer.membershipPlan,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    onBulkSendEmails: ids => dispatch(stagingActions.bulkSendEmails(ids)),
    onSaveCurrentTemplateClick: (id, subject, body) => dispatch(templateActions.patchTemplate(id, subject, body)),
    fetchTemplates: _ => dispatch(templateActions.getTemplates()),
    createTemplate: (name, subject, body) => dispatch(templateActions.createTemplate(name, subject, body)),
    toggleArchiveTemplate: templateId => dispatch(templateActions.toggleArchiveTemplate(templateId)),
    clearUTCTime: _ => dispatch({type: 'CLEAR_SCHEDULE_TIME'}),
    postBatchEmails: emails => dispatch(stagingActions.bulkSendStagingEmails(emails)),
    postBatchEmailsWithAttachments: emails => dispatch(stagingActions.postBatchEmailsWithAttachments(emails)),
    startEmailDraft: email => dispatch({type: 'INITIALIZE_EMAIL_DRAFT', listId: props.listId, email}),
    onAttachmentPanelClose: _ => dispatch({type: 'TURN_OFF_ATTACHMENT_PANEL'}),
    onAttachmentPanelOpen: _ => dispatch({type: 'TURN_ON_ATTACHMENT_PANEL'}),
    saveContentState: editorState => dispatch({type: 'SET_EDITORSTATE', editorState}),
    turnOnTemplateChange: (changeType, entityType) => dispatch({type: 'TEMPLATE_CHANGE_ON', changeType, entityType}),
    setBodyHtml: bodyHtml => dispatch({type: 'SET_BODYHTML', bodyHtml}),
    getEmailMaxAllowance: _ => dispatch(loginActions.getEmailMaxAllowance())
  };
};

const mergeProps = (sProps, dProps, oProps) => {
  return {
    postEmails: emails => sProps.attachedfiles.length > 0 ? dProps.postBatchEmailsWithAttachments(emails) : dProps.postBatchEmails(emails),
    initializeEmailDraft: _ => dProps.startEmailDraft(sProps.person.email),
    ...sProps,
    ...dProps,
    ...oProps,
  };
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )(EmailPanel);
