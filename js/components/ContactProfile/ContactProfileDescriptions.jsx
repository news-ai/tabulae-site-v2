import React from 'react';
import IconButton from 'material-ui/IconButton';

import {grey700} from 'material-ui/styles/colors';
import isEmail from 'validator/lib/isEmail';
import isURL from 'validator/lib/isURL';

import ContactDescriptor from './ContactDescriptor.jsx';
import ContactCustomDescriptions from './ContactCustomDescriptions.jsx';
import TwitterProfile from './SocialProfiles/Twitter/TwitterProfile.jsx';
import InstagramProfile from './SocialProfiles/Instagram/InstagramProfile.jsx';
import {ControlledInput} from 'components/ToggleableEditInput';

const styles = {
  smallIcon: {
    fontSize: 16,
    color: grey700
  },
  small: {
    width: 36,
    height: 36,
    padding: 2,
  },
};

const WrappedTwitter = props => {
  return (
     <TwitterProfile {...props}>
      {({onRequestOpen}) => (
        <IconButton
        iconStyle={styles.smallIcon}
        style={styles.small}
        iconClassName='fa fa-line-chart'
        tooltip='Show Profile & Engagement Data'
        tooltipPosition='top-right'
        onClick={onRequestOpen}
        />)}
      </TwitterProfile>
    );
};

const WrappedInstagram = props => {
  return (
     <InstagramProfile {...props}>
      {({onRequestOpen}) => (
        <IconButton
        id='insta_data_hop'
        iconStyle={styles.smallIcon}
        style={styles.small}
        iconClassName='fa fa-line-chart'
        tooltip='Show Profile & Engagement Data'
        tooltipPosition='top-right'
        onClick={onRequestOpen}
        />)}
      </InstagramProfile>
    );
};

const contactDescriptorClassname = 'large-12 medium-8 small-12 columns';

const ContactProfileDescriptions = ({contact, patchContact, className, list}) => {
  let instagramErrorText = null;
  if (contact.instagraminvalid) instagramErrorText = 'Invalid Instagram handle';
  else if (contact.instagramprivate) instagramErrorText = 'Instagram is private';

  let twitterErrorText = null;
  if (contact.twitterinvalid) twitterErrorText = 'Invalid Twitter handle';
  else if (contact.twitterprivate) twitterErrorText = 'Twitter is private';

  return (
    <div id='contact_profile_default_hop' className={className} style={{marginTop: 5}}>
      <div className='row' style={{margin: '5px 0'}}>
        <div className='large-12 medium-12 small-12 columns vertical-center'>
          <ControlledInput
          hideIcon
          disabled={contact.readonly}
          nameStyle={{fontSize: '1.3em'}}
          name={contact.firstname}
          onBlur={firstname => {
            if (firstname === contact.firstname) return;
            patchContact(contact.id, {firstname});
          }}/>
          <ControlledInput
          disabled={contact.readonly}
          nameStyle={{fontSize: '1.3em'}}
          name={contact.lastname}
          onBlur={lastname => {
            if (lastname === contact.lastname) return;
            patchContact(contact.id, {lastname});
          }}/>
        </div>
      </div>
      <ContactDescriptor
      disabled={contact.readonly}
      iconClassName='fa fa-envelope'
      className={contactDescriptorClassname}
      content={contact.email}
      contentTitle='Email'
      onBlur={(email) => isEmail(email) && patchContact(contact.id, {email})}/>
      <ContactDescriptor
      disabled={contact.readonly}
      iconClassName='fa fa-rss'
      className={contactDescriptorClassname}
      content={contact.blog}
      contentTitle='Blog'
      onBlur={(value) => isURL(value) && patchContact(contact.id, {blog: value})}/>
      <ContactDescriptor
      disabled={contact.readonly}
      iconClassName='fa fa-twitter'
      className={contactDescriptorClassname}
      errorText={twitterErrorText}
      content={contact.twitter}
      contentTitle='Twitter'
      onBlur={(value) => {
        window.Intercom('trackEvent', 'add_contact_twitter');
        mixpanel.track('add_contact_twitter');
        patchContact(contact.id, {twitter: value});
      }}
      extraIcons={contact.twitter && [
        <WrappedTwitter key={0} contactId={contact.id} />
        ]}
      />
      <ContactDescriptor
      disabled={contact.readonly}
      iconClassName='fa fa-instagram'
      className={contactDescriptorClassname}
      errorText={instagramErrorText}
      content={contact.instagram}
      contentTitle='Instagram'
      onBlur={(value) => {
        window.Intercom('trackEvent', 'add_contact_instagram');
        mixpanel.track('add_contact_instagram');
        patchContact(contact.id, {instagram: value});
      }}
      extraIcons={contact.instagram && [<WrappedInstagram key={0} contactId={contact.id} />]} />
      <ContactDescriptor
      disabled={contact.readonly}
      iconClassName='fa fa-linkedin'
      className={contactDescriptorClassname}
      content={contact.linkedin}
      contentTitle='LinkedIn'
      onBlur={(value) => isURL(value) && patchContact(contact.id, {linkedin: value})}/>
      <ContactDescriptor
      disabled={contact.readonly}
      iconClassName='fa fa-external-link'
      className={contactDescriptorClassname}
      content={contact.website}
      contentTitle='Website'
      onBlur={(value) => isURL(value) && patchContact(contact.id, {website: value})}
      />
      <ContactCustomDescriptions contact={contact} patchContact={patchContact} list={list} />
    </div>);
};

export default ContactProfileDescriptions;
