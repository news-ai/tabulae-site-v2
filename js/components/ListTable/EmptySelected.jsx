import React from 'react';

const EmptySelected = ({selected}) => {
  return selected.length === 0 &&
  <div className='vertical-center horizontal-center' style={{height: 400}}>
    <span>There are 0 contacts selected. You must select contact you want to include in the graph.</span>
  </div>;
};

export default EmptySelected;
