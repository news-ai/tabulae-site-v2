// @flow
import React from 'react';
import {grey400, grey600} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';

type Types = {
  name: string,
  size: number,
  preview: string,
  onRemoveClick: (event: Event) => void,
  maxLength: number
};

const AttachmentPreview = ({name, size, preview, onRemoveClick, maxLength}: Types) => {
  return (
    <div style={{margin: 5}}>
      <div>
        <span style={{fontSize: '0.9em'}}>{name.length > maxLength - 4 ? `${name.substring(0, maxLength)} ...` : name}</span>
        <FontIcon
        color={grey600}
        hoverColor={grey400}
        style={{fontSize: '16px', margin: '0 8px'}}
        className='fa fa-times pointer'
        onClick={onRemoveClick}
        />
      </div>
      <div>
        <span style={{fontSize: '0.8em'}}>{size} bytes</span>
      </div>
      {/*preview &&
      <img width={100} height={100} src={preview}/>*/}
    </div>
    );
};

export default AttachmentPreview;
