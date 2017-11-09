import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import find from 'lodash/find';
import DropDownMenu from 'material-ui/DropDownMenu';
// import Immutable from 'immutable';

const PLACEHOLDER = '---';

export default function TypefaceControls(props) {
  const {inlineStyles, editorState} = props;
  const currentStyle = editorState.getCurrentInlineStyle();
  const currentType = find(inlineStyles, type => currentStyle.has(type.style));
  const selection = editorState.getSelection();
  let value = 'Arial';
  if (currentType) {
    value = currentType.label;
  }
  if (!selection.isCollapsed() && selection.getHasFocus() && !currentType) {
    // more than one fontSize selected
    value = PLACEHOLDER;
  }
  const menuItems = [
    <MenuItem
    key={`typeface-select-default`}
    value={PLACEHOLDER}
    primaryText={PLACEHOLDER}
    label={PLACEHOLDER}
    />,
    ...inlineStyles.map(type =>
      <MenuItem
      key={`typeface-select-${type.label}`}
      value={type.label}
      primaryText={type.label}
      label={type.label}
      />)
  ];

  return (
    <DropDownMenu
    style={{fontSize: '0.9em', maxWidth: 135}}
    underlineStyle={{display: 'none', margin: 0}}
    labelStyle={{paddingLeft: 5}}
    value={value}
    onChange={(e, index, newValue) => props.onToggle(newValue)}
    >
    {menuItems}
    </DropDownMenu>
  );
}
