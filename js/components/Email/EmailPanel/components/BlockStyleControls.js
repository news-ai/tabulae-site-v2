import React from 'react';
import find from 'lodash/find';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

export default function BlockStyleControls(props) {
  const {editorState, blockTypes} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();
  const filteredBlockTypes = blockTypes.filter(type => type.style !== 'atomic');

  return (
    <DropDownMenu
    style={{width: 160}}
    value={find(blockTypes, type => type.style === blockType).label}
    onChange={(e, index, value) => props.onToggle(filteredBlockTypes[index].style)}
    >
      {filteredBlockTypes.map((type, i) => (
        <MenuItem
        key={i}
        value={type.label}
        style={{paddingLeft: 10}}
        primaryText={type.label}
        />))}
    </DropDownMenu>
  );
}
