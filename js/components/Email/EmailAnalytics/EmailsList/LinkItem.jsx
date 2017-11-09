import React from 'react';
import {grey600} from 'material-ui/styles/colors';

const spanStyle = {margin: '0 5px', color: grey600, fontSize: '0.9em'};

const LinkItem = ({link, count}) => {
  return (
    <div className='row vertical-center' style={{margin: '5px 0'}}>
      <div className='large-6 medium-8 small-8'>
        <span style={spanStyle}>{link}</span>
      </div>
      <div className='large-2 medium-3 small-4 columns'>
        <span>{count}</span>
      </div>
    </div>);
};

export default LinkItem;
