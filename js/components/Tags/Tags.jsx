import React from 'react';
import {blue50, blue200} from 'material-ui/styles/colors';
import Tag from './Tag.jsx';

const Tags = ({className, createLink, hideDelete, tags,
  onDeleteTag, color, borderColor, whiteLabel, textStyle}) => {
  return (
    <div className={className || 'vertical-center'}>
  {tags && tags !== null && tags
    .map((name, i) =>
      <Tag
      whiteLabel={whiteLabel}
      key={`tag-${i}`}
      textStyle={textStyle}
      color={color || blue50}
      borderColor={borderColor || blue200}
      hideDelete={hideDelete}
      text={name}
      link={createLink && createLink(name)}
      onDeleteTag={_ => onDeleteTag(name)}
      />)}
    </div>);
};

export default Tags;
