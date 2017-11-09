import React from 'react';

const EmptyListStatement = ({className, style}) => (
  <div className={className} style={style}>
    <div>
      <p>You haven't added any contact. You will see a master sheet of them here after you added some.</p>
      <ul>
        <li>"Add Contact" icon on top to add ONE contact</li>
        <li>Go back to Home and "Upload from Existing" Excel sheet</li>
        <li>Want to use same columns as an another list? Use "Apply Presets" by clicking on <i className='fa fa-table' /> icon</li>
      </ul>
    </div>
  </div>);

export default EmptyListStatement;
