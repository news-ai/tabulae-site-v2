import React from 'react';
import {grey700, grey200} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';

const socialIconClassNames = {
  'facebook': 'fa fa-facebook',
  'instagram': 'fa fa-instagram',
  'angellist': 'fa fa-angellist',
  'pinterest': 'fa fa-pinterest',
  'linkedincompany': 'fa fa-linkedin',
  'twitter': 'fa fa-twitter'
  //'crunchbasecompany': 'fa fa-',
};

const styles = {
  link: {color: grey700},
  container: {marginBottom: 5},
  icon: {fontSize: '14px', marginRight: 7},
  span: {marginRight: 10},
  titleContainer: {margin: 5}
};

const panelStyle = {
  margin: '20px 0',
  padding: '10px 0',
  border: `solid 1px ${grey200}`
};

const SocialProfile = ({url, typeName, typeId, followers}) => {
  return (
    <div className='large-4 medium-6 small-6 columns vertical-center' style={styles.container}>
      <a style={styles.link} href={url} target='_blank'>
        <span style={styles.span}>{typeName}</span>
      </a>
      <a style={styles.link} href={url} target='_blank'>
      {typeId && socialIconClassNames[typeId] &&
        <FontIcon style={styles.icon} className={socialIconClassNames[typeId]}/>}
      </a>
    {followers &&
      <span className='text'>{followers.toLocaleString()}</span>}
    </div>);
};

const SocialProfiles = ({socialProfiles}) => {
  return (
    <div className='row' style={panelStyle}>
      <div style={styles.titleContainer} className='large-12 medium-12 small-12 columns'>
        <h5 style={styles.link}>Social Profiles</h5>
      </div>
      {socialProfiles.map((profile, i) => <SocialProfile key={`socialprofile-${i}`} {...profile}/>)}
    </div>);
};


export default SocialProfiles;
