import React from 'react';
import {grey700, grey200} from 'material-ui/styles/colors';

const styles = {
  panel: {
    margin: '20px 0',
    padding: '10px 0',
    border: `solid 1px ${grey200}`
  },
  titleContainer: {margin: 5},
  title: {color: grey700},
  span: {fontSize: '0.9em', color: grey700}
};

const Keywords = ({keywords}) => {
  return (
    <div className='row' style={styles.panel}>
      <div style={styles.titleContainer} className='large-12 medium-12 small-12 columns'>
        <h5 style={styles.title}>Keywords</h5>
      </div>
      <div className='large-12 medium-12 small-12 columns'>
        <span style={styles.span}>{keywords.filter((keyword, i) => i < 25).join(', ')}</span>
      </div>
    </div>
    );
};

export default Keywords;
