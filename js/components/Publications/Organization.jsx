import React from 'react';
import {grey700, grey200} from 'material-ui/styles/colors';

const styles = {
  span: {
    marginRight: 10,
    color: grey700,
    fontSize: '0.9em'
  },
  title: {color: grey700},
  container: {margin: 5},
  imgContainer: {margin: 20},
  panel: {
    margin: '20px 0',
    padding: '10px 0',
    border: `solid 1px ${grey200}`
  }
};

const Organization = ({name, approxEmployees, contactInfo, founded, images, keywords, links, logo}) => {
  return (
  <div className='row' style={styles.panel}>
    <div style={styles.container} className='large-12 medium-12 small-12 columns'>
      <h5 style={styles.title}>Organization</h5>
    </div>
    <div className='large-12 medium-12 small-12 columns'>
      <span style={styles.span}>Name:</span><span>{name}</span>
    </div>
    <div className='large-12 medium-12 small-12 columns'>
      <span style={styles.span}>Approx. Employees:</span><span>{approxEmployees}</span>
    </div>
    <div className='large-12 medium-12 small-12 columns'>
      <span style={styles.span}>Founded:</span><span>{founded}</span>
    </div>
    <div className='large-12 medium-12 small-12 columns'>
    {contactInfo && contactInfo.addresses &&
      <div>
        <span style={styles.span}>Location:</span><span>{contactInfo.addresses.map(addr => `${addr.locality}, ${addr.region.name}`)[0]}</span>
      </div>}
    </div>
  {logo &&
    <div className='large-12 medium-12 small-12 columns horizontal-center'>
      <img style={styles.imgContainer} src={logo}/>
    </div>}
  </div>);
};

export default Organization;
